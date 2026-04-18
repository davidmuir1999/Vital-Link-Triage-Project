"use client";

import { useEffect } from "react";
import { ServerCrash, RefreshCcw } from "lucide-react";

export default function BedBureauError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Bed Bureau Operations Board failed to load:", error);
  }, [error]);

  return (
    <div className="p-8 h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="max-w-md w-full bg-white border border-red-200 rounded-xl shadow-lg p-8 text-center space-y-6">
        <div className="mx-auto bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center border-4 border-red-50">
          <ServerCrash className="w-10 h-10 text-red-600" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            System Connection Lost
          </h1>
          <p className="text-slate-500 text-sm">
            We are unable to retrieve the live hospital capacity and triage queue. 
            This is usually caused by a database timeout or a dropped connection.
          </p>
        </div>

        <button
          onClick={() => reset()}
          className="w-full flex justify-center items-center gap-2 bg-red-600 text-white hover:bg-red-700 px-6 py-3 rounded-lg font-bold shadow-sm transition-all active:scale-95"
        >
          <RefreshCcw className="w-5 h-5" />
          Reconnect to Database
        </button>
      </div>
    </div>
  );
}