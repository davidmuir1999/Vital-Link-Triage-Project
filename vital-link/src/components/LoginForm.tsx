"use client";

import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      toast.success("Logged in successfully");
      const session = await getSession();
      if (session) {
        router.push("/dashboard");
      }
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 block">
          Email Address
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="employee@nhs.net"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-gray-50 focus:bg-white"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-gray-700 block">
            Password
          </label>
          <a
            href="#"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Forgot password?
          </a>
        </div>
        <input
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-gray-50 focus:bg-white"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-70 cursor-pointer"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Spinner className="w-5 h-5 text-white" />
            <span>Authenticating...</span>
          </div>
        ) : (
          <span>Sign In to Dashboard</span>
        )}
      </Button>
    </form>
  );
}
