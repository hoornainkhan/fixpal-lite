import { useState, useRef } from "react";
import { useAnalyze } from "../hooks/useAnalyze";
import { useToast } from "../hooks/useToast";
import { ProcessingOverlay } from "../components/ProcessingOverlay";
import { CodeBlock } from "../components/CodeBlock";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  FileArchive,
  FileText,
  Folder,
  GitBranch,
  Image,
  Info,
  Lightbulb,
  RefreshCw,
  Upload,
  XCircle,
} from "lucide-react";

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
  };const handleReset = () => {
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
    <div className="min-h-screen w-full relative overflow-x-hidden pb-24 text-offwhite">
      {/* Header */}
      <header className="w-full border-b border-offwhite/10 bg-black/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl leading-tight font-[Handlee]">
              FixPal <span className="text-mint">Lite</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Toast notifications */}
      <div className="fixed top-20 right-6 z-40 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-lg border backdrop-blur-md ${
              t.variant === "destructive"
                ? "bg-black/90 border-[#a2d5c6]/30 text-offwhite"
                : "bg-black/70 border-offwhite/15 text-offwhite"
            }`}
          >
            <div className="font-semibold flex items-center gap-2">
              {t.variant === "destructive" ? (
                <AlertTriangle className="w-4 h-4 text-mint" />
              ) : (
                <Info className="w-4 h-4 text-[#a2d5c6]" />
              )}
              {t.title}
            </div>
            <div className="text-sm text-offwhite/70">{t.description}</div>
          </div>
        ))}
      </div>

      <main className="max-w-6xl mx-auto px-6 pt-12">
        {!result && !isError ? (
          <div className="relative">
            <ProcessingOverlay
              isVisible={isPending}
              hasImage={errorMode === "image" && !!errorImage}
            /><div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Find the root cause,{" "}
                <span className="text-mint">instantly.</span>
              </h2>
              <p className="text-lg text-offwhite/60 max-w-2xl mx-auto">
                Provide your code context and the error message. Our AI engine
                will scan, locate the bug, and generate a working fix.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* PROJECT SOURCE PANEL */}
              <div className="bg-black/50 backdrop-blur-sm border border-offwhite/10 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-[#a2d5c6]/10 border border-[#a2d5c6]/40 flex items-center justify-center">
                    <span className="text-sm font-bold text-mint">1</span>
                  </div>
                  <h3 className="text-xl font-semibold">Project Source</h3>
                </div>

                <div className="flex p-1 bg-black/60 border border-offwhite/10 rounded-lg mb-6">
                  {["zip", "files", "github"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setProjectMode(mode)}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                        projectMode === mode
                          ? "bg-mint text-black shadow-sm"
                          : "text-offwhite/50 hover:text-offwhite hover:bg-mint/10"
                      }`}
                    >
                      {mode === "zip" && <FileArchive className="w-4 h-4" />}
                      {mode === "files" && <Folder className="w-4 h-4" />}
                      {mode === "github" && <GitBranch className="w-4 h-4" />}
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div><div className="min-h-[160px]">
                  {projectMode === "zip" && (
                    <div
                      onClick={() => zipInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                        zipFile
                          ? "border-mint/60 bg-mint/10"
                          : "border-offwhite/15 hover:border-mint/60 hover:bg-mint/5"
                      }`}
                    >
                      <input
                        type="file"
                        ref={zipInputRef}
                        accept=".zip,application/zip"
                        className="hidden"
                        onChange={(e) =>
                          setZipFile(e.target.files?.[0] || null)
                        }
                      />
                      {zipFile ? (
                        <div className="flex flex-col items-center">
                          <FileArchive className="w-10 h-10 text-mint mb-3" />
                          <p className="font-medium">{zipFile.name}</p>
                          <p className="text-xs text-offwhite/50 mt-1">
                            {(zipFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-10 h-10 text-[#a2d5c6] mb-3" />
                          <p className="font-medium">Upload Project ZIP</p>
                          <p className="text-sm text-offwhite/50 mt-1">
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
                          ? "border-mint/60 bg-mint/10"
                          : "border-offwhite/15 hover:border-mint/60 hover:bg-mint/5"
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
                      />{projectFiles.length > 0 ? (
                        <div className="flex flex-col items-center">
                          <Folder className="w-10 h-10 text-mint mb-3" />
                          <p className="font-medium">
                            {projectFiles.length} files selected
                          </p>
                          <div className="flex flex-wrap justify-center gap-2 mt-3">
                            {projectFiles.slice(0, 3).map((f) => (
                              <span
                                key={f.name}
                                className="text-xs bg-black/60 px-2 py-1 rounded border border-offwhite/10"
                              >
                                {f.name}
                              </span>
                            ))}
                            {projectFiles.length > 3 && (
                              <span className="text-xs bg-black/60 px-2 py-1 rounded border border-offwhite/10">
                                +{projectFiles.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-10 h-10 text-[#a2d5c6] mb-3" />
                          <p className="font-medium">Select Individual Files</p>
                          <p className="text-sm text-offwhite/50 mt-1">
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
                        className="w-full bg-black/60 border border-offwhite/15 rounded-xl px-4 py-3 text-offwhite placeholder:text-offwhite/30 focus:outline-none focus:ring-2 focus:ring-mint/40"
                      />
                      <p className="text-xs text-offwhite/40">
                        Public repositories only.
                      </p>
                    </div>
                  )}
                </div>
              </div>{/* ERROR DETAILS PANEL */}
              <div className="bg-black/50 backdrop-blur-sm border border-offwhite/10 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-[#a2d5c6]/10 border border-[#a2d5c6]/40 flex items-center justify-center">
                    <span className="text-sm font-bold text-mint">2</span>
                  </div>
                  <h3 className="text-xl font-semibold">Error Details</h3>
                </div>

                <div className="flex p-1 bg-black/60 border border-offwhite/10 rounded-lg mb-6">
                  {["text", "image"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setErrorMode(mode)}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                        errorMode === mode
                          ? "bg-mint text-black shadow-sm"
                          : "text-offwhite/50 hover:text-offwhite hover:bg-mint/10"
                      }`}
                    >
                      {mode === "text" ? (
                        <FileText className="w-4 h-4" />
                      ) : (
                        <Image className="w-4 h-4" />
                      )}
                      {mode === "text" ? "Paste Text" : "Screenshot"}
                    </button>
                  ))}
                </div>

                <div className="min-h-[160px]">
                  {errorMode === "text" && (
                    <textarea
                      placeholder="Paste your stack trace, terminal output, or error message here..."
                      value={errorText}
                      onChange={(e) => setErrorText(e.target.value)}
                      className="w-full h-40 bg-black/60 border border-offwhite/15 rounded-xl p-4 text-sm font-mono text-offwhite placeholder:text-offwhite/30 focus:outline-none focus:ring-2 focus:ring-mint/40 resize-none"
                    />
                  )}

                  {errorMode === "image" && (
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className={`h-40 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center ${
                        errorImage
                          ? "border-mint/60 bg-mint/10"
                          : "border-offwhite/15 hover:border-mint/60 hover:bg-mint/5"
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
                      />{errorImage ? (
                        <>
                          <Image className="w-10 h-10 text-mint mb-2" />
                          <p className="font-medium">{errorImage.name}</p>
                          <p className="text-xs text-mint mt-1 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Ready for OCR
                          </p>
                        </>
                      ) : (
                        <>
                          <Image className="w-10 h-10 text-[#a2d5c6] mb-2" />
                          <p className="font-medium">Upload Screenshot</p>
                          <p className="text-xs text-offwhite/40 mt-1">
                            PNG, JPG
                          </p>
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
                className="px-8 py-4 bg-mint hover:bg-[#a2d5c6] text-black font-bold text-lg rounded-2xl shadow-[0_0_35px_rgba(207,255,226,0.18)] transition-all duration-300 hover:-translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <span className="flex items-center gap-3">
                  Analyze Error
                  <ArrowRight className="w-5 h-5" />
                </span>
              </button>
            </div>
          </div>
        ) : result ? (<div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-mint" />
                  Analysis Complete
                </h2>
                <p className="text-offwhite/50 mt-2">
                  Here is what went wrong and how to fix it.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-black/60 hover:bg-mint/10 border border-offwhite/15 rounded-lg font-medium transition-colors flex items-center gap-2 self-start sm:self-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Analyze Another
              </button>
            </div>

            {/* Summary Card */}
            <div className="bg-black/50 border border-offwhite/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-offwhite/10 bg-black/40 flex items-start gap-4">
                <div className="mt-1 w-10 h-10 rounded-full bg-[#a2d5c6]/10 text-mint flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">Error Summary</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 border border-offwhite/15 text-xs font-mono text-[#a2d5c6] flex items-center gap-1.5">
                      {result.identifiedFile}
                      {result.lineNumber && (
                        <span className="text-offwhite/50">
                          :{result.lineNumber}
                        </span>
                      )}
                    </span>
                  </div>
                  <p className="text-offwhite/70 leading-relaxed">
                    {result.errorSummary}
                  </p>
                </div>
              </div><div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 w-10 h-10 rounded-full bg-mint/10 text-mint flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Explanation</h3>
                    <p className="text-offwhite/70 leading-relaxed">
                      {result.explanation}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-offwhite/70 flex items-center gap-2 uppercase tracking-wider">
                  <XCircle className="w-4 h-4" />
                  Buggy Code
                </h4>
                <CodeBlock
                  code={result.buggyCode}
                  language={result.language || "javascript"}
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-mint flex items-center gap-2 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  Fixed Code
                </h4>
                <CodeBlock
                  code={result.fixedCode}
                  language={result.language || "javascript"}
                  isFixed={true}
                />
              </div>
            </div>
          </div>
        ) : (<div className="max-w-xl mx-auto mt-20 bg-black/60 border border-offwhite/15 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#a2d5c6]/10 border border-[#a2d5c6]/30 flex items-center justify-center mx-auto mb-6 text-mint">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Analysis Failed</h2>
            <p className="text-offwhite/60 mb-8">
              {analyzeMutation.error?.message ||
                "An unexpected error occurred while analyzing the codebase."}
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-black/60 hover:bg-mint border border-offwhite/15 text-offwhite rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}