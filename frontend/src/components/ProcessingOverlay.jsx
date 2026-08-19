import { useEffect, useState } from "react";
import { Bug, Check } from "lucide-react";

const ALL_STEPS = [
  { id: "read", text: "Reading error input..." },
  { id: "ocr", text: "Extracting text from image..." },
  { id: "parse", text: "Parsing error message..." },
  { id: "match", text: "Matching relevant files..." },
  { id: "extract", text: "Extracting code context..." },
  { id: "ai", text: "Generating AI fix..." },
];

export function ProcessingOverlay({ isVisible, hasImage }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = ALL_STEPS.filter((step) => step.id !== "ocr" || hasImage);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible, steps.length]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 rounded-2xl backdrop-blur-sm">
      <div className="max-w-md w-full p-8 flex flex-col items-center">
        <div className="relative w-24 h-24 mb-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-mint/25 animate-pulse" />
          <div className="absolute inset-0 rounded-full bg-mint/10 blur-xl" />
          <div className="relative z-10 w-16 h-16 rounded-2xl bg-black/85 border-2 border-mint/40 shadow-[0_0_40px_rgba(207,255,226,0.15)] flex items-center justify-center">
            <Bug className="w-8 h-8 text-mint" />
          </div>
        </div>

        <div className="w-full space-y-4 relative">
          <div className="absolute left-[1.125rem] top-4 bottom-4 w-px bg-[#a2d5c6]/20" />

          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isPast = index < currentStepIndex;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 relative z-10 transition-opacity duration-300 ${
                  isActive
                    ? "opacity-100"
                    : isPast
                      ? "opacity-50"
                      : "opacity-20"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                    isActive
                      ? "bg-mint text-black border border-mint shadow-[0_0_18px_rgba(207,255,226,0.25)]"
                      : isPast
                        ? "bg-black/60 text-[#a2d5c6] border border-[#a2d5c6]/30"
                        : "bg-black/40 text-offwhite/30 border border-offwhite/10"
                  }`}
                >
                  {isPast ? (
                    <Check className="w-4 h-4" />
                  ) : isActive ? (
                    <span className="w-2 h-2 rounded-full bg-black" />
                  ) : (
                    <span className="w-2 h-2 rounded-full border border-current" />
                  )}
                </div>
                <div className="flex-1">
                  <span
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isActive
                        ? "text-offwhite"
                        : isPast
                          ? "text-[#a2d5c6]"
                          : "text-offwhite/20"
                    }`}
                  >
                    {step.text}
                  </span>
                  {isActive && (
                    <div className="h-0.5 w-full bg-gradient-to-r from-mint to-transparent mt-1 rounded-full" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
