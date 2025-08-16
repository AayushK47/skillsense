import dotenv from 'dotenv';
import fs from 'fs';
import axios from 'axios';
import { GitHubGraphQLResponse, GitHubRepository } from './types';
import { exec } from 'child_process';
import { promisify } from 'util';
import ora from 'ora';

dotenv.config({ quiet: true });

async function getAllRepos(username: string): Promise<GitHubRepository[]> {
  const repos: GitHubRepository[] = []
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
  
  return repos;
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
    const spin = ora(`Cloning ${repo.name}...`).start()
    
    try {
      const result = await execAsync(cloneCommand);
      spin.succeed(`Cloned ${repo.name}!`)
      return { success: true, repo: repo.name, result };
    } catch (error) {
      spin.fail(`Failed to clone ${repo.name}!`)
      return { success: false, repo: repo.name, error };
    }
  });
  
  // Execute all clone operations concurrently
  const results = await Promise.all(clonePromises);
  
  spinner.succeed('Repository cloning completed!');  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\n📊 Summary: ${successful} repos cloned, ${failed} failed`);
  
  return results;
}
getAllRepos('AayushK47').then(repos => {
  cloneRepos(repos)
  // console.log(JSON.stringify(repos, null, 2))
})