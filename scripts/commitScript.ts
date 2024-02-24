// commitScript.ts

async function getCommitData() {
  // Spawn processes for each Git command
  const hashProc = Bun.spawn(["git", "rev-parse", "HEAD"]);
  const messageProc = Bun.spawn(["git", "log", "-1", "--pretty=%B"]);
  const authorProc = Bun.spawn(["git", "log", "-1", "--pretty=%an"]);

  const changesProc = Bun.spawn(["git", "show", "--pretty=format:", "HEAD"]);

  // Use the Response object to efficiently handle the stdout stream
  const hash = await new Response(hashProc.stdout).text();
  const message = await new Response(messageProc.stdout).text();
  const author = await new Response(authorProc.stdout).text();
  const changes = await new Response(changesProc.stdout).text();

  // Trim the output to remove any trailing newline
  return {
    hash: hash.trim(),
    message: message.trim(),
    author: author.trim(),
    changes: changes.trim(),
  };
}

async function sendToServer(commitData: { hash: string; message: string; author: string }) {
  console.log("Sending commit data to server:", commitData);
  // Placeholder for server communication logic using Bun.fetch()
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
