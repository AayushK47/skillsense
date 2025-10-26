# SkillSense

A modern TypeScript project for analyzing GitHub repositories to understand programming language usage and framework adoption patterns.

## Features

- **Repository Cloning**: Automatically clones GitHub repositories based on topics
- **Language Analysis**: Identifies and counts lines of code for multiple programming languages
- **Framework Detection**: Detects popular frameworks with confidence levels
- **Comprehensive Reporting**: Generates detailed analysis reports and summary statistics

## Supported Languages

- **JavaScript** (`.js`, `.jsx`, `.mjs`)
- **TypeScript** (`.ts`, `.tsx`, `.mts`)
- **Python** (`.py`, `.ipynb`)
- **Go** (`.go`)
- **Java** (`.java`)
- **C** (`.c`, `.h`)
- **HTML** (`.html`, `.htm`, `.ejs`, `.j2`, `.jinja`, `.jinja2`, `.njk`, `.hbs`, `.handlebars`, `.pug`, `.jade`)
- **CSS** (`.css`, `.scss`, `.sass`, `.less`)
- **Dart** (`.dart`)

## Supported Frameworks

### Frontend
- **React/Next.js** - Detected via JSX/TSX files and package.json dependencies
- **Flutter** - Detected via Dart files and pubspec.yaml dependencies

### Backend
- **Express** (Node.js) - Detected via JS/TS files and package.json dependencies
- **Flask** (Python) - Detected via Python files and requirements.txt/pyproject.toml dependencies
- **Django** (Python) - Detected via Python files and requirements.txt/pyproject.toml dependencies
- **FastAPI** (Python) - Detected via Python files and requirements.txt/pyproject.toml dependencies
- **Go Fiber** (Go) - Detected via Go files and go.mod dependencies
- **Gin** (Go) - Detected via Go files and go.mod dependencies
- **Echo** (Go) - Detected via Go files and go.mod dependencies

### Monorepo Support
SkillSense automatically detects monorepos and searches for dependency files in common subdirectories:
- `frontend/`, `backend/`, `client/`, `server/`, `api/`, `web/`, `app/`, `apps/`, `packages/`
- Example: For a repo with `backend/go.mod` and `frontend/package.json`, both frameworks will be detected

## Supported Databases & ORMs

The system automatically detects database usage by analyzing dependency files:

### SQL Databases
- **PostgreSQL** - Detected via `pg`, `postgres`, `postgresql` packages
- **MySQL** - Detected via `mysql`, `mysql2`, `mysql-connector-python` packages
- **SQLite** - Detected via `sqlite3`, `better-sqlite3` packages
- **SQL Server** - Detected via `mssql`, `pyodbc` packages

### NoSQL Databases
- **MongoDB** - Detected via `mongodb`, `mongoose`, `pymongo` packages
- **Redis** - Detected via `redis`, `ioredis`, `redis-py` packages
- **Elasticsearch** - Detected via `@elastic/elasticsearch`, `elasticsearch-py` packages

### ORMs
- **Prisma** - Detected via `prisma`, `@prisma/client` packages
- **Sequelize** - Detected via `sequelize` packages
- **TypeORM** - Detected via `typeorm` packages
- **SQLAlchemy** - Detected via `sqlalchemy`, `alembic` packages
- **GORM** - Detected via `gorm.io/gorm` packages
- **Ent** - Detected via `entgo.io/ent` packages

### Dependency File Support
- **Node.js**: `package.json`
- **Python**: `requirements.txt`, `pyproject.toml`
- **Go**: `go.mod`

## Supported Tools & DevOps

The system automatically detects various tools and services by analyzing dependency files and configuration files:

### DevOps Tools
- **Docker** - Detected via `Dockerfile`, `docker-compose.yml`, `docker` packages
- **Kubernetes** - Detected via `.yaml`/`.yml` files and `kubernetes` packages
- **Terraform** - Detected via `.tf`, `.tfvars`, `.hcl` files and `terraform` packages
- **Ansible** - Detected via `playbook.yml`, `inventory.yml`, `ansible.cfg` files

### Cloud Services
- **AWS** - Detected via `aws-sdk`, `@aws-sdk/client-*`, `boto3` packages
- **Azure** - Detected via `@azure/ms-rest-js`, `@azure/identity`, `azure-mgmt-*` packages
- **Google Cloud** - Detected via `@google-cloud/*`, `google-cloud-*`, `google-auth` packages
- **Heroku** - Detected via `Procfile`, `app.json`, `heroku.yml` files

### CI/CD Tools
- **GitHub Actions** - Detected via `.github/workflows/`, `.github/actions/` directories
- **GitLab CI** - Detected via `.gitlab-ci.yml` files
- **Jenkins** - Detected via `Jenkinsfile` files and `jenkins` packages
- **CircleCI** - Detected via `.circleci/config.yml` files
- **Travis CI** - Detected via `.travis.yml` files

### Monitoring & Testing
- **Prometheus** - Detected via `prometheus.yml` files and `prometheus` packages
- **Grafana** - Detected via `grafana.ini` files and `grafana` packages
- **Jest** - Detected via `jest.config.js` files and `jest` packages
- **pytest** - Detected via `pytest.ini`, `conftest.py` files and `pytest` packages
- **Cypress** - Detected via `cypress.config.js` files and `cypress` packages

## Firebase Integration

The system saves results differently based on the `SAVE_TO_FIREBASE` environment variable:

### **Local Development (Default)**
When running locally without `SAVE_TO_FIREBASE`, results are saved to `analysis-results.json` in the project root:
```bash
npm run analyze
# ✅ Saves to: analysis-results.json
```

### **CI/CD (GitHub Actions)**
In GitHub Actions, `SAVE_TO_FIREBASE=true` is set automatically, pushing results to Firebase Firestore for real-time access:

- **Results**: Analysis results are stored and updated at the `results` document (overwrites previous data)

**To push to Firebase locally** (for testing):
```bash
SAVE_TO_FIREBASE=true npm run analyze
# ✅ Pushes to: Firebase Firestore
```

### Frontend Access

Frontend applications can directly read from Firestore using the Firebase SDK:

```typescript
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Get results (always contains the latest data)
const resultsDoc = await getDoc(doc(db, 'analysis-results', 'results'));
const results = resultsDoc.data();

```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your GitHub token and Firebase credentials:
   ```
   GH_TOKEN=your_github_token_here
   GH_ENDPOINT=https://api.github.com/graphql
   
   # Firebase Service Account Configuration
   FIREBASE_TYPE=service_account
   FIREBASE_PROJECT_ID=your_project_id_here
   FIREBASE_PRIVATE_KEY_ID=your_private_key_id_here
   FIREBASE_PRIVATE_KEY="your_private_key_here"
   FIREBASE_CLIENT_EMAIL=your_client_email_here
   FIREBASE_CLIENT_ID=your_client_id_here
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
   FIREBASE_CLIENT_X509_CERT_URL=your_client_x509_cert_url_here
   FIREBASE_UNIVERSE_DOMAIN=googleapis.com
   ```

## Usage

### 1. Clone Repositories

First, clone repositories from a GitHub user:

```bash
npm run dev
```

This will clone repositories with the "project" topic from the specified GitHub user.

### 2. Analyze Repositories

After cloning, analyze the repositories for languages and frameworks:

```bash
npm run analyze
```

This will:
- Scan all cloned repositories
- Count lines of code for each language
- Detect frameworks with confidence levels
- **Locally**: Save results to `analysis-results.json` in the project root
- **CI/CD**: Push results to Firebase Firestore
- Provide structured data for further analysis

### 3. Process Results (Optional)

You can also process the JSON results programmatically:

```bash
npm run example
```

This demonstrates how to read and analyze the exported JSON data.

## Output Files

The analysis generates different JSON files depending on the script used:

- **`analysis-results.json`** - Main analysis results (from `npm run analyze`)
- **`demo-analysis-results.json`** - Demo analysis results (from `npm run demo`)
- **`test-analysis-results.json`** - Test analysis results (from `npm run test-analyzer`)

Each JSON file contains:

1. **Metadata**: Timestamp, repository count, and supported languages/frameworks/databases/tools
2. **Summary Statistics**: Overall statistics and language breakdown with percentages (only languages with ≥4% usage)
3. **Frameworks**: Grouped by category (frontend/backend) with lines of code and file counts (only frameworks with ≥4% usage)
4. **Databases**: Grouped by category (sql/nosql/orm) with repository counts and percentages
5. **Tools**: Flat list of tools with category, repository counts and percentages
6. **Detailed Results**: Per-repository breakdown with language, framework, database, and tool details

## Example Output

The analysis generates structured JSON files. Here's an example of the output structure:

```json
{
  "metadata": {
    "timestamp": "2025-08-17T09:29:03.413Z",
    "totalRepositories": 5,
    "languages": {
      "js": "JavaScript",
      "ts": "TypeScript",
      "py": "Python"
    },
    "frameworks": {
      "reactNext": "React/Next.js",
      "express": "Express"
    },
    "databases": {
      "postgresql": "PostgreSQL",
      "mongodb": "MongoDB",
      "prisma": "Prisma"
    },
    "tools": {
      "docker": "Docker",
      "jest": "Jest",
      "githubActions": "GitHub Actions"
    }
  },
  "summary": {
    "totalRepositories": 5,
    "totalLinesOfCode": 45230,
    "totalFiles": 156,
    "languageBreakdown": [
      {
        "language": "TypeScript",
        "languageKey": "ts",
        "linesOfCode": 28450,
        "fileCount": 89,
        "repositoryCount": 4,
        "percentageOfTotal": "62.90"
      }
    ]
  },
  "frameworks": {
    "frontend": [
      {
        "name": "React/Next.js",
        "key": "reactNext",
        "repositoryCount": 5,
        "linesOfCode": 15420,
        "fileCount": 77,
        "percentageOfRepositories": "25.00"
      }
    ],
    "backend": [
      {
        "name": "Express",
        "key": "express",
        "repositoryCount": 12,
        "linesOfCode": 5440,
        "fileCount": 73,
        "percentageOfRepositories": "60.00"
      }
    ]
  },
  "databases": {
    "sql": [
      {
        "name": "PostgreSQL",
        "key": "postgresql",
        "repositoryCount": 3,
        "percentageOfRepositories": "60.00"
      }
    ],
    "nosql": [
      {
        "name": "MongoDB",
        "key": "mongodb",
        "repositoryCount": 2,
        "percentageOfRepositories": "40.00"
      }
    ],
    "orm": [
      {
        "name": "Prisma",
        "key": "prisma",
        "repositoryCount": 1,
        "percentageOfRepositories": "20.00"
      }
    ]
  },
  "tools": [
    {
      "name": "Jest",
      "key": "jest",
      "category": "testing",
      "repositoryCount": 3,
      "percentageOfRepositories": "60.00"
    },
    {
      "name": "Docker",
      "key": "docker",
      "category": "devops",
      "repositoryCount": 2,
      "percentageOfRepositories": "40.00"
    },
    {
      "name": "GitHub Actions",
      "key": "githubActions",
      "category": "cicd",
      "repositoryCount": 1,
      "percentageOfRepositories": "20.00"
    }
  ],
  "detailedResults": [
    {
      "repository": "my-react-app",
      "statistics": {
        "totalLinesOfCode": 15420,
        "totalFiles": 45
      },
      "languages": [
        {
          "language": "TypeScript",
          "languageKey": "ts",
          "linesOfCode": 12340,
          "fileCount": 32
        }
      ],
      "frameworks": [
        {
          "framework": "React/Next.js",
          "frameworkKey": "reactNext",
          "confidence": "high",
          "linesOfCode": 12340,
          "fileCount": 32
        }
      ],
      "databases": [
        {
          "database": "PostgreSQL",
          "databaseKey": "postgresql",
          "confidence": "high",
          "category": "sql"
        }
      ],
      "tools": [
        {
          "tool": "Docker",
          "toolKey": "docker",
          "confidence": "high",
          "category": "devops"
        }
      ]
    }
  ]
}
```

## Architecture

The project uses a modular architecture:

- **`fetchAndCloneRepos.ts`**: Handles GitHub API calls and repository cloning
- **`analyzeRepos.ts`**: Core analysis engine with language and framework detection
- **`types/`**: TypeScript type definitions for GitHub API responses

## Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Clone repositories from GitHub
- `npm run analyze` - Analyze cloned repositories and export results
- `npm run demo` - Run demo analysis
- `npm run test-analyzer` - Run analyzer tests
- `npm run example` - Demonstrate JSON result processing
- `npm run start` - Run the compiled JavaScript
- `npm run lint` - Run ESLint to check for code issues
- `npm run lint:fix` - Fix auto-fixable ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is properly formatted
- `npm run type-check` - Run TypeScript type checking without compilation
- `npm run clean` - Remove the dist directory
- `npm run test` - Run Jest tests

## Customization

You can easily extend the analysis by:

1. Adding new languages to the `LANGUAGES` configuration
2. Adding new frameworks to the `FRAMEWORKS` configuration
3. Modifying exclusion patterns for specific file types
4. Adding custom detection logic for frameworks

## Requirements

- Node.js 16+
- TypeScript 5.3+
- GitHub Personal Access Token with repo access

