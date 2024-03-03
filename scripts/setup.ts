#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const setupProject = (apiUrl: string) => {
  // Step 1: Install and initialize Husky
  console.log("Installing Husky...");
  execSync("npm install husky --save-dev", { stdio: "inherit" });
  execSync("npx husky install", { stdio: "inherit" });

  // Step 2: Configure .husky/post-commit to use your script
  const huskyDir = path.join(process.cwd(), ".husky");
  const postCommitPath = path.join(huskyDir, "post-commit");
  const postCommitContent = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Load env vars
. "$(dirname "$0")/set-env.sh"

# Run commit-chronicles script
npx @julius-gamble/commit-chronicles-post-commit-script "$API_URL"
`;

  if (!fs.existsSync(huskyDir)) {
    fs.mkdirSync(huskyDir, { recursive: true });
  }
  fs.writeFileSync(postCommitPath, postCommitContent);
  fs.chmodSync(postCommitPath, "755");

  // Step 3: Create or update set-env.sh
  const setEnvPath = path.join(huskyDir, "set-env.sh");
  const setEnvContent = `#!/bin/sh
export API_URL="${apiUrl}"
`;
  fs.writeFileSync(setEnvPath, setEnvContent);
  fs.chmodSync(setEnvPath, "755");

  console.log("Setup complete. Husky and commit-chronicles configured.");
};

const apiUrl: string = process.argv[2];
if (!apiUrl) {
  console.log("Usage: npx @julius-gamble/commit-chronicles-post-commit-script <API_URL>");
  process.exit(1);
}

setupProject(apiUrl);
