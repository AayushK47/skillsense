import { LanguageConfig } from '../types/analysis';
import { BaseAnalyzer, AnalysisStats } from './base/baseAnalyzer';

export interface LanguageAnalyzerService {
  analyzeLanguageFiles(repoPath: string, langKey: string, config: LanguageConfig): Promise<{ lines: number; files: number }>;
}

export class LanguageAnalyzer extends BaseAnalyzer<LanguageConfig, AnalysisStats> implements LanguageAnalyzerService {

  async analyze(repoPath: string, config: LanguageConfig): Promise<AnalysisStats> {
    const files = this.findFilesRecursively(repoPath, config.extensions, config.excludePatterns || []);
    
    let totalLines = 0;
    let fileCount = 0;
    
    for (const file of files) {
      const lines = this.countLinesInFile(file);
      totalLines += lines;
      fileCount++;
    }

    return { lines: totalLines, files: fileCount };
  }

  async analyzeLanguageFiles(repoPath: string, _langKey: string, config: LanguageConfig): Promise<{ lines: number; files: number }> {
    return this.analyze(repoPath, config);
  }
}
