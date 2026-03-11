"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

type Ward = {
  id: string;
  name: string;
  type: string;
  beds: { status: string }[];
};

export default function WardsList({ wards }: { wards: Ward[] }) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wards.map((ward) => {
        const totalBeds = ward.beds.length;
        const availableBeds = ward.beds.filter(
          (bed) => bed.status === "AVAILABLE"
        ).length;
        const occupiedBeds = ward.beds.filter(
          (bed) => bed.status === "OCCUPIED"
        ).length;
        const unavailableBeds = totalBeds - availableBeds - occupiedBeds;

        return (
          <Card
            key={ward.id}
            onClick={() => router.push(`/ward/${ward.id}`)}
            className="group cursor-pointer transition-all hover:scale-[1.02] flex flex-col h-full"
          >
            <CardHeader>
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    ward.type === "Emergency"
                      ? "bg-red-100 text-red-600"
                      : ward.type === "Paediatrics"
                      ? "bg-purple-100 text-purple-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <span className="font-bold text-xl">{ward.name[0]}</span>
                </div>
                <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                  ID: {ward.id.slice(0, 4)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <CardTitle className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600">
                {ward.name}
              </CardTitle>
              <p className="text-sm text-gray-500 mb-4">{ward.type} Ward</p>

              <div className="border-t pt-4 space-y-2 mt-auto">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-medium">
                    {availableBeds} Available
                  </span>
                  <span className="text-red-500 font-medium">
                    {occupiedBeds} Occupied
                  </span>
                </div>

                <div className="w-full bg-gray-100 h-2 rounded-full flex overflow-hidden">
                  <div
                    className="bg-red-500 h-full"
                    style={{ width: `${(occupiedBeds / totalBeds) * 100}%` }}
                  />
                  <div
                    className="bg-yellow-400 h-full"
                    style={{ width: `${(unavailableBeds / totalBeds) * 100}%` }}
                  />
                  <div
                    className="bg-green-500 h-full"
                    style={{ width: `${(availableBeds / totalBeds) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-center text-gray-400 mt-1">
                  {totalBeds} total beds
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
