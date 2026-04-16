"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Activity, Baby, Stethoscope, BedDouble, AlertCircle } from "lucide-react";

type Ward = {
  id: string;
  name: string;
  type: string;
  beds: { status: string }[];
};

export default function WardsList({ wards }: { wards: Ward[] }) {
  const router = useRouter();

  const getWardIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "emergency":
        return <Activity size={24} className="text-red-600" />;
      case "paediatrics":
        return <Baby size={24} className="text-purple-600" />;
      case "specialist":
        return <Stethoscope size={24} className="text-blue-600" />;
      default:
        return <BedDouble size={24} className="text-slate-600" />;
    }
  };

  const getStatusBadge = (available: number, total: number) => {
    if (total === 0) return <span className="bg-gray-100 text-gray-500 border border-gray-200 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Offline</span>;
    
    const occupancyRate = (total - available) / total;
    
    if (occupancyRate >= 0.95) {
      return (
        <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
          <AlertCircle size={12} /> Critical Capacity
        </span>
      );
    }
    if (occupancyRate >= 0.85) {
      return <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">High Capacity</span>;
    }
    return <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">Accepting</span>;
  };

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
            className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col h-full border-slate-200"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start mb-2">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                    ward.type.toLowerCase() === "emergency"
                      ? "bg-red-50"
                      : ward.type.toLowerCase() === "paediatrics"
                      ? "bg-purple-50"
                      : ward.type.toLowerCase() === "specialist"
                      ? "bg-blue-50"
                      : "bg-slate-50"
                  }`}
                >
                  {getWardIcon(ward.type)}
                </div>
                
                {getStatusBadge(availableBeds, totalBeds)}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <CardTitle className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                {ward.name}
              </CardTitle>
              <p className="text-sm font-medium text-slate-500 mb-6">{ward.type} Ward</p>

              <div className="border-t border-slate-100 pt-4 space-y-3 mt-auto">
                
                <div className="flex justify-between text-xs mb-1 px-1">
                  <span className="text-red-700 font-bold">{occupiedBeds} Occupied</span>
                  {unavailableBeds > 0 && (
                    <span className="text-yellow-600 font-bold">{unavailableBeds} Blocked/Dirty</span>
                  )}
                  <span className="text-green-700 font-bold">{availableBeds} Available</span>
                </div>

                <div className="w-full bg-slate-100 h-2.5 rounded-full flex overflow-hidden shadow-inner">
                  <div
                    className="bg-red-500 h-full transition-all duration-500"
                    style={{ width: `${(occupiedBeds / totalBeds) * 100}%` }}
                    title={`${occupiedBeds} Occupied`}
                  />
                  <div
                    className="bg-yellow-400 h-full transition-all duration-500"
                    style={{ width: `${(unavailableBeds / totalBeds) * 100}%` }}
                    title={`${unavailableBeds} Cleaning/Blocked`}
                  />
                  <div
                    className="bg-green-500 h-full transition-all duration-500"
                    style={{ width: `${(availableBeds / totalBeds) * 100}%` }}
                    title={`${availableBeds} Available`}
                  />
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-2 uppercase tracking-widest font-semibold">
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