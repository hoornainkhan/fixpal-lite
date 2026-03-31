import fs from "fs";
import path from "path";
import os from "os";
import AdmZip from "adm-zip";
import { simpleGit } from "simple-git";

const CODE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".java",
  ".c",
  ".cpp",
  ".cc",
  ".h",
  ".hpp",
  ".cs",
  ".go",
  ".rb",
  ".php",
  ".swift",
  ".kt",
  ".rs",
  ".scala",
  ".r",
  ".m",
  ".sh",
  ".bash",
  ".zsh",
  ".fish",
  ".ps1",
  ".html",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".vue",
  ".svelte",
  ".json",
  ".yaml",
  ".yml",
  ".toml",
  ".xml",
  ".env",
  ".config",
  ".prisma",
  ".graphql",
  ".sql",
]);

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  ".nuxt",
  "dist",
  "build",
  "out",
  ".turbo",
  ".cache",
  "coverage",
  "__pycache__",
  ".pytest_cache",
  "venv",
  "env",
  ".venv",
  ".env",
  "vendor",
  "target",
]);

function shouldIncludeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const parts = filePath.split(path.sep);
  for (const part of parts) {
    if (IGNORE_DIRS.has(part)) return false;
  }
  return CODE_EXTENSIONS.has(ext);
}

export async function extractZip(zipBuffer, tempDir) {
  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries();
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory) continue;
    const entryName = entry.entryName;
    if (!shouldIncludeFile(entryName)) continue;

    try {
      const content = entry.getData().toString("utf8");
      files.push({
        relativePath: entryName,
        content,
        extension: path.extname(entryName).toLowerCase(),
      });
    } catch (err) {
      console.warn(`Could not read zip entry: ${entryName}`);
    }
  }

  return files;
}

export function extractUploadedFiles(uploadedFiles) {
  const files = [];
  for (const file of uploadedFiles) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!CODE_EXTENSIONS.has(ext)) continue;

    try {
      const content = file.buffer.toString("utf8");
      files.push({
        relativePath: file.originalname,
        content,
        extension: ext,
      });
    } catch (err) {
      console.warn(`Could not read uploaded file: ${file.originalname}`);
    }
  }
  return files;
}

export async function cloneGithubRepo(repoUrl, tempDir) {
  const repoDir = path.join(tempDir, "repo");
  const git = simpleGit();
  await git.clone(repoUrl, repoDir, ["--depth", "1", "--single-branch"]);
  return readDirRecursive(repoDir, repoDir);
}

function readDirRecursive(dir, rootDir) {
  const files = [];
  let entries;

  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }

  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...readDirRecursive(fullPath, rootDir));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!CODE_EXTENSIONS.has(ext)) continue;
      try {
        const content = fs.readFileSync(fullPath, "utf8");
        const relativePath = path.relative(rootDir, fullPath);
        files.push({ relativePath, content, extension: ext });
      } catch {
        // skip unreadable files
      }
    }
  }

  return files;
}

export function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "fixpal-"));
}

export function cleanupTempDir(tempDir) {
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (err) {
    console.warn(`Failed to clean up temp directory: ${tempDir}`);
  }
}
