import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "../lib/utils";

export function CodeBlock({
  code,
  language = "javascript",
  className,
  isFixed = false,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "relative group rounded-xl overflow-hidden border",
        isFixed ? "border-emerald-500/30" : "border-gray-700",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2 border-b text-xs font-mono",
          isFixed
            ? "bg-emerald-950/30 border-emerald-500/20 text-emerald-200"
            : "bg-gray-900 border-gray-700 text-gray-400",
        )}
      >
        <div className="flex items-center gap-2">
          {isFixed && (
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
          <span>{language.toLowerCase()}</span>
        </div>
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white flex items-center gap-1.5"
        >
          {copied ? "✓ Copied" : "📋 Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language.toLowerCase()}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "1.25rem",
          background: "transparent",
          fontSize: "0.875rem",
          lineHeight: "1.5",
        }}
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
