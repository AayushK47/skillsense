import { 
  AnalysisResult, 
  SummaryStats, 
  ExportData 
} from '../types/analysis';
import { LANGUAGES, FRAMEWORKS, DATABASES, TOOLS } from '../config/definitions';
import { LanguageAnalyzerService } from './languageAnalyzer';
import { FrameworkDetectorService } from './frameworkDetector';
import { DatabaseDetectorService } from './databaseDetector';
import { ToolDetectorService } from './toolDetector';

export interface RepositoryAnalyzerService {
  analyzeAllRepositories(): Promise<AnalysisResult[]>;
  exportResults(): ExportData;
}

export class RepositoryAnalyzer implements RepositoryAnalyzerService {
  private results: AnalysisResult[] = [];

  constructor(
    private baseDir: string,
    private languageAnalyzer: LanguageAnalyzerService,
    private frameworkDetector: FrameworkDetectorService,
    private databaseDetector: DatabaseDetectorService,
    private toolDetector: ToolDetectorService
  ) {}

  public async analyzeAllRepositories(): Promise<AnalysisResult[]> {
    const fs = require('fs');
    const path = require('path');
    
    if (!fs.existsSync(this.baseDir)) {
      return [];
    }

    const repos = fs.readdirSync(this.baseDir).filter((item: string) => {
      const fullPath = path.join(this.baseDir, item);
      return fs.statSync(fullPath).isDirectory();
    });

    this.results = [];

    for (const repo of repos) {
      const repoPath = path.join(this.baseDir, repo);
      
      try {
        const result = await this.analyzeRepository(repoPath, repo);
        this.results.push(result);
      } catch (error) {
        // Continue with other repositories
      }
    }

    return this.results;
  }

  private async analyzeRepository(repoPath: string, repoName: string): Promise<AnalysisResult> {
    const result: AnalysisResult = {
      repository: repoName,
      languages: {},
      frameworks: {},
      databases: {},
      tools: {},
      totalLines: 0,
      totalFiles: 0
    };

    // Analyze languages
    for (const [langKey, config] of Object.entries(LANGUAGES)) {
      const langStats = await this.languageAnalyzer.analyzeLanguageFiles(repoPath, langKey, config);
      if (langStats.files > 0) {
        result.languages[langKey] = langStats;
        result.totalLines += langStats.lines;
        result.totalFiles += langStats.files;
      }
    }

    // Detect frameworks
    for (const [frameworkKey, config] of Object.entries(FRAMEWORKS)) {
      const frameworkDetection = await this.frameworkDetector.detectFramework(repoPath, frameworkKey, config);
      if (frameworkDetection.detected) {
        result.frameworks[frameworkKey] = frameworkDetection;
      }
    }

    // Detect databases
    result.databases = await this.databaseDetector.detectDatabases(repoPath);

    // Detect tools
    result.tools = await this.toolDetector.detectTools(repoPath);

    return result;
  }

  public exportResults(): ExportData {
    const summary = this.generateSummary();
    
    return {
      metadata: {
        timestamp: new Date().toISOString(),
        totalRepositories: summary.totalRepos,
        languages: Object.fromEntries(
          Object.entries(LANGUAGES).map(([key, config]) => [key, config.name])
        ),
        frameworks: Object.fromEntries(
          Object.entries(FRAMEWORKS).map(([key, config]) => [key, config.name])
        ),
        databases: Object.fromEntries(
          Object.entries(DATABASES).map(([key, config]) => [key, config.name])
        ),
        tools: Object.fromEntries(
          Object.entries(TOOLS).map(([key, config]) => [key, config.name])
        )
      },
      summary: {
        totalRepositories: summary.totalRepos,
        totalLinesOfCode: summary.totalLines,
        totalFiles: summary.totalFiles,
        languageBreakdown: Object.entries(summary.languageStats)
          .filter(([_, stats]) => stats.repos > 0)
          .map(([langKey, stats]) => ({
            language: LANGUAGES[langKey]?.name || langKey,
            languageKey: langKey,
            linesOfCode: stats.lines,
            fileCount: stats.files,
            repositoryCount: stats.repos,
            percentageOfTotal: ((stats.lines / summary.totalLines) * 100).toFixed(2)
          }))
          // .filter(lang => parseFloat(lang.percentageOfTotal) >= 4.0)
          .sort((a, b) => b.linesOfCode - a.linesOfCode)
      },
      frameworks: {
        frontend: this.getFrameworkResults(summary, 'frontend'),
        backend: this.getFrameworkResults(summary, 'backend')
      },
      databases: {
        sql: this.getDatabaseResults(summary, 'sql'),
        nosql: this.getDatabaseResults(summary, 'nosql'),
        orm: this.getDatabaseResults(summary, 'orm')
      },
      tools: Object.entries(summary.toolStats)
        .filter(([_, stats]) => stats.repos > 0)
        .map(([toolKey, stats]) => ({
          name: TOOLS[toolKey].name,
          key: toolKey,
          category: stats.category,
          repositoryCount: stats.repos,
          percentageOfRepositories: ((stats.repos / summary.totalRepos) * 100).toFixed(2)
        }))
        .sort((a, b) => b.repositoryCount - a.repositoryCount),
      detailedResults: this.results.map(result => ({
        repository: result.repository,
        statistics: {
          totalLinesOfCode: result.totalLines,
          totalFiles: result.totalFiles
        },
        languages: Object.entries(result.languages).map(([langKey, stats]) => ({
          language: LANGUAGES[langKey]?.name || langKey,
          languageKey: langKey,
          linesOfCode: stats.lines,
          fileCount: stats.files
        })),
        frameworks: Object.entries(result.frameworks).map(([frameworkKey, detection]) => ({
          framework: FRAMEWORKS[frameworkKey]?.name || frameworkKey,
          frameworkKey: frameworkKey,
          confidence: detection.confidence,
          linesOfCode: detection.lines,
          fileCount: detection.files
        })),
        databases: Object.entries(result.databases)
          .filter(([_, detection]) => detection.detected)
          .map(([databaseKey, detection]) => ({
            database: DATABASES[databaseKey]?.name || databaseKey,
            databaseKey: databaseKey,
            confidence: detection.confidence,
            category: detection.category
          })),
        tools: Object.entries(result.tools)
          .filter(([_, detection]) => detection.detected)
          .map(([toolKey, detection]) => ({
            tool: TOOLS[toolKey]?.name || toolKey,
            toolKey: toolKey,
            confidence: detection.confidence,
            category: detection.category
          }))
      }))
    };
  }

  private getFrameworkResults(summary: SummaryStats, category: 'frontend' | 'backend') {
    return Object.entries(summary.frameworkStats)
      .filter(([frameworkKey, stats]) => {
        if (stats.repos === 0) return false;
        const framework = FRAMEWORKS[frameworkKey];
        return framework?.category === category;
      })
      .map(([frameworkKey, stats]) => {
        const percentage = ((stats.repos / summary.totalRepos) * 100).toFixed(2);
        return {
          name: FRAMEWORKS[frameworkKey]?.name || frameworkKey,
          key: frameworkKey,
          repositoryCount: stats.repos,
          linesOfCode: stats.lines,
          fileCount: stats.files,
          percentageOfRepositories: percentage
        };
      })
      // .filter(framework => parseFloat(framework.percentageOfRepositories) >= 4.0)
      .sort((a, b) => b.repositoryCount - a.repositoryCount);
  }

  private getDatabaseResults(summary: SummaryStats, category: 'sql' | 'nosql' | 'orm') {
    return Object.entries(summary.databaseStats)
      .filter(([_, stats]) => stats.repos > 0 && stats.category === category)
      .map(([dbKey, stats]) => ({
        name: DATABASES[dbKey].name,
        key: dbKey,
        repositoryCount: stats.repos,
        percentageOfRepositories: ((stats.repos / summary.totalRepos) * 100).toFixed(2)
      }))
      .sort((a, b) => b.repositoryCount - a.repositoryCount);
  }

  private generateSummary(): SummaryStats {
    const summary: SummaryStats = {
      totalRepos: this.results.length,
      totalLines: 0,
      totalFiles: 0,
      languageStats: {},
      frameworkStats: {},
      databaseStats: {},
      toolStats: {}
    };

    // Initialize language stats
    for (const langKey of Object.keys(LANGUAGES)) {
      summary.languageStats[langKey] = { lines: 0, files: 0, repos: 0 };
    }

    // Initialize framework stats
    for (const frameworkKey of Object.keys(FRAMEWORKS)) {
      summary.frameworkStats[frameworkKey] = { repos: 0, totalUsage: 0, lines: 0, files: 0 };
    }

    // Initialize database stats
    for (const databaseKey of Object.keys(DATABASES)) {
      summary.databaseStats[databaseKey] = { repos: 0, totalUsage: 0, category: DATABASES[databaseKey].category };
    }

    // Initialize tool stats
    for (const toolKey of Object.keys(TOOLS)) {
      summary.toolStats[toolKey] = { repos: 0, totalUsage: 0, category: TOOLS[toolKey].category };
    }

    // Aggregate results
    for (const result of this.results) {
      summary.totalLines += result.totalLines;
      summary.totalFiles += result.totalFiles;

      // Aggregate language stats
      for (const [langKey, langStats] of Object.entries(result.languages)) {
        if (summary.languageStats[langKey]) {
          summary.languageStats[langKey].lines += langStats.lines;
          summary.languageStats[langKey].files += langStats.files;
          summary.languageStats[langKey].repos++;
        }
      }

      // Aggregate framework stats
      for (const [frameworkKey, frameworkStats] of Object.entries(result.frameworks)) {
        if (summary.frameworkStats[frameworkKey]) {
          summary.frameworkStats[frameworkKey].repos++;
          summary.frameworkStats[frameworkKey].totalUsage++;
          summary.frameworkStats[frameworkKey].lines += frameworkStats.lines;
          summary.frameworkStats[frameworkKey].files += frameworkStats.files;
        }
      }

      // Aggregate database stats
      for (const [databaseKey, databaseStats] of Object.entries(result.databases)) {
        if (databaseStats.detected && summary.databaseStats[databaseKey]) {
          summary.databaseStats[databaseKey].repos++;
          summary.databaseStats[databaseKey].totalUsage++;
        }
      }

      // Aggregate tool stats
      for (const [toolKey, toolStats] of Object.entries(result.tools)) {
        if (toolStats.detected && summary.toolStats[toolKey]) {
          summary.toolStats[toolKey].repos++;
          summary.toolStats[toolKey].totalUsage++;
        }
      }
    }

    return summary;
  }
}
