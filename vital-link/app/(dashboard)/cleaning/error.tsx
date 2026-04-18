"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function CleaningError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Cleaning schedule failed to load:", error);
  }, [error]);

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[50vh] space-y-6 text-center">
      <div className="bg-red-50 p-5 rounded-full border-8 border-red-100">
        <AlertTriangle className="w-12 h-12 text-red-600" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">
          Failed to load schedule
        </h1>
        <p className="text-slate-500 max-w-md mx-auto">
          We encountered a problem while retrieving the cleaning tasks from the database. 
          Please try refreshing the connection.
        </p>
      </div>

      <button
        onClick={() => reset()}
        className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-6 py-3 rounded-lg font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
      >
        <RefreshCcw className="w-5 h-5" />
        Try Again
      </button>
    </div>
  );
}