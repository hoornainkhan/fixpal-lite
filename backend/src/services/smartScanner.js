import path from "path";

export function rankFiles(files, parsedError) {
  const ranked = files.map((file) => {
    let score = 0;
    const reasons = [];

    if (parsedError.fileName) {
      const errorBaseName = path.basename(parsedError.fileName);
      const fileBaseName = path.basename(file.relativePath);

      if (fileBaseName === errorBaseName) {
        score += 100;
        reasons.push("exact filename match");
      } else if (
        fileBaseName.includes(
          path.basename(
            parsedError.fileName,
            path.extname(parsedError.fileName),
          ),
        )
      ) {
        score += 50;
        reasons.push("partial filename match");
      }

      if (file.relativePath.includes(parsedError.fileName)) {
        score += 80;
        reasons.push("path contains error file");
      }
    }

    for (const keyword of parsedError.keywords) {
      if (!keyword || keyword.length < 3) continue;
      const occurrences = countOccurrences(file.content, keyword);
      if (occurrences > 0) {
        score += Math.min(occurrences * 5, 30);
        reasons.push(`keyword "${keyword}" found ${occurrences}x`);
      }
    }

    if (parsedError.language) {
      const langExtensions = {
        python: [".py"],
        javascript: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"],
        java: [".java"],
        csharp: [".cs"],
        go: [".go"],
        ruby: [".rb"],
        rust: [".rs"],
        php: [".php"],
      };
      const exts = langExtensions[parsedError.language] || [];
      if (exts.includes(file.extension)) {
        score += 20;
        reasons.push("language matches");
      }
    }

    if (parsedError.errorType) {
      if (file.content.includes(parsedError.errorType)) {
        score += 15;
        reasons.push("error type found in file");
      }
    }

    const ignorePatterns = [
      "test",
      "spec",
      "mock",
      "fixture",
      "__test__",
      ".test.",
      ".spec.",
    ];
    const lowerPath = file.relativePath.toLowerCase();
    if (ignorePatterns.some((p) => lowerPath.includes(p))) {
      score -= 10;
    }

    return {
      file,
      score,
      reason: reasons.join("; ") || "general match",
    };
  });

  return ranked
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function countOccurrences(text, keyword) {
  let count = 0;
  let pos = 0;
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  while ((pos = lowerText.indexOf(lowerKeyword, pos)) !== -1) {
    count++;
    pos += lowerKeyword.length;
  }
  return count;
}
