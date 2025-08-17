# GitHub Workflows

This directory contains GitHub Actions workflows for automated tasks.

## Weekly Analysis Workflow

The `weekly-analysis.yml` workflow automatically runs repository analysis every Sunday at 2:00 AM UTC and pushes the results to Firebase.

### Setup Required

Before this workflow can run, you need to set up the following GitHub repository secrets:

#### 1. GitHub Configuration
- `GH_TOKEN`: A GitHub Personal Access Token with `repo` scope
- `GH_ENDPOINT`: GitHub GraphQL API endpoint (usually `https://api.github.com/graphql`)

#### 2. Firebase Configuration
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_PRIVATE_KEY`: Your Firebase service account private key (with newlines preserved)
- `FIREBASE_CLIENT_EMAIL`: Your Firebase service account client email

### How to Set Up Secrets

1. Go to your GitHub repository
2. Click on "Settings" tab
3. Click on "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add each secret with the exact names listed above

### Important Notes

- **FIREBASE_PRIVATE_KEY**: When copying from your `.env` file, make sure to preserve the newlines. GitHub will automatically handle this.
- **GITHUB_TOKEN**: This should be a Personal Access Token, not the default `GITHUB_TOKEN` that GitHub provides.
- The workflow can also be triggered manually using the "workflow_dispatch" trigger.

### Workflow Features

- **Scheduled**: Runs automatically every Sunday at 2:00 AM UTC
- **Manual Trigger**: Can be run manually from the Actions tab
- **Cleanup**: Automatically removes temporary files after completion
- **Notifications**: Provides clear success/failure feedback
- **Caching**: Uses npm cache for faster dependency installation

### Troubleshooting

If the workflow fails:
1. Check the workflow logs for specific error messages
2. Verify all secrets are properly set
3. Ensure your Firebase service account has the necessary permissions
4. Check that your GitHub token has the required scopes
