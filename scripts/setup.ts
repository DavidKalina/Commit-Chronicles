#!/usr/bin/env node
// scripts/setup.ts
import { execSync } from "child_process";
import { writeFileSync, appendFileSync, chmodSync, existsSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";

async function main(apiUrl: string): Promise<void> {
  console.log("Configuring project...");

  // Step 1: Setup Husky
  if (!existsSync(".husky")) {
    console.log("Installing Husky...");
    execSync("npx husky install", { stdio: "inherit" });
  }

  // Step 2: Create set-env.sh with API_URL
  const huskyDir = join(process.cwd(), ".husky");
  const setEnvPath = join(huskyDir, "set-env.sh");
  console.log("Creating set-env.sh...");
  writeFileSync(setEnvPath, `#!/bin/sh\nexport API_URL="${apiUrl}"\n`);
  chmodSync(setEnvPath, "755");

  // Step 3: Add set-env.sh to .gitignore
  const gitignorePath = join(process.cwd(), ".gitignore");
  let gitignoreContent = existsSync(gitignorePath) ? readFileSync(gitignorePath, "utf8") : "";
  if (!gitignoreContent.includes(".husky/set-env.sh")) {
    console.log("Updating .gitignore...");
    appendFileSync(gitignorePath, "\n# Husky\n.husky/set-env.sh\n");
  }

  // Step 4: Configure post-commit hook
  const postCommitHookPath = join(huskyDir, "post-commit");
  console.log("Configuring post-commit hook...");
  writeFileSync(
    postCommitHookPath,
    `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
. "$(dirname "$0")/set-env.sh"
npx commit-script
`
  );
  chmodSync(postCommitHookPath, "755");

  console.log("Setup complete.");
}

const apiUrl: string = process.argv[2];
if (!apiUrl) {
  console.error(
    "Error: API_URL argument missing.\nUsage: npx @julius-gamble/commit-chronicles-setup <API_URL>"
  );
  process.exit(1);
}

main(apiUrl).catch(console.error);
