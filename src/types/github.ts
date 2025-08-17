export interface RepositoryTopic {
  node: {
      topic: {
      name: string;
    }
  }
}

export interface RepositoryTopics {
  edges: RepositoryTopic[];
}

export interface GitHubRepository {
  name: string;
  url: string;
  repositoryTopics: RepositoryTopics;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface UserRepositories {
  pageInfo: PageInfo;
  nodes: GitHubRepository[];
}

export interface User {
  repositories: UserRepositories;
}

export interface GitHubGraphQLResponse {
  data: {
    user: User;
  };
}