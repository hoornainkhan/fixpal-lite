import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
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
        isFixed ? "border-mint/30" : "border-offwhite/15",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2 border-b text-xs font-mono",
          isFixed
            ? "bg-mint/10 border-mint/20 text-mint"
            : "bg-black/70 border-offwhite/10 text-[#a2d5c6]",
        )}
      >
        <div className="flex items-center gap-2">
          {isFixed && (
            <div className="w-2 h-2 rounded-full bg-mint animate-pulse" />
          )}
          <span>{language.toLowerCase()}</span>
        </div>
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-offwhite text-offwhite/60 flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" /> Copy
            </>
          )}
        </button>
      </div>
      <div className="max-h-[400px] overflow-auto bg-black/60">
        <SyntaxHighlighter
          language={language.toLowerCase()}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "1.25rem",
            background: "transparent",
            fontSize: "0.875rem",
            lineHeight: "1.6",
          }}
          showLineNumbers
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
