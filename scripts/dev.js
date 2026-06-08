import { spawn } from "node:child_process";

const children = [
  spawn("node", ["server/index.js"], { stdio: "inherit" }),
  spawn("vite", ["--host", "127.0.0.1", "--port", "5173"], { stdio: "inherit" }),
];

function stopChildren(signal) {
  for (const child of children) {
    if (!child.killed) child.kill(signal);
  }
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    stopChildren(signal);
    process.exit(0);
  });
}

for (const child of children) {
  child.on("exit", (code, signal) => {
    if (code && code !== 0) {
      stopChildren(signal ?? "SIGTERM");
      process.exit(code);
    }
  });
}
