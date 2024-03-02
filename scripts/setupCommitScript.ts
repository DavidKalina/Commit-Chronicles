#!/usr/bin/env node
// scripts/setupCommitScript.ts
import { execSync } from "child_process";
import { writeFileSync, appendFileSync, chmodSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

function setupHusky(apiUrl: string): void {
  console.log("Starting setup...");

  // Install Husky
  console.log("Installing Husky...");
  execSync("npm install husky --save-dev", { stdio: "inherit" });

  // Initialize Husky
  console.log("Initializing Husky...");
  execSync("npx husky install", { stdio: "inherit" });

  // Ensure .husky directory exists
  const huskyDir = join(process.cwd(), ".husky");
  if (!existsSync(huskyDir)) {
    mkdirSync(huskyDir, { recursive: true });
  }

  // Configure post-commit hook
  console.log("Configuring post-commit hook...");
  const postCommitHookPath = join(huskyDir, "post-commit");
  const postCommitScript = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Load env vars
. "$(dirname "$0")/set-env.sh"

# Run script
npx commit-script "$API_URL"
`;
  writeFileSync(postCommitHookPath, postCommitScript);
  chmodSync(postCommitHookPath, "755");

  // Create set-env.sh with API_URL
  console.log("Creating set-env.sh...");
  const setEnvPath = join(huskyDir, "set-env.sh");
  const setEnvScript = `#!/bin/sh
export API_URL="${apiUrl}"
`;
  writeFileSync(setEnvPath, setEnvScript);
  chmodSync(setEnvPath, "755");

  // Add set-env.sh to .gitignore
  console.log("Updating .gitignore...");
  const gitignorePath = join(process.cwd(), ".gitignore");
  const ignoreContent = "\n# Husky\n.husky/set-env.sh\n";
  appendFileSync(gitignorePath, ignoreContent);

  console.log("Setup complete.");
}

const apiUrl: string = process.argv[2];
if (!apiUrl) {
  console.log("Usage: npx ts-node setup.ts <API_URL>");
  process.exit(1);
}

setupHusky(apiUrl);
