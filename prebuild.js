// Enhanced build script for PolyCzar
// This script runs checks before the main build process to ensure everything is properly configured

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue('========================================'));
console.log(chalk.blue('PolyCzar Pre-Build Verification'));
console.log(chalk.blue('========================================'));

// Function to check if environment variables are set
function checkEnvVariables() {
  console.log(chalk.yellow('Checking environment variables...'));
  
  const requiredVars = [
    'VITE_CLERK_PUBLISHABLE_KEY',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log(chalk.red('Missing required environment variables:'));
    missingVars.forEach(varName => {
      console.log(chalk.red(`  - ${varName}`));
    });
    console.log(chalk.yellow('Please add these to your Netlify environment variables or .env file.'));
    
    // Don't fail the build in CI environments (Netlify will have these set)
    if (process.env.CI !== 'true') {
      console.log(chalk.yellow('This is a warning only. Build will continue.'));
    }
  } else {
    console.log(chalk.green('✓ All required environment variables are set.'));
  }
}

// Function to check if redirects file exists
function checkRedirectsFile() {
  console.log(chalk.yellow('Checking _redirects file...'));
  
  const redirectsPath = path.join(__dirname, 'public', '_redirects');
  
  if (fs.existsSync(redirectsPath)) {
    const content = fs.readFileSync(redirectsPath, 'utf8');
    if (content.includes('/* /index.html 200')) {
      console.log(chalk.green('✓ _redirects file exists and contains proper routing rule.'));
    } else {
      console.log(chalk.red('_redirects file exists but does not contain the proper routing rule.'));
      console.log(chalk.yellow('Adding the proper rule to _redirects file...'));
      fs.writeFileSync(redirectsPath, '/* /index.html 200\n');
      console.log(chalk.green('✓ Updated _redirects file with proper routing rule.'));
    }
  } else {
    console.log(chalk.yellow('_redirects file not found. Creating...'));
    if (!fs.existsSync(path.join(__dirname, 'public'))) {
      fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });
    }
    fs.writeFileSync(redirectsPath, '/* /index.html 200\n');
    console.log(chalk.green('✓ Created _redirects file with proper routing rule.'));
  }
}

// Check if netlify.toml exists and has the correct configuration
function checkNetlifyConfig() {
  console.log(chalk.yellow('Checking netlify.toml configuration...'));
  
  const netlifyPath = path.join(__dirname, 'netlify.toml');
  
  if (fs.existsSync(netlifyPath)) {
    const content = fs.readFileSync(netlifyPath, 'utf8');
    const hasPublishDir = content.includes('publish = "dist"');
    const hasBuildCommand = content.includes('command = "pnpm build"');
    const hasRedirects = content.includes('from = "/*"') && content.includes('to = "/index.html"');
    
    if (hasPublishDir && hasBuildCommand && hasRedirects) {
      console.log(chalk.green('✓ netlify.toml exists with proper configuration.'));
    } else {
      console.log(chalk.red('netlify.toml exists but may be missing some configurations.'));
      console.log(chalk.yellow('Please ensure it has the correct publish directory and build command.'));
    }
  } else {
    console.log(chalk.yellow('netlify.toml not found. Using defaults from package.json.'));
  }
}

// Function to check the theme configuration
function checkThemeConfig() {
  console.log(chalk.yellow('Checking theme configuration...'));
  
  const tailwindPath = path.join(__dirname, 'tailwind.config.js');
  
  if (fs.existsSync(tailwindPath)) {
    const content = fs.readFileSync(tailwindPath, 'utf8');
    if (content.includes('#191B1C')) {
      console.log(chalk.green('✓ Dark theme color (#191B1C) is properly configured in tailwind.config.js.'));
    } else {
      console.log(chalk.yellow('Dark theme color (#191B1C) may not be properly configured.'));
    }
  } else {
    console.log(chalk.yellow('tailwind.config.js not found. Using default configuration.'));
  }
}

// Load env file for local development
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      console.log(chalk.yellow('Loading environment variables from .env file...'));
      
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = envContent.split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => {
          const parts = line.split('=');
          if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            return { key, value };
          }
          return null;
        })
        .filter(item => item !== null);
      
      envVars.forEach(({ key, value }) => {
        process.env[key] = value;
      });
      
      console.log(chalk.green(`✓ Loaded ${envVars.length} environment variables from .env file.`));
    }
  } catch (error) {
    console.log(chalk.red(`Error loading .env file: ${error.message}`));
  }
}

// Run all checks
function runChecks() {
  // First load env file if we're in a local environment
  if (process.env.CI !== 'true') {
    loadEnvFile();
  }
  
  checkEnvVariables();
  console.log('');
  
  checkRedirectsFile();
  console.log('');
  
  checkNetlifyConfig();
  console.log('');
  
  checkThemeConfig();
  console.log('');
  
  console.log(chalk.blue('========================================'));
  console.log(chalk.green('✓ Pre-build verification complete.'));
  console.log(chalk.blue('Proceeding with the main build process...'));
  console.log(chalk.blue('========================================'));
}

// Execute all checks
runChecks();
