import { prisma } from "@/src/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import BedOptions from "@/src/components/BedOptions";
import { sortBedsByLabel } from "@/src/lib/helperFunctions/sortingBedsByLabel";
import { FileText, PlusCircle } from "lucide-react"; // <-- Added PlusCircle for empty beds

interface PageProps {
  params: Promise<{ wardId: string }>;
}

export default async function WardPage({ params }: PageProps) {
  const { wardId } = await params;

  const ward = await prisma.ward.findUnique({
    where: {
      id: wardId,
    },
    include: {
      beds: {
        orderBy: {
          label: "asc",
        },
        include: {
          patient: {
            include: {
              history: {
                orderBy: { timestamp: "desc" },
                include: { author: true },
              },
            },
          },
        },
      },
    },
  });

  if (!ward) {
    notFound();
  }

  const sortedBeds = sortBedsByLabel(ward.beds);

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{ward.name}</h1>
          <p className="text-slate-500 mt-1">
            {ward.type} Ward • {ward.beds.length} Beds Total
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/ward/${wardId}/handover`}
            className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-4 py-2 rounded-md font-bold transition-colors shadow-sm"
          >
            <FileText size={18} />
            <span>Handover PDF</span>
          </Link>
          <Link
            href="/ward"
            className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex items-center justify-center shadow-sm"
          >
            ← Back to List
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {sortedBeds.map((bed) => (
          <div
            key={bed.id}
            className={`
                  p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col h-56 relative overflow-hidden
                  ${
                    bed.status === "AVAILABLE"
                      ? "border-dashed border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100"
                      : bed.status === "CLEANING_REQUIRED"
                      ? "border-amber-300 bg-amber-50 hover:border-amber-400"
                      : bed.status === "OCCUPIED"
                      ? "border-slate-200 bg-white shadow-sm hover:border-blue-300 hover:shadow-md"
                      : "bg-gray-100 border-gray-300"
                  }
                `}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-slate-800 text-lg">{bed.label}</span>

              <span
                className={`h-3 w-3 rounded-full shadow-sm ${
                  bed.status === "AVAILABLE"
                    ? "bg-slate-300"
                    : bed.status === "CLEANING_REQUIRED"
                    ? "bg-amber-500 animate-pulse"
                    : bed.status === "OCCUPIED"
                    ? "bg-blue-500"
                    : "bg-gray-500"
                }`}
              />
            </div>

            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {bed.status.replace(/_/g, " ")}
            </div>

            {bed.status === "AVAILABLE" ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-60 mt-2">
                <PlusCircle size={28} className="mb-2 text-slate-400" />
                <span className="text-sm font-medium">Ready for admission</span>
              </div>
            ) : bed.status === "OCCUPIED" && bed.patient ? (
              <div className="mt-auto bg-slate-50 p-3 rounded-lg border border-slate-100 flex-1 flex flex-col justify-between">
                <div>
                  <p className="font-bold text-slate-900 truncate text-base">
                    {bed.patient.lastName}, {bed.patient.firstName}
                  </p>
                  <span className="text-xs text-slate-500 font-mono mt-1 block">
                    NHS: *{bed.patient.nhsNumber.slice(-4)}
                  </span>
                </div>
                
                <div className="flex justify-between items-end mt-2">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md font-bold shadow-sm ${
                      bed.patient.news2Score >= 7
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : bed.patient.news2Score >= 5
                        ? "bg-orange-100 text-orange-800 border border-orange-200"
                        : "bg-green-100 text-green-800 border border-green-200"
                    }`}
                  >
                    NEWS: {bed.patient.news2Score}
                  </span>
                </div>
              </div>
            ) : bed.status === "OCCUPIED" && !bed.patient ? (
              <div className="mt-auto flex-1 flex items-center justify-center">
                <span className="text-xs font-medium text-slate-900 bg-red-100 border border-red-200 px-3 py-1.5 rounded-md shadow-sm">
                  System Error: Occupied (No Data)
                </span>
              </div>
            ) : null}

            {bed.status === "OCCUPIED" && (
              <div className="absolute bottom-4 right-4">
                <BedOptions bed={bed} />
              </div>
            )}
          </div>
        ))}
      </div>

      {ward.beds.length === 0 && (
        <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">No beds configured for this ward.</p>
        </div>
      )}
    </div>
  );
}