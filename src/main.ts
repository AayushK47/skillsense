import { AnalyzerFactory } from "./factories/analyzerFactory";
import { FirebaseService } from "./services/firebaseService";
import fs from "fs";
import path from "path";
import ora from "ora";
import axios from "axios";
import { promisify } from "util";
import { exec } from "child_process";

// Types for GitHub API
interface GitHubRepository {
  name: string;
  url: string;
  repositoryTopics: {
    edges: Array<{
      node: {
        topic: {
          name: string;
        };
      };
    }>;
  };
}

interface GitHubGraphQLResponse {
  data: {
    user: {
      repositories: {
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string;
        };
        nodes: GitHubRepository[];
      };
    };
  };
}

async function main() {
  const baseDir = ".temp";
  const spinner = ora("Starting repository analysis...").start();
  
  try {
    // Step 1: Fetch repositories if they dont exist
    if (!fs.existsSync(baseDir) || !fs.existsSync(path.join(baseDir, "repos.json"))) {
      spinner.text = "Fetching repositories from GitHub...";
      const repos = await getAllRepos("AayushK47"); // Change username here
      // Save repos to file for reference
      if (!fs.existsSync(".temp")) {
        fs.mkdirSync(".temp", { recursive: true });
      }
      fs.writeFileSync(".temp/repos.json", JSON.stringify(repos, null, 2));
    }
    
    // Step 2: Clone repositories if they dont exist
    if (!fs.existsSync(baseDir) || fs.readdirSync(baseDir).length === 0 || !hasClonedRepos(baseDir)) {
      spinner.text = "Cloning repositories...";
      const repos = JSON.parse(fs.readFileSync(".temp/repos.json", "utf-8"));
      await cloneRepos(repos);
    }
    
    // Step 3: Analyze repositories if any exist
    if (hasClonedRepos(baseDir)) {
      spinner.text = "Analyzing repositories...";
      const analyzer = AnalyzerFactory.createAnalyzer(baseDir);
      await analyzer.analyzeAllRepositories();
      const results = analyzer.exportResults();
      
      // Step 4: Push results to Firebase
      spinner.text = "Pushing results to Firebase...";
      const firebaseService = new FirebaseService();
      await firebaseService.pushAnalysisResults(results);
      
      spinner.succeed("Analysis completed and results pushed to Firebase");
      
      // Step 5: Pass results to next step (you can modify this function)
      await processResults(results);
    } else {
      spinner.warn("No repositories to analyze. Please check your GitHub username and token.");
    }
    
  } catch (error) {
    spinner.fail(`Analysis failed: ${error}`);
    console.error(error);
  }
}

function hasClonedRepos(baseDir: string): boolean {
  try {
    const items = fs.readdirSync(baseDir);
    // Check if there are any directories (cloned repos) or if only repos.json exists
    return items.some(item => {
      const itemPath = path.join(baseDir, item);
      return fs.statSync(itemPath).isDirectory() && item !== "node_modules";
    });
  } catch {
    return false;
  }
}

async function getAllRepos(username: string): Promise<GitHubRepository[]> {
  let repos: GitHubRepository[] = []
  let cursor: string | null = null
  let hasNextPage: boolean = true

  while (hasNextPage) {
    const query: string = `
      query {
        user(login: "${username}") {
          repositories(first: 5, isFork: false ${cursor ? `, after: "${cursor}"` : ""}) {
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
    if(repo.repositoryTopics.edges.map(edge => edge.node.topic.name).some(topic => topic === "project")) {
      projectRepos.push(repo)
    }
  }
}

console.log(`\n\nFound ${projectRepos.length} projects with "project" topic\n\n`);
return projectRepos;
}

async function cloneRepos(repos: GitHubRepository[]) {
  const base_dir = "./.temp/"
  const execAsync = promisify(exec);

  if (!fs.existsSync(base_dir)) {
    fs.mkdirSync(base_dir, { recursive: true });
  }
  
  const spinner = ora("Starting repository cloning...").start();
  
  // Prepare array of clone promises
  const clonePromises = repos.map(async (repo) => {
    const cloneUrl = repo.url.replace("https://github.com/", `https://${process.env.GITHUB_TOKEN}@github.com/`)
    const cloneCommand = `git clone ${cloneUrl} ${base_dir}${repo.name}`
    const spinner = ora(`Cloning ${repo.name}...`).start()
    
    try {
      const result = await execAsync(cloneCommand);
      spinner.succeed(`Cloned ${repo.name}`)
      return { success: true, repo: repo.name, result };
    } catch (error) {
      spinner.fail(`Failed to clone ${repo.name}`)
      return { success: false, repo: repo.name, error };
    } finally {
      spinner.stop();
    }
  });
  
  // Execute all clone operations concurrently
  const results = await Promise.all(clonePromises);
  
  spinner.succeed("Repository cloning completed!");  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\n\n📊 Summary: ${successful} repos cloned, ${failed} failed\n\n`);
  
  return results;
}

async function processResults(results: any): Promise<void> {
  // This function can be modified to handle the results in the next step
  // For example: send notifications, trigger other processes, etc.
  console.log("📊 Analysis completed successfully!");
  console.log(`📈 Total repositories analyzed: ${results.metadata.totalRepositories}`);
  console.log(`💻 Total lines of code: ${results.summary.totalLinesOfCode}`);
  console.log(`📁 Total files: ${results.summary.totalFiles}`);

  // You can add your custom logic here:
  // - Send results to other services
  // - Trigger webhooks
  // - Generate reports
  // - etc.
}

if (require.main === module) {
  main().catch(console.error);
}
