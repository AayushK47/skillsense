import { DatabaseConfig } from '../types/analysis';
import { BaseDetector, DetectionResult } from './base/baseDetector';

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

    // Check package.json for Node.js dependencies
    if (this.checkPackageJson(repoPath, Object.values(databases).flatMap(config => config.packagePatterns))) {
      this.updateDetectionResults(databaseDetection, databases, 'high');
    }

    // Check requirements.txt for Python dependencies
    if (this.checkRequirementsTxt(repoPath, Object.values(databases).flatMap(config => config.packagePatterns))) {
      this.updateDetectionResults(databaseDetection, databases, 'high');
    }

    // Check go.mod for Go dependencies
    if (this.checkGoMod(repoPath, Object.values(databases).flatMap(config => config.packagePatterns))) {
      this.updateDetectionResults(databaseDetection, databases, 'high');
    }

    // Check pyproject.toml for Python dependencies
    if (this.checkPyProjectToml(repoPath, Object.values(databases).flatMap(config => config.packagePatterns))) {
      this.updateDetectionResults(databaseDetection, databases, 'high');
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

  private updateDetectionResults(
    detection: Record<string, DatabaseDetectionResult>,
    _configs: Record<string, DatabaseConfig>,
    confidence: 'high' | 'medium' | 'low'
  ): void {
    for (const [databaseKey] of Object.entries(detection)) {
      if (detection[databaseKey]) {
        detection[databaseKey].detected = true;
        detection[databaseKey].confidence = confidence;
      }
    }
  }

  private getDatabaseConfigs(): Record<string, DatabaseConfig> {
    // This would be imported from the config file
    // For now, returning a minimal set for demonstration
    return {
      postgresql: {
        name: 'PostgreSQL',
        packagePatterns: ['pg', 'postgres', 'postgresql', 'psycopg2', 'postgresql-client'],
        category: 'sql'
      },
      mysql: {
        name: 'MySQL',
        packagePatterns: ['mysql', 'mysql2', 'pymysql', 'mysql-connector-python'],
        category: 'sql'
      },
      sqlite: {
        name: 'SQLite',
        packagePatterns: ['sqlite3', 'better-sqlite3', 'sqlite'],
        category: 'sql'
      },
      sqlserver: {
        name: 'SQL Server',
        packagePatterns: ['mssql', 'sqlserver', 'pyodbc'],
        category: 'sql'
      },
      mongodb: {
        name: 'MongoDB',
        packagePatterns: ['mongodb', 'mongoose', 'pymongo', 'mongo-go-driver'],
        category: 'nosql'
      },
      redis: {
        name: 'Redis',
        packagePatterns: ['redis', 'ioredis', 'redis-py', 'go-redis'],
        category: 'nosql'
      },
      elasticsearch: {
        name: 'Elasticsearch',
        packagePatterns: ['elasticsearch', '@elastic/elasticsearch', 'elasticsearch-py'],
        category: 'nosql'
      },
      prisma: {
        name: 'Prisma',
        packagePatterns: ['prisma', '@prisma/client'],
        category: 'orm'
      },
      sequelize: {
        name: 'Sequelize',
        packagePatterns: ['sequelize', 'sequelize-cli'],
        category: 'orm'
      },
      typeorm: {
        name: 'TypeORM',
        packagePatterns: ['typeorm', '@nestjs/typeorm'],
        category: 'orm'
      },
      sqlalchemy: {
        name: 'SQLAlchemy',
        packagePatterns: ['sqlalchemy', 'flask-sqlalchemy'],
        category: 'orm'
      },
      gorm: {
        name: 'GORM',
        packagePatterns: ['gorm.io/gorm', 'gorm.io/driver'],
        category: 'orm'
      },
      ent: {
        name: 'Ent',
        packagePatterns: ['entgo.io/ent'],
        category: 'orm'
      }
    };
  }
}
