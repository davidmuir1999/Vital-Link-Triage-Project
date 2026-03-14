import CleanBedsList from "@/src/components/CleanBedsList";
import { prisma } from "@/src/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function CleaningPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const wardsWithDirtyBeds = await prisma.ward.findMany({
    where: {
      beds: {
        some: {
          status: "CLEANING_REQUIRED"
        }
      }
    },
    include: {
      beds: {
        where: {
          status: "CLEANING_REQUIRED"
        },
        orderBy: {
          label: "asc"
        }
      }
    }
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Cleaning Schedule</h1>
      <p className="text-gray-500 mb-8">Beds requiring immediate sanitation.</p>
      
      {wardsWithDirtyBeds.length === 0 ? (
        <div className="text-center py-12 bg-green-50 rounded-lg border-2 border-dashed border-green-200">
          <p className="text-green-700 font-bold">All clear! No beds require cleaning.</p>
        </div>
      ) : (
        <CleanBedsList dirtyWards={wardsWithDirtyBeds} />
      )}
    </div>
  );
}