import { useEffect, useState } from "react";

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
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 rounded-2xl backdrop-blur-sm">
      <div className="max-w-md w-full p-8 flex flex-col items-center">
        <div className="relative w-24 h-24 mb-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500 blur-xl opacity-20 animate-pulse" />
          <div className="relative z-10 w-16 h-16 rounded-2xl bg-gray-800 border-2 border-emerald-500/50 shadow-lg flex items-center justify-center">
            <span className="text-2xl">✨</span>
          </div>
        </div>

        <div className="w-full space-y-4 relative">
          <div className="absolute left-[1.125rem] top-4 bottom-4 w-px bg-gray-700" />

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
                      ? "opacity-40"
                      : "opacity-20"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                    isActive
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40"
                      : isPast
                        ? "bg-gray-700 text-gray-400 border border-gray-600"
                        : "bg-gray-800 text-gray-600 border border-gray-700"
                  }`}
                >
                  {isPast ? "✓" : isActive ? "•" : "○"}
                </div>
                <div className="flex-1">
                  <span
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isActive
                        ? "text-white"
                        : isPast
                          ? "text-gray-400"
                          : "text-gray-600"
                    }`}
                  >
                    {step.text}
                  </span>
                  {isActive && (
                    <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 to-transparent mt-1 rounded-full" />
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
