import { DatabaseConfig } from '../types/analysis';
import { BaseDetector, DetectionResult } from './base/baseDetector';
import { DATABASES } from '../config/definitions';

export interface DatabaseDetectionResult extends DetectionResult {
  category: 'sql' | 'nosql' | 'orm';
}

export interface DatabaseDetectorService {
  detectDatabases(repoPath: string): Promise<Record<string, DatabaseDetectionResult>>;
}

export class DatabaseDetector extends BaseDetector<DatabaseConfig, DatabaseDetectionResult> implements DatabaseDetectorService {

  async detect(repoPath: string): Promise<Record<string, DatabaseDetectionResult>> {
    return this.detectDatabases(repoPath);
  }

  async detectDatabases(repoPath: string): Promise<Record<string, DatabaseDetectionResult>> {
    const databaseDetection: Record<string, DatabaseDetectionResult> = {};
    
    // Initialize all databases as not detected
    const databases = this.getDatabaseConfigs();
    for (const [databaseKey, config] of Object.entries(databases)) {
      databaseDetection[databaseKey] = {
        detected: false,
        confidence: 'low',
        category: config.category
      };
    }

    // Check each database individually
    for (const [databaseKey, config] of Object.entries(databases)) {
      let detected = false;
      let confidence: 'high' | 'medium' | 'low' = 'low';

      // Check package.json for Node.js dependencies
      if (this.checkPackageJson(repoPath, config.packagePatterns)) {
        detected = true;
        confidence = 'high';
      }

      // Check requirements.txt for Python dependencies
      if (!detected && this.checkRequirementsTxt(repoPath, config.packagePatterns)) {
        detected = true;
        confidence = 'high';
      }

      // Check go.mod for Go dependencies
      if (!detected && this.checkGoMod(repoPath, config.packagePatterns)) {
        detected = true;
        confidence = 'high';
      }

      // Check pyproject.toml for Python dependencies
      if (!detected && this.checkPyProjectToml(repoPath, config.packagePatterns)) {
        detected = true;
        confidence = 'high';
      }

      if (detected) {
        databaseDetection[databaseKey].detected = true;
        databaseDetection[databaseKey].confidence = confidence;
      }
    }

    return databaseDetection;
  }

  protected getConfigs(): Record<string, DatabaseConfig> {
    return this.getDatabaseConfigs();
  }

  protected getDefaultResult(): DatabaseDetectionResult {
    return {
      detected: false,
      confidence: 'low',
      category: 'sql'
    };
  }

  private getDatabaseConfigs(): Record<string, DatabaseConfig> {
    return DATABASES;
  }
}
