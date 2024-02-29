#!/usr/bin/env node
// scripts/commitScript.ts
import { spawn } from "child_process";

interface CommitData {
  hash: string;
  message: string;
  author: string;
  changes: string;
}

function runCommand(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args);
    let data = "";
    proc.stdout.on("data", (chunk) => (data += chunk));
    proc.stderr.on("data", (chunk) => console.error(chunk.toString()));
    proc.on("close", (code) => {
      if (code === 0) resolve(data.trim());
      else reject(new Error(`Command failed with code ${code}`));
    });
  });
}

async function getCommitData() {
  const hash = await runCommand("git", ["rev-parse", "HEAD"]);
  const message = await runCommand("git", ["log", "-1", "--pretty=%B"]);
  const author = await runCommand("git", ["log", "-1", "--pretty=%an"]);
  const changes = await runCommand("git", ["show", "--pretty=format:", "HEAD"]);
  return { hash, message, author, changes };
}

async function sendToServer(commitData: CommitData) {
  const res = await fetch(`${process.env.API_URL}/generateEntry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commitData),
  });

  const parsedResponse = await res.json();

  if (res.status === 200) {
    console.log("Entry created successfully:", parsedResponse);
  } else {
    console.error("Failed to create entry:", parsedResponse);
  }
}

async function main() {
  try {
    const commitData = await getCommitData();
    await sendToServer(commitData);
  } catch (error) {
    console.error("Error fetching commit data:", error);
  }
}

main();
