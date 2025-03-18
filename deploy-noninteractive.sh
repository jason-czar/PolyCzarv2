#!/bin/bash

# PolyCzar Non-Interactive Deployment Script for GitHub and Netlify
# This script pushes your code to GitHub without prompting for input

# Colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== PolyCzar Non-Interactive Deployment Script ===${NC}"
echo -e "${BLUE}This script will deploy your PolyCzar application to GitHub${NC}"

# Fixed GitHub repository details
GITHUB_USERNAME="jason-czar"
REPO_NAME="PolyCzarv2"
GITHUB_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
COMMIT_MESSAGE="Initial commit with Clerk authentication integration"

echo -e "${BLUE}Preparing to deploy to $GITHUB_URL${NC}"

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    echo -e "${BLUE}Initializing git repository...${NC}"
    git init
    git branch -m main
    echo -e "${GREEN}Git repository initialized.${NC}"
fi

# Check if remote already exists
if git remote | grep -q "origin"; then
    echo -e "${BLUE}Remote 'origin' already exists. Updating URL...${NC}"
    git remote set-url origin $GITHUB_URL
else
    echo -e "${BLUE}Adding remote 'origin'...${NC}"
    git remote add origin $GITHUB_URL
fi

# Stage all files
echo -e "${BLUE}Staging files...${NC}"
git add .

# Commit changes
echo -e "${BLUE}Committing changes with message: $COMMIT_MESSAGE${NC}"
git commit -m "$COMMIT_MESSAGE"

# Push to GitHub
echo -e "${BLUE}Pushing to GitHub...${NC}"
echo -e "${BLUE}Note: You may be prompted for your GitHub credentials.${NC}"
git push -u origin main

# Check if push was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Code successfully pushed to GitHub!${NC}"
    echo -e "${BLUE}=== Netlify Deployment Instructions ===${NC}"
    echo -e "${BLUE}1. Go to https://app.netlify.com/ and log in${NC}"
    echo -e "${BLUE}2. Click 'Add new site' > 'Import an existing project'${NC}"
    echo -e "${BLUE}3. Select GitHub and authorize Netlify${NC}"
    echo -e "${BLUE}4. Search for and select your '$REPO_NAME' repository${NC}"
    echo -e "${BLUE}5. Configure the following build settings:${NC}"
    echo -e "${BLUE}   - Base directory: (leave blank)${NC}"
    echo -e "${BLUE}   - Build command: pnpm build${NC}"
    echo -e "${BLUE}   - Publish directory: dist${NC}"
    echo -e "${BLUE}6. Click 'Show advanced' and add the following environment variables:${NC}"
    echo -e "${BLUE}   - VITE_CLERK_PUBLISHABLE_KEY: (your Clerk key)${NC}"
    echo -e "${BLUE}   - VITE_SUPABASE_URL: (your Supabase URL)${NC}"
    echo -e "${BLUE}   - VITE_SUPABASE_ANON_KEY: (your Supabase anon key)${NC}"
    echo -e "${BLUE}7. Click 'Deploy site' and wait for the build to complete${NC}"
    echo -e "${GREEN}Deployment setup complete!${NC}"
else
    echo -e "${RED}Failed to push to GitHub. Please check your credentials and try again.${NC}"
    echo -e "${BLUE}You can try manually with:${NC}"
    echo -e "${BLUE}  git push -u origin main${NC}"
fi
