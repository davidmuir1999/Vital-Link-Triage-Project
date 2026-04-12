import { prisma } from "@/src/lib/db";
import PrintButton from "@/src/components/PrintButton";
import Link from "next/link";
import { ArrowLeft, OctagonPause } from "lucide-react";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ wardId: string }>;
}
export default async function HandoverPage({ params }: PageProps) {
  const { wardId } = await params;

  const ward = await prisma.ward.findUnique({
    where: {
      id: wardId,
    },
  });

  if (!ward) {
    notFound();
  }

  const occupiedBeds = await prisma.bed.findMany({
    where: {
      status: "OCCUPIED",
      ward: {
        id: wardId,
      },
    },
    include: {
      patient: {
        include: {
          history: {
            take: 2,
            orderBy: {
              timestamp: "desc",
            },
            include: {
              author: true,
            },
          },
        },
      },
    }
  });

  occupiedBeds.sort((a, b) => {
    return a.label.localeCompare(b.label, undefined, {numeric: true});
  });

  const currentDate = new Date().toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <div className="max-w-5xl mx-auto p-6 print:p-0 print:max-w-full">
      <style
        dangerouslySetInnerHTML={{
          __html: `@media print { html, body, main {height: auto !important;
            overflow: visible !important;
            display: block !important;} }`,
        }}
      />
      <div className="print:hidden flex justify-between items-center mb-8 border-b pb-4">
        <Link
          href={`/ward/${wardId}`}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Back to {ward.name}
        </Link>
        <PrintButton />
      </div>

      <div className="mb-8 border-b-2 border-black pb-4">
        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight">
          {ward.name} - Clinical Handover
        </h1>
        <div className="flex justify-between text-gray-600 font-medium mt-2">
          <p>Generated: {currentDate}</p>
          <p>Total Patients: {occupiedBeds.length}</p>
        </div>
      </div>

      <div className="print:block print:w-full">
        {occupiedBeds.map((bed) => {
          const patient = bed.patient;
          if (!patient) return null;

          return (
            <div
              key={bed.id}
              className="border border-gray-300 rounded-lg p-4 bg-white mb-6 print:block print:break-inside-avoid"
              style={{
                breakInside: "avoid",
                pageBreakInside: "avoid",
                display: "block",
              }}
            >
              <div className="flex justify-between items-start mb-3 border-b pb-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {bed.label} - {patient.lastName}, {patient.firstName}
                  </h2>
                  <p className="text-sm text-gray-600 font-mono mt-1">
                    DOB: {new Date(patient.dob).toLocaleDateString()} | NHS:{" "}
                    {patient.nhsNumber}
                  </p>
                </div>

                <div
                  className={`px-3 py-1 rounded border font-bold text-sm ${
                    patient.news2Score >= 7
                      ? "bg-red-100 border-red-300 text-red-800 print:border-black"
                      : patient.news2Score >= 5
                      ? "bg-orange-100 border-orange-300 text-orange-800 print:border-black"
                      : patient.news2Score >= 1
                      ? "bg-yellow-100 border-yellow-300 text-yellow-800 print:border-black"
                      : "bg-green-50 border-green-200 text-green-800 print:border-black"
                  }`}
                >
                  NEWS2: {patient.news2Score}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Presenting
                  </h3>
                  <p className="text-sm font-medium text-gray-800">
                    {patient.complaintCategory.join(", ").replace(/_/g, " ")}
                  </p>
                  {patient.complaintDetails && (
                    <p className="text-xs text-gray-600 italic mt-1">
                      "{patient.complaintDetails}"
                    </p>
                  )}
                </div>

                <div className="col-span-1">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Latest Vitals
                  </h3>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    <div>
                      HR: <span className="font-bold">{patient.heartRate}</span>
                    </div>
                    <div>
                      BP:{" "}
                      <span className="font-bold">{patient.bpSystolic}</span>
                    </div>
                    <div>
                      RR:{" "}
                      <span className="font-bold">
                        {patient.respiratoryRate}
                      </span>
                    </div>
                    <div>
                      SpO2:{" "}
                      <span className="font-bold">{patient.oxygenSat}%</span>{" "}
                      {patient.isOnOxygen && "(O2)"}
                    </div>
                    <div>
                      Temp:{" "}
                      <span className="font-bold">{patient.temperature}°</span>
                    </div>
                    <div className="truncate">
                      ACVPU:{" "}
                      <span className="font-bold">{patient.consciousness}</span>
                    </div>
                  </div>
                </div>

                <div className="col-span-1">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Recent Notes
                  </h3>
                  {patient.history.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">
                      No notes recorded.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {patient.history.map((note) => (
                        <div
                          key={note.id}
                          className="text-xs bg-gray-50 p-1.5 rounded border border-gray-100 print:bg-transparent print:border-none print:p-0"
                        >
                          <p className="text-gray-800 whitespace-pre-wrap leading-snug">
                            {note.message}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {new Date(note.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {note.author
                              ? ` - ${note.author.name}`
                              : " - System"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {occupiedBeds.length === 0 && (
          <div className="text-center py-12 text-gray-500 italic">
            No occupied beds to handover.
          </div>
        )}
      </div>

      <div className="hidden print:block mt-8 border-t border-gray-300 pt-4">
        <div className="flex justify-between text-xs text-gray-500">
          <p>Handover compiled automatically by Vital Link Server.</p>
        </div>
      </div>
    </div>
  );
}
