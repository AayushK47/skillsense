import fs from 'fs';
import path from 'path';

export interface AnalysisStats {
  lines: number;
  files: number;
}

export interface BaseAnalyzerService<TConfig, TResult extends AnalysisStats> {
  analyze(repoPath: string, config: TConfig): Promise<TResult>;
}

export abstract class BaseAnalyzer<TConfig, TResult extends AnalysisStats> implements BaseAnalyzerService<TConfig, TResult> {
  abstract analyze(repoPath: string, config: TConfig): Promise<TResult>;

  protected countLinesInFile(filePath: string): number {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return content.split('\n').length;
    } catch {
      return 0;
    }
  }

  protected findFilesRecursively(dirPath: string, extensions: string[], excludePatterns: string[]): string[] {
    const files: string[] = [];
    
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        
        if (this.shouldExclude(fullPath, excludePatterns)) {
          continue;
        }
        
        if (fs.statSync(fullPath).isFile()) {
          if (extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
          }
        } else if (fs.statSync(fullPath).isDirectory()) {
          files.push(...this.findFilesRecursively(fullPath, extensions, excludePatterns));
        }
      }
    } catch {
      // Continue with other files
    }
    
    return files;
  }

  protected shouldExclude(filePath: string, excludePatterns: string[]): boolean {
    return excludePatterns.some(pattern => filePath.includes(pattern));
  }
}
