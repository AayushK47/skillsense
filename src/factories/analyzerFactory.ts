import { RepositoryAnalyzer } from '../services/repositoryAnalyzer';
import { LanguageAnalyzer } from '../services/languageAnalyzer';
import { FrameworkDetector } from '../services/frameworkDetector';
import { DatabaseDetector } from '../services/databaseDetector';
import { ToolDetector } from '../services/toolDetector';

export class AnalyzerFactory {
  static createAnalyzer(baseDir: string): RepositoryAnalyzer {
    const languageAnalyzer = new LanguageAnalyzer();
    const frameworkDetector = new FrameworkDetector();
    const databaseDetector = new DatabaseDetector();
    const toolDetector = new ToolDetector();
    
    return new RepositoryAnalyzer(
      baseDir,
      languageAnalyzer,
      frameworkDetector,
      databaseDetector,
      toolDetector
    );
  }
}
