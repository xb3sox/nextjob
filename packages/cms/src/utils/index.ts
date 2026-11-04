import { exec } from "node:child_process";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execPromise = promisify(exec);

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

export const getLastModifiedAt = async (
  filePath: string,
  contentDirectory: string,
) => {
  const absolutePath = path.join(packageRoot, contentDirectory, filePath);

  try {
    const { stdout: gitRootStdout } = await execPromise(
      "git rev-parse --show-toplevel",
    );
    const gitRoot = gitRootStdout.trim();
    const relativePath = path.relative(gitRoot, absolutePath);

    const { stdout } = await execPromise(
      `git log -1 --format=%ai -- ${relativePath}`,
      { cwd: gitRoot },
    );

    if (stdout.trim()) {
      return new Date(stdout.trim()).toISOString();
    }
  } catch {
    // Git unavailable or file not tracked.
  }

  try {
    const { mtime } = await stat(absolutePath);
    return mtime.toISOString();
  } catch {
    return new Date().toISOString();
  }
};
