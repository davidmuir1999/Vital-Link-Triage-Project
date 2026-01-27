import Link from "next/link";

const wards = [
  { name: "Paediatrics", href: "/ward/paediatrics", theme: "bg-pink-100 text-pink-700", short: "PD" },
  { name: "General Surgery", href: "/ward/general", theme: "bg-blue-100 text-blue-700", short: "GS" },
  { name: "Intensive Care", href: "/ward/icu", theme: "bg-red-100 text-red-700", short: "ICU" },
  { name: "Cardiology", href: "/ward/cardiology", theme: "bg-rose-100 text-rose-700", short: "CD" },
  { name: "Emergency Assessment", href: "/ward/eau", theme: "bg-amber-100 text-amber-700", short: "EA" },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Bed Bureau
          </h1>
          <p className="text-gray-500">
            Real-time ward capacity and patient management.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {wards.map((ward) => (
            <Link
              key={ward.href}
              href={ward.href}
              className="group relative flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm ${ward.theme}`}
              >
                {ward.short}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                  {ward.name}
                </h3>
                <p className="text-sm text-gray-400">View dashboard</p>
              </div>

              <span className="absolute right-6 text-gray-300 opacity-0 transition-all group-hover:translate-x-1 group-hover:text-blue-500 group-hover:opacity-100">
                &rarr;
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}