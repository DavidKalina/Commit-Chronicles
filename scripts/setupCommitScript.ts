const { execSync } = require("child_process");
const { writeFileSync, existsSync, mkdirSync } = require("fs");
const { join } = require("path");

const huskyDir = ".husky";
const postCommitHookPath = join(huskyDir, "post-commit");
const postCommitHookContent = `#!/bin/sh
. "\$(dirname "\$0")/_/husky.sh"

# Load env vars
. "\$(dirname "\$0")/set-env.sh"

# Run script
npx commit-script "\$API_URL"
`;

// Step 1: Install Husky
console.log("Installing Husky...");
execSync("npm install husky --save-dev", { stdio: "inherit" });

// Step 2: Initialize Husky
console.log("Initializing Husky...");
execSync("npx husky install", { stdio: "inherit" });

// Step 3: Configure the post-commit hook
console.log("Configuring post-commit hook...");
writeFileSync(postCommitHookPath, postCommitHookContent);
execSync(`chmod +x "${postCommitHookPath}"`, { stdio: "inherit" });

console.log(
  "Setup complete. Please ensure to configure set-env.sh with necessary environment variables."
);
