import { LanguageConfig, FrameworkConfig, DatabaseConfig, ToolConfig } from '../types/analysis';

export const LANGUAGES: Record<string, LanguageConfig> = {
  js: {
    name: 'JavaScript',
    extensions: ['.js', '.jsx', '.mjs'],
    excludePatterns: ['node_modules', '.git', 'dist', 'build', 'coverage']
  },
  ts: {
    name: 'TypeScript',
    extensions: ['.ts', '.tsx', '.mts'],
    excludePatterns: ['node_modules', '.git', 'dist', 'build', 'coverage']
  },
  py: {
    name: 'Python',
    extensions: ['.py', '.ipynb'],
    excludePatterns: ['__pycache__', '.git', 'venv', 'env', '.pytest_cache']
  },
  go: {
    name: 'Go',
    extensions: ['.go'],
    excludePatterns: ['vendor', '.git', 'bin', 'pkg']
  },
  java: {
    name: 'Java',
    extensions: ['.java'],
    excludePatterns: ['.git', 'target', 'build', 'out', 'bin']
  },
  c: {
    name: 'C',
    extensions: ['.c', '.h'],
    excludePatterns: ['.git', 'build', 'dist', 'obj']
  },
  html: {
    name: 'HTML',
    extensions: ['.html', '.htm', '.ejs', '.j2', '.jinja', '.jinja2', '.njk', '.hbs', '.handlebars', '.pug', '.jade'],
    excludePatterns: ['.git', 'node_modules', 'dist', 'build']
  },
  css: {
    name: 'CSS',
    extensions: ['.css', '.scss', '.sass', '.less'],
    excludePatterns: ['.git', 'node_modules', 'dist', 'build']
  },
  dart: {
    name: 'Dart',
    extensions: ['.dart'],
    excludePatterns: ['.git', 'build', '.dart_tool', 'android', 'ios']
  }
};

export const FRAMEWORKS: Record<string, FrameworkConfig> = {
  reactNext: {
    name: 'React/Next.js',
    filePatterns: ['.jsx', '.tsx'],
    packagePatterns: ['react', '@types/react', 'next'],
    excludePatterns: ['node_modules', '.git', 'dist', 'build'],
    category: 'frontend'
  },
  express: {
    name: 'Express',
    filePatterns: ['.js', '.ts'],
    packagePatterns: ['express', '@types/express'],
    excludePatterns: ['node_modules', '.git', 'dist', 'build'],
    category: 'backend'
  },
  flask: {
    name: 'Flask',
    filePatterns: ['.py'],
    packagePatterns: ['flask'],
    excludePatterns: ['__pycache__', '.git', 'venv', 'env'],
    category: 'backend'
  },
  gofiber: {
    name: 'Go Fiber',
    filePatterns: ['.go'],
    packagePatterns: ['github.com/gofiber/fiber'],
    excludePatterns: ['vendor', '.git', 'bin', 'pkg'],
    category: 'backend'
  },
  flutter: {
    name: 'Flutter',
    filePatterns: ['.dart'],
    packagePatterns: ['flutter'],
    excludePatterns: ['.git', 'build', '.dart_tool', 'android', 'ios'],
    category: 'frontend'
  }
};

export const DATABASES: Record<string, DatabaseConfig> = {
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

export const TOOLS: Record<string, ToolConfig> = {
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
