import { ToolConfig } from '../types/analysis';
import { BaseDetector, DetectionResult } from './base/baseDetector';
import { TOOLS } from '../config/definitions';

export interface ToolDetectionResult extends DetectionResult {
  category: 'devops' | 'cloud' | 'cicd' | 'monitoring' | 'testing';
}

export interface ToolDetectorService {
  detectTools(repoPath: string): Promise<Record<string, ToolDetectionResult>>;
}

export class ToolDetector extends BaseDetector<ToolConfig, ToolDetectionResult> implements ToolDetectorService {

  async detect(repoPath: string): Promise<Record<string, ToolDetectionResult>> {
    return this.detectTools(repoPath);
  }

  async detectTools(repoPath: string): Promise<Record<string, ToolDetectionResult>> {
    const toolDetection: Record<string, ToolDetectionResult> = {};
    
    // Initialize all tools as not detected
    const tools = this.getToolConfigs();
    for (const [toolKey, config] of Object.entries(tools)) {
      toolDetection[toolKey] = {
        detected: false,
        confidence: 'low',
        category: config.category
      };
    }

    // Check each tool individually
    for (const [toolKey, config] of Object.entries(tools)) {
      let detected = false;
      let confidence: 'high' | 'medium' | 'low' = 'low';

      // Check package.json for Node.js dependencies
      if (config.packagePatterns.length > 0 && this.checkPackageJson(repoPath, config.packagePatterns)) {
        detected = true;
        confidence = 'high';
      }

      // Check requirements.txt for Python dependencies
      if (!detected && config.packagePatterns.length > 0 && this.checkRequirementsTxt(repoPath, config.packagePatterns)) {
        detected = true;
        confidence = 'high';
      }

      // Check for tool-specific files
      if (!detected && config.filePatterns.length > 0) {
        for (const filePattern of config.filePatterns) {
          if (this.checkFileExists(repoPath, filePattern)) {
            detected = true;
            confidence = 'medium';
            break;
          }
        }
      }
      
      if (detected) {
        toolDetection[toolKey].detected = true;
        toolDetection[toolKey].confidence = confidence;
      }
    }

    return toolDetection;
  }

  protected getConfigs(): Record<string, ToolConfig> {
    return this.getToolConfigs();
  }

  protected getDefaultResult(): ToolDetectionResult {
    return {
      detected: false,
      confidence: 'low',
      category: 'devops'
    };
  }

  private getToolConfigs(): Record<string, ToolConfig> {
    return TOOLS;
  }
}
