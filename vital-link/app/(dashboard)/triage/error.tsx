"use client";

import { useEffect } from "react";
import { ClipboardX, RefreshCcw } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export default function TriageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Triage form failed to load:", error);
  }, [error]);

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-white p-10 rounded-xl shadow-sm border border-red-100 flex flex-col items-center text-center max-w-lg w-full">
        <div className="bg-red-50 p-4 rounded-full mb-6">
          <ClipboardX className="w-12 h-12 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Admission Form Unavailable
        </h1>
        
        <p className="text-gray-500 mb-8">
          The triage intake form encountered a critical error while rendering. 
          This may be due to a temporary network issue preventing the form logic from loading.
        </p>

        <Button 
          onClick={() => reset()}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-6 text-lg rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <RefreshCcw className="w-5 h-5" />
          Reload Triage Form
        </Button>
      </div>
    </div>
  );
}