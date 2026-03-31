const CONTEXT_LINES = 20;

export function extractRelevantCode(file, parsedError) {
  const lines = file.content.split("\n");
  const totalLines = lines.length;

  let centerLine = parsedError.lineNumber || findBestLine(lines, parsedError);

  let startLine = Math.max(0, centerLine - CONTEXT_LINES - 1);
  let endLine = Math.min(totalLines - 1, centerLine + CONTEXT_LINES - 1);

  if (parsedError.functionName) {
    const funcRange = findFunctionRange(
      lines,
      parsedError.functionName,
      centerLine,
    );
    if (funcRange) {
      startLine = Math.max(0, funcRange.start - 2);
      endLine = Math.min(totalLines - 1, funcRange.end + 2);
    }
  }

  const maxSnippetLines = 80;
  if (endLine - startLine > maxSnippetLines) {
    const half = Math.floor(maxSnippetLines / 2);
    startLine = Math.max(0, centerLine - half - 1);
    endLine = Math.min(totalLines - 1, centerLine + half - 1);
  }

  const snippet = lines.slice(startLine, endLine + 1).join("\n");

  return {
    snippet,
    startLine: startLine + 1,
    endLine: endLine + 1,
    totalLines,
  };
}

function findBestLine(lines, parsedError) {
  const candidates = [];

  for (const keyword of parsedError.keywords) {
    if (!keyword || keyword.length < 3) continue;
    lines.forEach((line, idx) => {
      if (line.toLowerCase().includes(keyword.toLowerCase())) {
        candidates.push(idx + 1);
      }
    });
  }

  if (candidates.length > 0) {
    return candidates[Math.floor(candidates.length / 2)];
  }

  return Math.floor(lines.length / 2);
}

function findFunctionRange(lines, funcName, nearLine) {
  const funcPatterns = [
    new RegExp(
      `(?:def|function|func|fn|pub fn|async function|const\\s+${escapeRegex(funcName)}\\s*=)\\s+${escapeRegex(funcName)}\\s*[({]`,
    ),
    new RegExp(`${escapeRegex(funcName)}\\s*(?::\\s*\\(|\\()`),
  ];

  let funcStart = -1;
  for (
    let i = Math.max(0, nearLine - 50);
    i < Math.min(lines.length, nearLine + 50);
    i++
  ) {
    if (funcPatterns.some((p) => p.test(lines[i]))) {
      funcStart = i;
      break;
    }
  }

  if (funcStart === -1) return null;

  let depth = 0;
  let funcEnd = funcStart;
  for (let i = funcStart; i < Math.min(lines.length, funcStart + 100); i++) {
    const line = lines[i];
    depth += (line.match(/[{(]/g) || []).length;
    depth -= (line.match(/[})]/g) || []).length;
    if (i > funcStart && depth <= 0) {
      funcEnd = i;
      break;
    }
  }

  return { start: funcStart, end: funcEnd };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
