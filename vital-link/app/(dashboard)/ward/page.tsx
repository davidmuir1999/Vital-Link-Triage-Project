import { prisma } from "@/src/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import WardsList from "@/src/components/WardsList";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function WardIndexPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const wards = await prisma.ward.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      beds: {
        select: {
          status: true,
        }
      }
    }
  });

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Select a Ward</h1>
        <p className="text-gray-500 mt-2">
          Welcome, {session.user?.name}. Please select a department to oversee.
        </p>
      </div>
      <WardsList wards={wards} />
    </div>
  );
}
