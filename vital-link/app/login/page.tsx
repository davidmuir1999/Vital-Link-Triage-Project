import LoginForm from "@/src/components/LoginForm";
import { Activity } from "lucide-react";

export default function Login() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden lg:flex w-1/2 bg-blue-600 flex-col justify-center items-center p-12 text-white relative overflow-hidden">
        <div className="max-w-md z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white p-2.5 rounded-xl shadow-lg">
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Vital Link</h1>
          </div>
          <h2 className="text-2xl font-semibold mb-4 leading-snug">
            Enterprise Ward Management
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Real-time patient tracking, automated NEWS2 clinical scoring, and
            seamless digital handovers for modern healthcare teams.
          </p>
        </div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      </div>
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8 bg-white shadow-2xl lg:shadow-none z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Please sign in to your NHS staff account.
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
