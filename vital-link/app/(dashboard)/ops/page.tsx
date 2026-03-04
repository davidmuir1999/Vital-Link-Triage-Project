import { prisma } from "@/src/lib/db";
import BedBureauBoard from "@/src/components/BedBureauBoard";

export default async function BedBureauPage() {
  const unassignedPatients = await prisma.patient.findMany({
    where: { bed: null },
    orderBy: {
      admissionDate: "asc",
    },
  });

  const wards = await prisma.ward.findMany({
    include: {
      beds: {
        include: {
          patient: true,
        },
      },
    },
  });

  return (
    <div className="p-8 h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-6">Bed Bureau Operations</h1>
      <BedBureauBoard
        initialPatients={unassignedPatients}
        initialWards={wards}
      />
    </div>
  );
}
