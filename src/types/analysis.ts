import { DetectionResult } from '../services/base/baseDetector';
import { AnalysisStats } from '../services/base/baseAnalyzer';

// Language and framework definitions
export interface LanguageConfig {
  extensions: string[];
  excludePatterns?: string[];
  name: string;
}

export interface FrameworkConfig {
  name: string;
  filePatterns: string[];
  packagePatterns: string[];
  excludePatterns?: string[];
  category: 'frontend' | 'backend';
}

export interface DatabaseConfig {
  name: string;
  packagePatterns: string[];
  category: 'sql' | 'nosql' | 'orm';
}

export interface ToolConfig {
  name: string;
  filePatterns: string[];
  packagePatterns: string[];
  category: 'devops' | 'cloud' | 'cicd' | 'monitoring' | 'testing';
}

export interface AnalysisResult {
  repository: string;
  languages: Record<string, AnalysisStats>;
  frameworks: Record<string, DetectionResult & { lines: number; files: number }>;
  databases: Record<string, DetectionResult & { category: 'sql' | 'nosql' | 'orm' }>;
  tools: Record<string, DetectionResult & { category: 'devops' | 'cloud' | 'cicd' | 'monitoring' | 'testing' }>;
  totalLines: number;
  totalFiles: number;
}

export interface SummaryStats {
  totalRepos: number;
  totalLines: number;
  totalFiles: number;
  languageStats: Record<string, { lines: number; files: number; repos: number }>;
  frameworkStats: Record<string, { repos: number; totalUsage: number; lines: number; files: number }>;
  databaseStats: Record<string, { repos: number; totalUsage: number; category: 'sql' | 'nosql' | 'orm' }>;
  toolStats: Record<string, { repos: number; totalUsage: number; category: 'devops' | 'cloud' | 'cicd' | 'monitoring' | 'testing' }>;
}

export interface ExportData {
  metadata: {
    timestamp: string;
    totalRepositories: number;
    languages: Record<string, string>;
    frameworks: Record<string, string>;
    databases: Record<string, string>;
    tools: Record<string, string>;
  };
  summary: {
    totalRepositories: number;
    totalLinesOfCode: number;
    totalFiles: number;
    languageBreakdown: Array<{
      language: string;
      languageKey: string;
      linesOfCode: number;
      fileCount: number;
      repositoryCount: number;
      percentageOfTotal: string;
    }>;
  };
  frameworks: {
    frontend: Array<{
      name: string;
      key: string;
      repositoryCount: number;
      linesOfCode: number;
      fileCount: number;
      percentageOfRepositories: string;
    }>;
    backend: Array<{
      name: string;
      key: string;
      repositoryCount: number;
      linesOfCode: number;
      fileCount: number;
      percentageOfRepositories: string;
    }>;
  };
  databases: {
    sql: Array<{
      name: string;
      key: string;
      repositoryCount: number;
      percentageOfRepositories: string;
    }>;
    nosql: Array<{
      name: string;
      key: string;
      repositoryCount: number;
      percentageOfRepositories: string;
    }>;
    orm: Array<{
      name: string;
      key: string;
      repositoryCount: number;
      percentageOfRepositories: string;
    }>;
  };
  tools: Array<{
    name: string;
    key: string;
    category: string;
    repositoryCount: number;
    percentageOfRepositories: string;
  }>;
  detailedResults: Array<{
    repository: string;
    statistics: {
      totalLinesOfCode: number;
      totalFiles: number;
    };
    languages: Array<{
      language: string;
      languageKey: string;
      linesOfCode: number;
      fileCount: number;
    }>;
    frameworks: Array<{
      framework: string;
      frameworkKey: string;
      confidence: string;
      linesOfCode: number;
      fileCount: number;
    }>;
    databases: Array<{
      database: string;
      databaseKey: string;
      confidence: string;
      category: string;
    }>;
    tools: Array<{
      tool: string;
      toolKey: string;
      confidence: string;
      category: string;
    }>;
  }>;
}
