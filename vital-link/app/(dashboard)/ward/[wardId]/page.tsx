import { prisma } from "@/src/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

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
      },
    },
  });

  if (!ward) {
    notFound();
  }

  return (
    <div className="space-y-6 h-screen">
      {/* HEADER & BACK BUTTON */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{ward.name}</h1>
          <p className="text-gray-500">
            {ward.type} Ward • {ward.beds.length} Beds Total
          </p>
        </div>
        <Link
          href="/ward"
          className="w-40 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          ← Back to List
        </Link>
      </div>

      {/* BEDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {ward.beds.map((bed) => (
          <div
            key={bed.id}
            className={`
                  relative p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md
                  ${
                    bed.status === "AVAILABLE"
                      ? "border-green-100 bg-green-50 hover:border-green-300"
                      : "border-red-100 bg-white hover:border-red-300"
                  }
                `}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-gray-700">{bed.label}</span>

              {/* Status Dot */}
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  bed.status === "AVAILABLE" ? "bg-green-500" : "bg-red-500"
                }`}
              />
            </div>

            <div className="text-xs font-mono text-gray-400">{bed.status}</div>

            {/* If occupied, we will eventually show patient name here */}
            {bed.status === "OCCUPIED" && (
              <div className="mt-2 text-xs font-medium text-gray-900 bg-red-100 px-2 py-1 rounded inline-block">
                Patient Occupied
              </div>
            )}
          </div>
        ))}
      </div>

      {/* EMPTY STATE (If ward has no beds) */}
      {ward.beds.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-gray-500">No beds configured for this ward.</p>
        </div>
      )}
    </div>
  );
}
