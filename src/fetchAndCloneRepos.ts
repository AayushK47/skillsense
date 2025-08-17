import dotenv from 'dotenv';
import fs from 'fs';
import axios from 'axios';
import { GitHubGraphQLResponse, GitHubRepository } from './types';
import { exec } from 'child_process';
import { promisify } from 'util';
import ora from 'ora';

dotenv.config({ quiet: true });

async function getAllRepos(username: string): Promise<GitHubRepository[]> {
  let repos: GitHubRepository[] = []
  let cursor: string | null = null
  let hasNextPage: boolean = true

  while (hasNextPage) {
    const query: string = `
      query {
        user(login: "${username}") {
          repositories(first: 5, isFork: false ${cursor ? `, after: "${cursor}"` : ''}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              name
              url
              repositoryTopics(first: 100) {
                edges {
                  node {
                    topic {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const response = await axios.post<GitHubGraphQLResponse>(process.env.GITHUB_ENDPOINT!, {
      query,
    }, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    })

      repos.push(...response.data.data.user.repositories.nodes)
  hasNextPage = response.data.data.user.repositories.pageInfo.hasNextPage
  cursor = response.data.data.user.repositories.pageInfo.endCursor
}

const projectRepos = []

for(const repo of repos) {
  if(repo.repositoryTopics.edges.length > 0) {
    if(repo.repositoryTopics.edges.map(edge => edge.node.topic.name).some(topic => topic === 'project')) {
      projectRepos.push(repo)
    }
  }
}

console.log(`\n\nFound ${projectRepos.length} projects with 'project' topic\n\n`);
return projectRepos;
}

async function cloneRepos(repos: GitHubRepository[]) {
  const base_dir = './.temp/'
  const execAsync = promisify(exec);

  if (!fs.existsSync(base_dir)) {
    fs.mkdirSync(base_dir, { recursive: true });
  }
  
  const spinner = ora('Starting repository cloning...').start();
  
  // Prepare array of clone promises
  const clonePromises = repos.map(async (repo) => {
    const cloneUrl = repo.url.replace('https://github.com/', `https://${process.env.GITHUB_TOKEN}@github.com/`)
    const cloneCommand = `git clone ${cloneUrl} ${base_dir}${repo.name}`
    const spinner = ora(`Cloning ${repo.name}...`).start()
    
    try {
      const result = await execAsync(cloneCommand);
      spinner.succeed(`Cloned ${repo.name}`)
      return { success: true, repo: repo.name, result };
    } catch (error) {
      spinner.fail(`Failed to clone ${repo.name}`)
      return { success: false, repo: repo.name, error };
    }
  });
  
  // Execute all clone operations concurrently
  const results = await Promise.all(clonePromises);
  
  spinner.succeed('Repository cloning completed!');  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\n\n📊 Summary: ${successful} repos cloned, ${failed} failed\n\n`);
  
  return results;
}
getAllRepos('AayushK47').then(repos => {
  cloneRepos(repos)
})