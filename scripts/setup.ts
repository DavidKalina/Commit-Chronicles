#!/usr/bin/env node
import { execSync } from "child_process";
import { writeFileSync, appendFileSync, chmodSync, existsSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";

function setupProject(apiUrl: string): void {
  console.log("Starting setup...");

  // Install Husky
  console.log("Installing Husky...");
  execSync("npm install husky --save-dev", { stdio: "inherit" });

  // Initialize Husky
  console.log("Initializing Husky...");
  execSync("npx husky install", { stdio: "inherit" });

  const huskyDir = join(process.cwd(), ".husky");
  if (!existsSync(huskyDir)) {
    mkdirSync(huskyDir, { recursive: true });
  }

  // Configure post-commit hook to use your script
  console.log("Configuring post-commit hook...");
  const postCommitPath = join(huskyDir, "post-commit");
  const postCommitContent = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run commit-script with API_URL
npx commit-script "$API_URL"
`;
  writeFileSync(postCommitPath, postCommitContent);
  chmodSync(postCommitPath, "755");

  // Create set-env.sh with API_URL
  console.log("Creating set-env.sh...");
  const setEnvPath = join(huskyDir, "set-env.sh");
  const setEnvContent = `#!/bin/sh
export API_URL="${apiUrl}"
`;
  writeFileSync(setEnvPath, setEnvContent);
  chmodSync(setEnvPath, "755");

  // Add set-env.sh to .gitignore
  console.log("Updating .gitignore...");
  const gitignorePath = join(process.cwd(), ".gitignore");
  let gitignoreContent = "";
  if (existsSync(gitignorePath)) {
    gitignoreContent = readFileSync(gitignorePath, "utf8");
  }
  if (!gitignoreContent.includes(".husky/set-env.sh")) {
    appendFileSync(gitignorePath, "\n# Husky Environment Variables\n.husky/set-env.sh\n");
  }

  console.log("Setup complete. Husky and commit-script configured.");
}

const apiUrl: string = process.argv[2];
if (!apiUrl) {
  console.error("Usage: npx ts-node setup.ts <API_URL>");
  process.exit(1);
}

setupProject(apiUrl);
