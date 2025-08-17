import fs from 'fs';
import path from 'path';
import { FrameworkConfig } from '../types/analysis';
import { BaseDetector, DetectionResult } from './base/baseDetector';

export interface FrameworkDetectionResult extends DetectionResult {
  lines: number;
  files: number;
}

export interface FrameworkDetectorService {
  detectFramework(repoPath: string, frameworkKey: string, config: FrameworkConfig): Promise<FrameworkDetectionResult>;
}

export class FrameworkDetector extends BaseDetector<FrameworkConfig, FrameworkDetectionResult> implements FrameworkDetectorService {

  async detect(_repoPath: string): Promise<Record<string, FrameworkDetectionResult>> {
    // This method is required by the base class but not used in this implementation
    // We use detectFramework instead for specific framework detection
    return {};
  }

  async detectFramework(repoPath: string, frameworkKey: string, config: FrameworkConfig): Promise<FrameworkDetectionResult> {
    let detected = false;
    let confidence: 'high' | 'medium' | 'low' = 'low';
    let totalLines = 0;
    let fileCount = 0;

    // Check package.json for Node.js dependencies
    if (frameworkKey === 'reactNext' || frameworkKey === 'express') {
      if (this.checkPackageJson(repoPath, config.packagePatterns)) {
        detected = true;
        confidence = 'high';
      }
    }

    // Check for framework-specific files
    if (!detected) {
      for (const filePattern of config.filePatterns) {
        if (this.checkFileExists(repoPath, filePattern)) {
          detected = true;
          confidence = 'medium';
          break;
        }
      }
    }

    // Count lines and files for detected frameworks
    if (detected) {
      const stats = this.countFrameworkFiles(repoPath, config);
      totalLines = stats.lines;
      fileCount = stats.files;
    }

    return { detected, confidence, lines: totalLines, files: fileCount };
  }

  protected getConfigs(): Record<string, FrameworkConfig> {
    // This would be imported from the config file
    return {};
  }

  protected getDefaultResult(): FrameworkDetectionResult {
    return {
      detected: false,
      confidence: 'low',
      lines: 0,
      files: 0
    };
  }

  private countFrameworkFiles(repoPath: string, config: FrameworkConfig): { lines: number; files: number } {
    let totalLines = 0;
    let fileCount = 0;

    for (const filePattern of config.filePatterns) {
      const files = this.findFrameworkFiles(repoPath, filePattern);
      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf-8');
          totalLines += content.split('\n').length;
          fileCount++;
        } catch {
          // Skip files that can't be read
        }
      }
    }

    return { lines: totalLines, files: fileCount };
  }

  private findFrameworkFiles(repoPath: string, filePattern: string): string[] {
    const files: string[] = [];
    
    if (filePattern.includes('/')) {
      const dirPath = path.join(repoPath, filePattern);
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        this.findFilesRecursively(dirPath, files);
      }
    } else if (filePattern.includes('*')) {
      const dir = path.dirname(filePattern);
      const baseName = path.basename(filePattern);
      const searchDir = dir === '.' ? repoPath : path.join(repoPath, dir);
      
      if (fs.existsSync(searchDir)) {
        const items = fs.readdirSync(searchDir);
        for (const item of items) {
          if (baseName.includes('*')) {
            const regex = new RegExp(baseName.replace(/\*/g, '.*'));
            if (regex.test(item)) {
              files.push(path.join(searchDir, item));
            }
          } else if (item === baseName) {
            files.push(path.join(searchDir, item));
          }
        }
      }
    } else {
      // Exact file pattern
      if (this.searchFileRecursively(repoPath, filePattern)) {
        // Find the actual file path
        this.findExactFile(repoPath, filePattern, files);
      }
    }

    return files;
  }

  private findFilesRecursively(dirPath: string, files: string[]): void {
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        
        if (fs.statSync(fullPath).isFile()) {
          files.push(fullPath);
        } else if (fs.statSync(fullPath).isDirectory() && !item.startsWith('node_modules')) {
          this.findFilesRecursively(fullPath, files);
        }
      }
    } catch {
      // Continue with other files
    }
  }

  private findExactFile(dirPath: string, fileName: string, files: string[]): void {
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        
        if (fs.statSync(fullPath).isFile() && item === fileName) {
          files.push(fullPath);
          return;
        }
        
        if (fs.statSync(fullPath).isDirectory() && !item.startsWith('node_modules')) {
          this.findExactFile(fullPath, fileName, files);
        }
      }
    } catch {
      // Continue with other files
    }
  }


}
