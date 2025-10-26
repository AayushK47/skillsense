import fs from 'fs';
import path from 'path';

export interface DetectionResult {
  detected: boolean;
  confidence: 'high' | 'medium' | 'low';
}

export interface BaseDetectorService<TResult extends DetectionResult> {
  detect(repoPath: string): Promise<Record<string, TResult>>;
}

export abstract class BaseDetector<TConfig, TResult extends DetectionResult> implements BaseDetectorService<TResult> {

  abstract detect(repoPath: string): Promise<Record<string, TResult>>;

  protected abstract getConfigs(): Record<string, TConfig>;
  protected abstract getDefaultResult(): TResult;

  protected checkPackageJson(repoPath: string, packagePatterns: string[]): boolean {
    // Check root level first
    const rootPackageJsonPath = path.join(repoPath, 'package.json');
    if (fs.existsSync(rootPackageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf-8'));
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        if (packagePatterns.some(pattern => 
          Object.keys(dependencies).some(dep => dep.includes(pattern))
        )) {
          return true;
        }
      } catch {
        // Continue to check subdirectories
      }
    }

    // Check common monorepo subdirectories
    const commonSubdirs = ['frontend', 'backend', 'client', 'server', 'api', 'web', 'app', 'apps', 'packages'];
    for (const subdir of commonSubdirs) {
      const subdirPath = path.join(repoPath, subdir);
      if (fs.existsSync(subdirPath) && fs.statSync(subdirPath).isDirectory()) {
        const packageJsonPath = path.join(subdirPath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
            
            if (packagePatterns.some(pattern => 
              Object.keys(dependencies).some(dep => dep.includes(pattern))
            )) {
              return true;
            }
          } catch {
            // Continue checking other subdirectories
          }
        }
      }
    }

    return false;
  }

  protected checkRequirementsTxt(repoPath: string, packagePatterns: string[]): boolean {
    // Check root level first
    const rootRequirementsPath = path.join(repoPath, 'requirements.txt');
    if (fs.existsSync(rootRequirementsPath)) {
      try {
        const requirements = fs.readFileSync(rootRequirementsPath, 'utf-8');
        const lines = requirements.split('\n').map((line: string) => line.trim().toLowerCase());
        
        if (packagePatterns.some(pattern => 
          lines.some((line: string) => line.includes(pattern.toLowerCase()))
        )) {
          return true;
        }
      } catch {
        // Continue to check subdirectories
      }
    }

    // Check common monorepo subdirectories
    const commonSubdirs = ['frontend', 'backend', 'client', 'server', 'api', 'web', 'app', 'apps', 'packages'];
    for (const subdir of commonSubdirs) {
      const subdirPath = path.join(repoPath, subdir);
      if (fs.existsSync(subdirPath) && fs.statSync(subdirPath).isDirectory()) {
        const requirementsPath = path.join(subdirPath, 'requirements.txt');
        if (fs.existsSync(requirementsPath)) {
          try {
            const requirements = fs.readFileSync(requirementsPath, 'utf-8');
            const lines = requirements.split('\n').map((line: string) => line.trim().toLowerCase());
            
            if (packagePatterns.some(pattern => 
              lines.some((line: string) => line.includes(pattern.toLowerCase()))
            )) {
              return true;
            }
          } catch {
            // Continue checking other subdirectories
          }
        }
      }
    }

    return false;
  }

  protected checkGoMod(repoPath: string, packagePatterns: string[]): boolean {
    // Check root level first
    const rootGoModPath = path.join(repoPath, 'go.mod');
    if (fs.existsSync(rootGoModPath)) {
      try {
        const goMod = fs.readFileSync(rootGoModPath, 'utf-8');
        const lines = goMod.split('\n').map((line: string) => line.trim());
        
        if (packagePatterns.some(pattern => 
          lines.some((line: string) => line.includes(pattern))
        )) {
          return true;
        }
      } catch {
        // Continue to check subdirectories
      }
    }

    // Check common monorepo subdirectories
    const commonSubdirs = ['frontend', 'backend', 'client', 'server', 'api', 'web', 'app', 'apps', 'packages'];
    for (const subdir of commonSubdirs) {
      const subdirPath = path.join(repoPath, subdir);
      if (fs.existsSync(subdirPath) && fs.statSync(subdirPath).isDirectory()) {
        const goModPath = path.join(subdirPath, 'go.mod');
        if (fs.existsSync(goModPath)) {
          try {
            const goMod = fs.readFileSync(goModPath, 'utf-8');
            const lines = goMod.split('\n').map((line: string) => line.trim());
            
            if (packagePatterns.some(pattern => 
              lines.some((line: string) => line.includes(pattern))
            )) {
              return true;
            }
          } catch {
            // Continue checking other subdirectories
          }
        }
      }
    }

    return false;
  }

  protected checkPyProjectToml(repoPath: string, packagePatterns: string[]): boolean {
    // Check root level first
    const rootPyprojectPath = path.join(repoPath, 'pyproject.toml');
    if (fs.existsSync(rootPyprojectPath)) {
      try {
        const pyproject = fs.readFileSync(rootPyprojectPath, 'utf-8');
        
        if (packagePatterns.some(pattern => 
          pyproject.includes(pattern)
        )) {
          return true;
        }
      } catch {
        // Continue to check subdirectories
      }
    }

    // Check common monorepo subdirectories
    const commonSubdirs = ['frontend', 'backend', 'client', 'server', 'api', 'web', 'app', 'apps', 'packages'];
    for (const subdir of commonSubdirs) {
      const subdirPath = path.join(repoPath, subdir);
      if (fs.existsSync(subdirPath) && fs.statSync(subdirPath).isDirectory()) {
        const pyprojectPath = path.join(subdirPath, 'pyproject.toml');
        if (fs.existsSync(pyprojectPath)) {
          try {
            const pyproject = fs.readFileSync(pyprojectPath, 'utf-8');
            
            if (packagePatterns.some(pattern => 
              pyproject.includes(pattern)
            )) {
              return true;
            }
          } catch {
            // Continue checking other subdirectories
          }
        }
      }
    }

    return false;
  }

  protected checkFileExists(repoPath: string, filePattern: string): boolean {
    // Handle directory patterns (e.g., .github/workflows/)
    if (filePattern.includes('/')) {
      const dirPath = path.join(repoPath, filePattern);
      return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
    }
    
    // Handle specific file patterns
    if (filePattern.includes('*')) {
      // Handle wildcard patterns
      const dir = path.dirname(filePattern);
      const baseName = path.basename(filePattern);
      const searchDir = dir === '.' ? repoPath : path.join(repoPath, dir);
      
      if (!fs.existsSync(searchDir)) return false;
      
      try {
        const files = fs.readdirSync(searchDir);
        return files.some((file: string) => {
          if (baseName.includes('*')) {
            const regex = new RegExp(baseName.replace(/\*/g, '.*'));
            return regex.test(file);
          }
          return file === baseName;
        });
      } catch {
        return false;
      }
    }
    
    // Handle exact file patterns - search recursively
    return this.searchFileRecursively(repoPath, filePattern);
  }

  protected searchFileRecursively(dirPath: string, fileName: string): boolean {
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        
        if (fs.statSync(fullPath).isFile() && item === fileName) {
          return true;
        }
        
        if (fs.statSync(fullPath).isDirectory() && !item.startsWith('node_modules')) {
          if (this.searchFileRecursively(fullPath, fileName)) {
            return true;
          }
        }
      }
      
      return false;
    } catch {
      return false;
    }
  }
}
