const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL = "meta/llama-3.3-70b-instruct";
const MAX_TOKENS = 2048;

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

  const response = await fetch(NVIDIA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
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
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`NVIDIA API error: ${response.status} - ${errText}`);
    throw new Error(`NVIDIA API returned ${response.status}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || "";

  let parsed;
  try {
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in response");
    }
    parsed = JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error(`Failed to parse NVIDIA response: ${err.message}`);
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
}
