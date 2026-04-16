import Link from "next/link";
import {
  Activity,
  ShieldCheck,
  ClipboardList,
  Zap,
  ArrowRight,
  Stethoscope,
  Radio,
  FileClock,
} from "lucide-react";
export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* HEADER */}
      <header className="w-full px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Vital Link
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block text-sm font-medium text-slate-500">
            Authorised NHS Personnel Only
          </span>
          <Link
            href="/login"
            className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Staff Portal &rarr;
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-150 bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 pointer-events-none"></div>

        <div className="z-10 max-w-3xl w-full space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            System Online & Secure
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Next-Generation <br className="hidden md:block" /> Ward Management
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Replace the whiteboard. Vital Link provides real-time bed tracking,
            automated NEWS2 clinical scoring, and instant PDF handovers for
            modern healthcare teams.
          </p>

          <div className="pt-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-white font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Access Secure Portal <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="mt-4 text-xs text-slate-400 font-medium">
              Requires valid staff credentials.
            </p>
          </div>
        </div>

        <div className="z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full mt-24 text-left">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
            <div className="bg-rose-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Stethoscope className="w-6 h-6 text-rose-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Smart Clinical Triage
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Standardise admissions with our intelligent triage algorithm.
              Instantly categorise presenting complaints and establish baseline
              risk profiles before ward assignment.
            </p>
          </div>

          <div className="bg-green-100 p-6 rounded-2xl shadow-sm border border-green-200 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">
              Core Engine
            </div>
            <div className="bg-green-200 w-12 h-12 rounded-lg flex items-center justify-center mb-4 z-10">
              <Zap className="w-6 h-6 text-green-800" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 z-10">
              Automated NEWS2
            </h3>
            <p className="text-sm text-slate-800 leading-relaxed z-10">
              Input patient vitals and let the system calculate the Royal
              College of Physicians NEWS2 score instantly, complete with dynamic
              Hypercapnic Failure scaling.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-blue-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Live Ward Overview
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              A dynamic digital twin of your ward. Track bed occupancy, flag
              cleaning requirements, and instantly spot deteriorating patients
              via colour-coded alerts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
            <div className="bg-amber-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Radio className="w-6 h-6 text-amber-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Zero-Latency Sync
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Powered by secure WebSockets. When a patient's vitals crash, the
              ward board flashes red globally in milliseconds. No page refreshes
              required.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <ClipboardList className="w-6 h-6 text-purple-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Digital Handovers
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Generate print-ready, optimised PDF handovers with a single
              click. Keep shift changes fast, highly accurate, and completely
              paperless until print.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
            <div className="bg-slate-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <FileClock className="w-6 h-6 text-slate-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Immutable Audit Trails
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Enterprise-grade accountability. Every vital sign update, bed
              movement, and triage decision is automatically logged with
              time-stamps and author attribution.
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full py-6 text-center border-t border-slate-200 bg-white">
        <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          Vital Link Hospital System © {new Date().getFullYear()}. A project
          developed by David Muir.
        </p>
      </footer>
    </div>
  );
}
