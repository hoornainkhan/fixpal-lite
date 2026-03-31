import { Router } from "express";
import multer from "multer";
import {
  extractZip,
  extractUploadedFiles,
  cloneGithubRepo,
  createTempDir,
  cleanupTempDir,
} from "../services/fileHandler.js";
import { extractTextFromImage } from "../services/ocrService.js";
import { parseError } from "../services/errorParser.js";
import { rankFiles } from "../services/smartScanner.js";
import { extractRelevantCode } from "../services/codeExtractor.js";
import { analyzeWithNvidia } from "../services/nvidiaService.js";

const router = new Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 50,
  },
  fileFilter: (_req, file, cb) => {
    const blocked = [".exe", ".dll", ".so", ".dylib", ".bin"];
    const ext = file.originalname
      .slice(file.originalname.lastIndexOf("."))
      .toLowerCase();
    if (blocked.includes(ext)) {
      cb(new Error(`File type ${ext} is not allowed`));
      return;
    }
    cb(null, true);
  },
});

const uploadFields = upload.fields([
  { name: "projectZip", maxCount: 1 },
  { name: "projectFiles", maxCount: 50 },
  { name: "errorImage", maxCount: 1 },
]);

router.post("/analyze", uploadFields, async (req, res) => {
  const tempDir = createTempDir();

  try {
    const files = req.files || {};
    const projectZipFiles = files.projectZip || [];
    const projectFiles = files.projectFiles || [];
    const errorImageFiles = files.errorImage || [];
    const { githubUrl, errorText } = req.body;

    if (!projectZipFiles.length && !projectFiles.length && !githubUrl?.trim()) {
      res.status(400).json({
        error: "No project provided",
        details:
          "Please upload a ZIP file, individual files, or provide a GitHub URL.",
      });
      return;
    }

    if (!errorText?.trim() && !errorImageFiles.length) {
      res.status(400).json({
        error: "No error provided",
        details: "Please paste an error message or upload a screenshot.",
      });
      return;
    }

    let resolvedErrorText = errorText?.trim() || "";

    if (!resolvedErrorText && errorImageFiles.length > 0) {
      console.log("Extracting text from error screenshot via OCR");
      try {
        resolvedErrorText = await extractTextFromImage(
          errorImageFiles[0].buffer,
        );
        console.log(
          `OCR extraction complete: ${resolvedErrorText.length} chars`,
        );
      } catch (err) {
        console.warn(`OCR failed: ${err.message}`);
        res.status(400).json({
          error: "Could not read error clearly. Please paste text manually.",
          details:
            "OCR processing failed. The image may be too small, blurry, or contain non-text content.",
        });
        return;
      }
    }

    if (!resolvedErrorText) {
      res.status(400).json({
        error: "No error text could be extracted",
        details:
          "OCR returned no text. Please paste the error message manually.",
      });
      return;
    }

    console.log("Parsing error message");
    const parsedError = parseError(resolvedErrorText);
    console.log(
      `Error parsed: ${parsedError.errorType}, file: ${parsedError.fileName}, language: ${parsedError.language}`,
    );

    console.log("Extracting project files");
    let extractedFiles = [];

    if (projectZipFiles.length > 0) {
      extractedFiles = await extractZip(projectZipFiles[0].buffer, tempDir);
      console.log(`Extracted from ZIP: ${extractedFiles.length} files`);
    } else if (projectFiles.length > 0) {
      extractedFiles = await extractUploadedFiles(projectFiles);
      console.log(`Processed uploaded files: ${extractedFiles.length} files`);
    } else if (githubUrl?.trim()) {
      const sanitizedUrl = githubUrl.trim();
      if (
        !/^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+(\.git)?$/.test(sanitizedUrl)
      ) {
        res.status(400).json({
          error: "Invalid GitHub URL",
          details:
            "Please provide a valid GitHub repository URL (e.g. https://github.com/user/repo)",
        });
        return;
      }
      console.log(`Cloning GitHub repo: ${sanitizedUrl}`);
      extractedFiles = await cloneGithubRepo(sanitizedUrl, tempDir);
      console.log(
        `Cloned and extracted files from GitHub: ${extractedFiles.length} files`,
      );
    }

    if (extractedFiles.length === 0) {
      res.status(400).json({
        error: "No code files found",
        details: "The provided project contains no readable code files.",
      });
      return;
    }

    console.log(`Ranking files by relevance: ${extractedFiles.length} total`);
    const rankedFiles = rankFiles(extractedFiles, parsedError);

    if (rankedFiles.length === 0) {
      res.status(400).json({
        error: "No relevant files found",
        details:
          "Could not match any project files to the error. The error may not reference specific files, or the project structure may be unexpected.",
      });
      return;
    }

    const topFile = rankedFiles[0].file;
    console.log(
      `Top file selected: ${topFile.relativePath} (score: ${rankedFiles[0].score})`,
    );

    console.log("Extracting relevant code block");
    const extracted = extractRelevantCode(topFile, parsedError);

    console.log("Calling NVIDIA AI API for analysis");
    const result = await analyzeWithNvidia(
      parsedError,
      extracted.snippet,
      topFile.relativePath,
      extracted.startLine,
    );

    console.log(`Analysis complete: ${result.identifiedFile}`);
    res.json(result);
  } catch (err) {
    console.error(`Error during analysis: ${err.message}`);
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({
      error: "Analysis failed",
      details: message,
    });
  } finally {
    cleanupTempDir(tempDir);
  }
});

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default router;
