import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

export function useAnalyze() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = async (params) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      if (params.projectZip) {
        formData.append("projectZip", params.projectZip);
      }

      if (params.projectFiles && params.projectFiles.length > 0) {
        params.projectFiles.forEach((file) => {
          formData.append("projectFiles", file);
        });
      }

      if (params.githubUrl) {
        formData.append("githubUrl", params.githubUrl);
      }

      if (params.errorText) {
        formData.append("errorText", params.errorText);
      }

      if (params.errorImage) {
        formData.append("errorImage", params.errorImage);
      }

      const res = await fetch(`${API_URL}/api/debug/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errorMessage = "An unexpected error occurred during analysis.";

        try {
          const errData = await res.json();
          errorMessage = errData.error || errorMessage;
        } catch {
          errorMessage = res.statusText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return {
    mutate,
    reset,
    isPending: loading,
    isError: !!error,
    error,
    data,
  };
}