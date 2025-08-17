import { ToolConfig } from '../types/analysis';
import { BaseDetector, DetectionResult } from './base/baseDetector';

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

    // Check package.json for Node.js dependencies
    if (this.checkPackageJson(repoPath, Object.values(tools).flatMap(config => config.packagePatterns))) {
      this.updateDetectionResults(toolDetection, tools, 'high');
    }

    // Check requirements.txt for Python dependencies
    if (this.checkRequirementsTxt(repoPath, Object.values(tools).flatMap(config => config.packagePatterns))) {
      this.updateDetectionResults(toolDetection, tools, 'high');
    }

    // Check for tool-specific files
    for (const [toolKey, config] of Object.entries(tools)) {
      if (toolDetection[toolKey].detected) continue; // Skip if already detected via dependencies
      
      let detected = false;
      
      for (const filePattern of config.filePatterns) {
        if (this.checkFileExists(repoPath, filePattern)) {
          detected = true;
          break;
        }
      }
      
      if (detected) {
        toolDetection[toolKey] = {
          detected: true,
          confidence: 'medium',
          category: config.category
        };
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

  private updateDetectionResults(
    detection: Record<string, ToolDetectionResult>,
    _configs: Record<string, ToolConfig>,
    confidence: 'high' | 'medium' | 'low'
  ): void {
    for (const [toolKey] of Object.entries(detection)) {
      if (detection[toolKey]) {
        detection[toolKey].detected = true;
        detection[toolKey].confidence = confidence;
      }
    }
  }

  private getToolConfigs(): Record<string, ToolConfig> {
    // This would be imported from the config file
    // For now, returning a minimal set for demonstration
    return {
      // DevOps Tools
      docker: {
        name: 'Docker',
        filePatterns: ['Dockerfile', '.dockerignore', 'docker-compose.yml', 'docker-compose.yaml'],
        packagePatterns: ['docker', '@types/docker'],
        category: 'devops'
      },
      kubernetes: {
        name: 'Kubernetes',
        filePatterns: ['.yaml', '.yml'],
        packagePatterns: ['kubernetes', '@kubernetes/client-node'],
        category: 'devops'
      },
      terraform: {
        name: 'Terraform',
        filePatterns: ['.tf', '.tfvars', '.hcl'],
        packagePatterns: ['terraform'],
        category: 'devops'
      },
      ansible: {
        name: 'Ansible',
        filePatterns: ['playbook.yml', 'inventory.yml', 'ansible.cfg'],
        packagePatterns: ['ansible'],
        category: 'devops'
      },
      
      // Cloud Services
      aws: {
        name: 'AWS',
        filePatterns: ['.yml', '.yaml', '.json'],
        packagePatterns: ['aws-sdk', '@aws-sdk/client-', 'boto3', 'botocore'],
        category: 'cloud'
      },
      azure: {
        name: 'Azure',
        filePatterns: ['.yml', '.yaml', '.json'],
        packagePatterns: ['@azure/ms-rest-js', '@azure/identity', 'azure-mgmt-', 'azure-storage-'],
        category: 'cloud'
      },
      gcp: {
        name: 'Google Cloud',
        filePatterns: ['.yml', '.yaml', '.json'],
        packagePatterns: ['@google-cloud/', 'google-cloud-', 'google-auth'],
        category: 'cloud'
      },
      heroku: {
        name: 'Heroku',
        filePatterns: ['Procfile', 'app.json', 'heroku.yml'],
        packagePatterns: ['heroku'],
        category: 'cloud'
      },
      
      // CI/CD Tools
      githubActions: {
        name: 'GitHub Actions',
        filePatterns: ['.github/workflows/', '.github/actions/'],
        packagePatterns: ['@actions/core', '@actions/github'],
        category: 'cicd'
      },
      gitlabCI: {
        name: 'GitLab CI',
        filePatterns: ['.gitlab-ci.yml'],
        packagePatterns: [],
        category: 'cicd'
      },
      jenkins: {
        name: 'Jenkins',
        filePatterns: ['Jenkinsfile', 'Jenkinsfile.declarative'],
        packagePatterns: ['jenkins'],
        category: 'cicd'
      },
      circleci: {
        name: 'CircleCI',
        filePatterns: ['.circleci/config.yml'],
        packagePatterns: [],
        category: 'cicd'
      },
      travisCI: {
        name: 'Travis CI',
        filePatterns: ['.travis.yml'],
        packagePatterns: [],
        category: 'cicd'
      },
      
      // Monitoring & Testing
      prometheus: {
        name: 'Prometheus',
        filePatterns: ['prometheus.yml', 'prometheus.yaml'],
        packagePatterns: ['prometheus', 'prom-client'],
        category: 'monitoring'
      },
      grafana: {
        name: 'Grafana',
        filePatterns: ['grafana.ini', 'provisioning/'],
        packagePatterns: ['grafana'],
        category: 'monitoring'
      },
      jest: {
        name: 'Jest',
        filePatterns: ['jest.config.js', 'jest.config.ts'],
        packagePatterns: ['jest', '@types/jest'],
        category: 'testing'
      },
      pytest: {
        name: 'pytest',
        filePatterns: ['pytest.ini', 'conftest.py'],
        packagePatterns: ['pytest'],
        category: 'testing'
      },
      cypress: {
        name: 'Cypress',
        filePatterns: ['cypress.config.js', 'cypress/'],
        packagePatterns: ['cypress'],
        category: 'testing'
      }
    };
  }
}
