const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
// Default model confirmed working on the NVIDIA free tier (integrate.api.nvidia.com).
// NOTE: "meta/llama-3.3-70b-instruct" hangs forever (no response) when the account
// does not have that model provisioned - use a model available for your key instead.
const MODEL = process.env.NVIDIA_MODEL || "meta/llama-3.1-70b-instruct";
const MAX_TOKENS = 2048;
// Bound how long we wait for the NVIDIA API to respond (ms).
// Without this, an unresponsive model makes the request hang indefinitely.
const REQUEST_TIMEOUT_MS = Number(process.env.NVIDIA_TIMEOUT_MS) || 150000;

function buildPrompt(parsedError, codeSnippet, fileName, startLine) {
  return `You are an expert software debugger. Analyze the following error and code snippet, then provide a structured fix.

## Error Message
\`\`\`
${parsedError.rawMessage.slice(0, 2000)}
\`\`\`

## File: ${fileName} (lines ${startLine}+)
\`\`\`${parsedError.language || ""}
${codeSnippet.slice(0, 3000)}
\`\`\`

## Instructions
Respond with ONLY a valid JSON object (no markdown, no extra text) with these exact fields:
{
  "errorSummary": "One sentence describing the root cause of the error",
  "buggyCode": "The specific problematic code snippet (just the buggy part, not the whole file)",
  "fixedCode": "The corrected version of the buggy code",
  "explanation": "2-4 sentences explaining why the error occurred and how the fix resolves it",
  "confidence": "high|medium|low"
}

Be concise and precise. The buggyCode and fixedCode should be focused extracts, not the entire snippet.`;
}

export async function analyzeWithNvidia(
  parsedError,
  codeSnippet,
  fileName,
  startLine,
) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY environment variable is not set");
  }

  const prompt = buildPrompt(parsedError, codeSnippet, fileName, startLine);

  const requestBody = {
    model: MODEL,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: MAX_TOKENS,
    temperature: 0.1,
    top_p: 0.95,
  };

  let response;
  try {
    // AbortSignal.timeout() ensures we never hang forever waiting for NVIDIA.
    // A non-provisioned model (e.g. meta/llama-3.3-70b-instruct) accepts the
    // connection but never responds - without this timeout the request hangs
    // indefinitely and the frontend just keeps loading.
    response = await fetch(NVIDIA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

  } catch (fetchErr) {
    if (fetchErr.name === "TimeoutError" || fetchErr.name === "AbortError") {
      console.error(
        `NVIDIA API request timed out after ${Math.round(REQUEST_TIMEOUT_MS / 1000)}s. ` +
          `The model "${MODEL}" may not be available for your NVIDIA account.`,
      );
      throw new Error(
        `NVIDIA API request timed out after ${Math.round(REQUEST_TIMEOUT_MS / 1000)}s with no response. ` +
          `The model "${MODEL}" may not be available on your NVIDIA account. ` +
          `Try overriding the model with NVIDIA_MODEL env var (e.g. "meta/llama-3.1-8b-instruct") ` +
          `after confirming it is listed at build.nvidia.com.`,
      );
    }

    console.error("NVIDIA API request failed:", fetchErr.message);
    throw new Error(`Network error calling NVIDIA API: ${fetchErr.message}`);
  }

  if (!response.ok) {
    let errText = "";
    try {
      errText = await response.text();
    } catch (_) {
      // ignore - no error body available
    }

    if (response.status === 401) {
      console.error(
        "NVIDIA API authentication failed (401). Check NVIDIA_API_KEY in .env",
      );
    } else if (response.status === 404) {
      console.error(
        `NVIDIA API returned 404: the model "${MODEL}" is not provisioned for this API key. ` +
          "Check available models at https://build.nvidia.com and set NVIDIA_MODEL.",
      );
    } else if (response.status === 429) {
      console.error(
        "NVIDIA API rate limit exceeded (429). Wait before retrying.",
      );
    }

    throw new Error(
      `NVIDIA API returned ${response.status}: ${errText.substring(0, 500)}`,
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (parseErr) {
    console.error("Failed to parse NVIDIA API JSON response:", parseErr.message);
    throw new Error(`Failed to parse NVIDIA API response: ${parseErr.message}`);
  }

  const rawContent = data.choices?.[0]?.message?.content || "";

  const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);

      return {
        identifiedFile: fileName,
        errorSummary: parsed.errorSummary || `Error in ${fileName}`,
        buggyCode: parsed.buggyCode || codeSnippet.slice(0, 300),
        fixedCode: parsed.fixedCode || "// Fix could not be determined",
        explanation: parsed.explanation || "No explanation available",
        language: parsedError.language || undefined,
        lineNumber: parsedError.lineNumber || undefined,
        confidence: parsed.confidence || "medium",
      };
    } catch (parseErr) {
      console.warn(
        "Failed to parse AI response JSON; using fallback response:",
        parseErr.message,
      );
    }
  } else {
    console.warn(
      "NVIDIA response did not contain a JSON object; using fallback response",
    );
  }

  return {
    identifiedFile: fileName,
    errorSummary: parsedError.errorType
      ? `${parsedError.errorType} detected in ${fileName}`
      : `Error detected in ${fileName}`,
    buggyCode: codeSnippet.slice(0, 500),
    fixedCode:
      "// AI could not determine fix automatically. Please review the code manually.",
    explanation:
      rawContent.slice(0, 500) ||
      "The AI response could not be parsed. Review the error manually.",
    language: parsedError.language || undefined,
    lineNumber: parsedError.lineNumber || undefined,
    confidence: "low",
  };
}
