import { useState, useRef } from "react";
import { useAnalyze } from "../hooks/useAnalyze";
import { useToast } from "../hooks/useToast";
import { ProcessingOverlay } from "../components/ProcessingOverlay";
import { CodeBlock } from "../components/CodeBlock";

export default function Home() {
  const { toast, toasts } = useToast();
  const analyzeMutation = useAnalyze();

  const [projectMode, setProjectMode] = useState("zip");
  const [errorMode, setErrorMode] = useState("text");

  const [zipFile, setZipFile] = useState(null);
  const [projectFiles, setProjectFiles] = useState([]);
  const [githubUrl, setGithubUrl] = useState("");

  const [errorText, setErrorText] = useState("");
  const [errorImage, setErrorImage] = useState(null);

  const zipInputRef = useRef(null);
  const filesInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleAnalyze = () => {
    const hasProject =
      (projectMode === "zip" && zipFile) ||
      (projectMode === "files" && projectFiles.length > 0) ||
      (projectMode === "github" && githubUrl.trim());

    const hasError =
      (errorMode === "text" && errorText.trim()) ||
      (errorMode === "image" && errorImage);

    if (!hasProject) {
      toast({
        title: "Missing Project",
        description: "Please provide your project source.",
        variant: "destructive",
      });
      return;
    }
    if (!hasError) {
      toast({
        title: "Missing Error",
        description: "Please provide the error details.",
        variant: "destructive",
      });
      return;
    }

    analyzeMutation.mutate({
      projectZip: projectMode === "zip" ? zipFile : null,
      projectFiles: projectMode === "files" ? projectFiles : null,
      githubUrl: projectMode === "github" ? githubUrl : undefined,
      errorText: errorMode === "text" ? errorText : undefined,
      errorImage: errorMode === "image" ? errorImage : null,
    });
  };

  const handleReset = () => {
    // Clear all input state
    setZipFile(null);
    setProjectFiles([]);
    setGithubUrl("");
    setErrorText("");
    setErrorImage(null);

    // Clear file input refs
    if (zipInputRef.current) zipInputRef.current.value = "";
    if (filesInputRef.current) filesInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";

    // Reset mutation state
    analyzeMutation.reset();
  };

  const isPending = analyzeMutation.isPending;
  const result = analyzeMutation.data;
  const isError = analyzeMutation.isError;

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden pb-24 bg-gray-950 text-gray-50">
      {/* Header */}
      <header className="w-full border-b border-gray-800 bg-gray-950/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
              🐛
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">
                FixPal<span className="text-emerald-400 font-normal">Lite</span>
              </h1>
            </div>
          </div>
          <div className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            AI Debugging Assistant
          </div>
        </div>
      </header>

      {/* Toast notifications */}
      <div className="fixed top-20 right-6 z-40 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-lg border ${t.variant === "destructive" ? "bg-red-950/30 border-red-500/30 text-red-200" : "bg-gray-800 border-gray-700 text-gray-200"}`}
          >
            <div className="font-semibold">{t.title}</div>
            <div className="text-sm">{t.description}</div>
          </div>
        ))}
      </div>

      <main className="max-w-6xl mx-auto px-6 pt-12">
        {!result && !isError ? (
          <div className="relative">
            <ProcessingOverlay
              isVisible={isPending}
              hasImage={errorMode === "image" && !!errorImage}
            />

            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Find the root cause,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">
                  instantly.
                </span>
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Provide your code context and the error message. Our AI engine
                will scan, locate the bug, and generate a working fix.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* PROJECT SOURCE PANEL */}
              <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-300">1</span>
                  </div>
                  <h3 className="text-xl font-semibold">Project Source</h3>
                </div>

                <div className="flex p-1 bg-gray-800 rounded-lg mb-6">
                  {["zip", "files", "github"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setProjectMode(mode)}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                        projectMode === mode
                          ? "bg-gray-700 text-white shadow-sm"
                          : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
                      }`}
                    >
                      {mode === "zip" && "📦"} {mode === "files" && "📁"}{" "}
                      {mode === "github" && "🔗"}
                      {" " + mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="min-h-[160px]">
                  {projectMode === "zip" && (
                    <div
                      onClick={() => zipInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                        zipFile
                          ? "border-emerald-500/50 bg-emerald-950/20"
                          : "border-gray-600 hover:border-emerald-500/50 hover:bg-gray-800/50"
                      }`}
                    >
                      <input
                        type="file"
                        ref={zipInputRef}
                        accept=".zip"
                        className="hidden"
                        onChange={(e) =>
                          setZipFile(e.target.files?.[0] || null)
                        }
                      />
                      {zipFile ? (
                        <div className="flex flex-col items-center">
                          <span className="text-3xl mb-3">📦</span>
                          <p className="font-medium">{zipFile.name}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {(zipFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="text-3xl mb-3">📤</span>
                          <p className="font-medium">Upload Project ZIP</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Select a .zip file containing your codebase
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {projectMode === "files" && (
                    <div
                      onClick={() => filesInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                        projectFiles.length > 0
                          ? "border-emerald-500/50 bg-emerald-950/20"
                          : "border-gray-600 hover:border-emerald-500/50 hover:bg-gray-800/50"
                      }`}
                    >
                      <input
                        type="file"
                        ref={filesInputRef}
                        multiple
                        className="hidden"
                        onChange={(e) =>
                          setProjectFiles(Array.from(e.target.files || []))
                        }
                      />
                      {projectFiles.length > 0 ? (
                        <div className="flex flex-col items-center">
                          <span className="text-3xl mb-3">📁</span>
                          <p className="font-medium">
                            {projectFiles.length} files selected
                          </p>
                          <div className="flex flex-wrap justify-center gap-2 mt-3">
                            {projectFiles.slice(0, 3).map((f) => (
                              <span
                                key={f.name}
                                className="text-xs bg-gray-800 px-2 py-1 rounded border border-gray-700"
                              >
                                {f.name}
                              </span>
                            ))}
                            {projectFiles.length > 3 && (
                              <span className="text-xs bg-gray-800 px-2 py-1 rounded border border-gray-700">
                                +{projectFiles.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="text-3xl mb-3">📤</span>
                          <p className="font-medium">Select Individual Files</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Upload the specific files throwing errors
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {projectMode === "github" && (
                    <div className="space-y-4 h-full flex flex-col justify-center">
                      <label className="text-sm font-medium">
                        Repository URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://github.com/username/repo"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                      <p className="text-xs text-gray-400">
                        Public repositories only.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ERROR DETAILS PANEL */}
              <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-300">2</span>
                  </div>
                  <h3 className="text-xl font-semibold">Error Details</h3>
                </div>

                <div className="flex p-1 bg-gray-800 rounded-lg mb-6">
                  {["text", "image"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setErrorMode(mode)}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                        errorMode === mode
                          ? "bg-gray-700 text-white shadow-sm"
                          : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
                      }`}
                    >
                      {mode === "text" && "📝"} {mode === "image" && "🖼️"}
                      {" " + (mode === "text" ? "Paste Text" : "Screenshot")}
                    </button>
                  ))}
                </div>

                <div className="min-h-[160px]">
                  {errorMode === "text" && (
                    <textarea
                      placeholder="Paste your stack trace, terminal output, or error message here..."
                      value={errorText}
                      onChange={(e) => setErrorText(e.target.value)}
                      className="w-full h-40 bg-gray-800 border border-gray-700 rounded-xl p-4 text-sm font-mono text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                    />
                  )}

                  {errorMode === "image" && (
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className={`h-40 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center ${
                        errorImage
                          ? "border-emerald-500/50 bg-emerald-950/20"
                          : "border-gray-600 hover:border-emerald-500/50 hover:bg-gray-800/50"
                      }`}
                    >
                      <input
                        type="file"
                        ref={imageInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          setErrorImage(e.target.files?.[0] || null)
                        }
                      />
                      {errorImage ? (
                        <>
                          <span className="text-3xl mb-2">🖼️</span>
                          <p className="font-medium">{errorImage.name}</p>
                          <p className="text-xs text-emerald-400 mt-1">
                            ✓ Ready for OCR
                          </p>
                        </>
                      ) : (
                        <>
                          <span className="text-3xl mb-2">🖼️</span>
                          <p className="font-medium">Upload Screenshot</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <div className="mt-12 flex justify-center">
              <button
                onClick={handleAnalyze}
                disabled={isPending}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <span className="flex items-center gap-3">
                  Analyze Error
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </button>
            </div>
          </div>
        ) : result ? (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  ✨ Analysis Complete
                </h2>
                <p className="text-gray-400 mt-2">
                  Here is what went wrong and how to fix it.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                🔄 Analyze Another
              </button>
            </div>

            {/* Summary Card */}
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-gray-700/50 bg-gray-800/50 flex items-start gap-4">
                <div className="mt-1 w-10 h-10 rounded-full bg-red-950/30 flex items-center justify-center flex-shrink-0">
                  ⚠️
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">Error Summary</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-gray-900 border border-gray-700 text-xs font-mono text-gray-300 flex items-center gap-1.5">
                      {result.identifiedFile}
                      {result.lineNumber && (
                        <span className="text-gray-500">
                          :{result.lineNumber}
                        </span>
                      )}
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {result.errorSummary}
                  </p>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 w-10 h-10 rounded-full bg-emerald-950/30 flex items-center justify-center flex-shrink-0">
                    💡
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Explanation</h3>
                    <p className="text-gray-300 leading-relaxed">
                      {result.explanation}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                  ❌ Buggy Code
                </h4>
                <CodeBlock
                  code={result.buggyCode}
                  language={result.language || "javascript"}
                  className="h-[400px] overflow-auto"
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
                  ✅ Fixed Code
                </h4>
                <CodeBlock
                  code={result.fixedCode}
                  language={result.language || "javascript"}
                  isFixed={true}
                  className="h-[400px] overflow-auto shadow-lg shadow-emerald-500/10"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto mt-20 bg-red-950/20 border border-red-500/30 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-950/40 flex items-center justify-center mx-auto mb-6">
              ⚠️
            </div>
            <h2 className="text-2xl font-bold mb-3">Analysis Failed</h2>
            <p className="text-gray-300 mb-8">
              {analyzeMutation.error?.message ||
                "An unexpected error occurred while analyzing the codebase."}
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-xl font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
