export function parseError(rawMessage) {
  const result = {
    rawMessage,
    errorType: null,
    fileName: null,
    lineNumber: null,
    columnNumber: null,
    functionName: null,
    keywords: [],
    language: null,
  };

  result.language = detectLanguage(rawMessage);

  const ERROR_PATTERNS = {
    python: [
      /File "([^"]+)", line (\d+)/,
      /((?:TypeError|ValueError|AttributeError|ImportError|ModuleNotFoundError|KeyError|IndexError|NameError|RuntimeError|SyntaxError|IndentationError|ZeroDivisionError|OSError|FileNotFoundError|PermissionError|StopIteration|RecursionError|AssertionError|OverflowError|MemoryError|UnicodeError|NotImplementedError|Exception|BaseException|SystemExit|KeyboardInterrupt)[:\s])/,
    ],
    javascript: [
      /at .*? \(([^)]+):(\d+):(\d+)\)/,
      /([^/\s]+\.(js|jsx|ts|tsx)):(\d+):(\d+)/,
      /((?:TypeError|ReferenceError|SyntaxError|RangeError|URIError|EvalError|Error)[:\s])/,
    ],
    java: [
      /at ([\w.]+)\(([^:)]+):(\d+)\)/,
      /((?:NullPointerException|ArrayIndexOutOfBoundsException|ClassCastException|IllegalArgumentException|IllegalStateException|RuntimeException|Exception)[:\s])/,
    ],
    csharp: [
      /in ([^:]+):line (\d+)/,
      /((?:NullReferenceException|ArgumentException|InvalidOperationException|Exception)[:\s])/,
    ],
    go: [/([^/\s]+\.go):(\d+)/, /(goroutine \d+|panic:)/],
    ruby: [
      /([^:]+):(\d+):in `([^']+)'/,
      /((?:NoMethodError|NameError|TypeError|ArgumentError|RuntimeError)[:\s])/,
    ],
    rust: [/-->\s*([^:]+):(\d+):(\d+)/, /(error\[E\d+\]|thread '.*' panicked)/],
    php: [
      /in ([^\s]+) on line (\d+)/,
      /((?:Fatal error|Parse error|Warning|Notice|Error)[:\s])/,
    ],
  };

  const patterns = result.language ? ERROR_PATTERNS[result.language] || [] : [];
  for (const pattern of patterns) {
    const match = rawMessage.match(pattern);
    if (match) {
      if (match[1] && /\.\w+$/.test(match[1])) {
        result.fileName = result.fileName || match[1];
      }
      if (match[2] && /^\d+$/.test(match[2])) {
        result.lineNumber = result.lineNumber || parseInt(match[2], 10);
      }
    }
  }

  const FILE_PATTERN =
    /(?:File|file|in|at)\s+["']?([^\s"',:()]+\.\w{1,6})["']?/gi;
  const fileMatches = [...rawMessage.matchAll(FILE_PATTERN)];
  if (!result.fileName && fileMatches.length > 0) {
    result.fileName = fileMatches[0][1];
  }

  const LINE_PATTERN = /(?:line|Line|LINE)\s+(\d+)|:(\d+)(?::\d+)?/g;
  if (!result.lineNumber) {
    const lineMatches = [...rawMessage.matchAll(LINE_PATTERN)];
    if (lineMatches.length > 0) {
      const num = lineMatches[0][1] || lineMatches[0][2];
      if (num) result.lineNumber = parseInt(num, 10);
    }
  }

  const GENERIC_ERROR_PATTERN =
    /([\w.]+(?:Error|Exception|Fault|Panic|Warning|Fatal)(?::\s*.+)?)/g;
  const errorMatches = [...rawMessage.matchAll(GENERIC_ERROR_PATTERN)];
  if (errorMatches.length > 0) {
    result.errorType = errorMatches[0][1].split(":")[0].trim();
  }

  result.keywords = extractKeywords(rawMessage);
  return result;
}

function detectLanguage(message) {
  const lower = message.toLowerCase();
  if (/traceback|\.py.*line \d+|syntaxerror:|indentationerror:/i.test(message))
    return "python";
  if (
    /\.(?:js|jsx|ts|tsx):\d+|referenceerror:|typeerror:.*is not a function/i.test(
      message,
    )
  )
    return "javascript";
  if (/\.java:\d+|at \w[\w.]+\([\w.]+java:\d+\)/i.test(message)) return "java";
  if (/\.cs.*line \d+|system\.\w+exception/i.test(message)) return "csharp";
  if (/\.go:\d+|goroutine \d+|panic:/i.test(message)) return "go";
  if (/\.rb:\d+|nomethoderror|ruby/i.test(message)) return "ruby";
  if (/error\[e\d+\]|thread '.*' panicked|\.rs:\d+/i.test(message))
    return "rust";
  if (/\.php.*line \d+|fatal error.*php|parse error.*php/i.test(message))
    return "php";
  if (
    lower.includes("traceback") ||
    lower.includes("typeerror") ||
    lower.includes("exception")
  )
    return "python";
  return null;
}

function extractKeywords(message) {
  const keywords = [];

  const errorTypeMatch = message.match(
    /([\w]+(?:Error|Exception|Fault|Panic))/g,
  );
  if (errorTypeMatch) keywords.push(...errorTypeMatch.slice(0, 3));

  const fileMatch = message.match(/[\w.-]+\.\w{1,6}/g);
  if (fileMatch) {
    keywords.push(
      ...fileMatch
        .filter((f) =>
          /\.(js|jsx|ts|tsx|py|java|go|rb|rs|php|cs|cpp|c|h)$/i.test(f),
        )
        .slice(0, 5),
    );
  }

  const funcMatch = message.match(/(?:in|at|def|function)\s+([\w.]+)\s*\(/g);
  if (funcMatch) {
    const names = funcMatch.map((m) =>
      m.replace(/^(?:in|at|def|function)\s+/, "").replace(/\s*\($/, ""),
    );
    keywords.push(...names.slice(0, 3));
  }

  return [...new Set(keywords)].slice(0, 10);
}
