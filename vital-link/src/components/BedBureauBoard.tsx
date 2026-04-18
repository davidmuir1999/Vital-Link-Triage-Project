"use client";

import { assignBed } from "../actions/bed-management";
import { sortBedsByLabel } from "../lib/helperFunctions/sortingBedsByLabel";
import BreachClock from "./BreachClock";
import { simulatePatientCrash } from "../actions/simulate-crash";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Activity, GripVertical } from "lucide-react";
import {
  useDraggable,
  useDroppable,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { toast } from "sonner";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  news2Score: number;
  complaintCategory: string[];
  admissionDate: Date;
}

interface Bed {
  id: string;
  label: string;
  status: "AVAILABLE" | "OCCUPIED" | "CLEANING_REQUIRED" | "MAINTENANCE";
  patient?: Patient | null;
}

interface Ward {
  id: string;
  name: string;
  type: string;
  beds: Bed[];
}

interface BedBureauBoardProps {
  initialPatients: Patient[];
  initialWards: Ward[];
}

function DraggablePatient({ patient }: { patient: Patient }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `patient-${patient.id}`,
    data: { patient },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`bg-white border p-3 rounded-lg shadow-sm cursor-grab transition-all relative ${
        isDragging
          ? "opacity-40 border-dashed"
          : "hover:border-blue-500 hover:shadow-md"
      }`}
    >
      <div className="flex items-center justify-center bg-slate-50 border-r border-gray-100 px-1 text-gray-400 hover:text-blue-500 transition-colors">
        <GripVertical size={16} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="w-full">
          <p className="font-semibold text-gray-900 truncate">
            {patient.lastName}, {patient.firstName}
          </p>
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {patient.complaintCategory.join(", ").replace(/_/g, " ")}
          </p>
        </div>

        <div className="flex flex-wrap justify-between items-center pt-2 mt-1 border-t border-gray-100 gap-2">
          <span
            className={`whitespace-nowrap text-xs font-bold px-2 py-0.5 rounded ${
              patient.news2Score >= 7
                ? "bg-red-100 text-red-800"
                : patient.news2Score >= 5
                ? "bg-orange-100 text-orange-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            NEWS: {patient.news2Score}
          </span>
          <div className="bg-gray-50 px-2 py-0.5 border rounded whitespace-nowrap">
            <BreachClock admissionDate={patient.admissionDate} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DroppableBed({ bed }: { bed: Bed }) {
  const isAvailable = bed.status === "AVAILABLE";

  const isCritical = bed.patient && bed.patient.news2Score >= 7;

  const { isOver, setNodeRef } = useDroppable({
    id: `bed-${bed.id}`,
    data: { bedId: bed.id },
    disabled: !isAvailable,
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: `patient-${bed.patient?.id}`,
    data: { patient: bed.patient, sourceBedId: bed.id },
    disabled: !bed.patient,
  });

  return (
    <div
      ref={setNodeRef}
      className={`border-2 border-dashed rounded p-3 h-24 flex flex-col justify-center items-center text-center transition-all ${
        isOver && isAvailable
          ? "bg-blue-100 border-blue-500 scale-105 shadow-inner border-dashed"
          : isAvailable
          ? "bg-green-50 border-green-300 hover:bg-green-100 border-dashed"
          : bed.status === "OCCUPIED"
          ? isCritical
            ? "bg-red-600 border-red-800 animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.6)] border-solid"
            : "bg-white border-slate-300 shadow-sm border-solid"
          : bed.status === "CLEANING_REQUIRED"
          ? "bg-yellow-50 border-yellow-400 border-solid"
          : "bg-gray-100 border-gray-300 opacity-60 border-solid"
      }`}
    >
      <span className={`text-xs font-mono font-bold mb-1 ${isCritical ? 'text-red-100' : 'text-gray-500'}`}>
        {bed.label}
      </span>

      {isAvailable ? (
        <span className="text-sm font-medium text-green-700">Empty</span>
      ) : bed.status === "OCCUPIED" && bed.patient ? (
        <div
          ref={setDragRef}
          {...listeners}
          {...attributes}
          className={`text-sm w-full h-full flex-1 flex flex-col items-center justify-center cursor-grab ${
            isDragging ? "opacity-30" : ""
          }`}
        >
          <p className={`font-bold ${isCritical ? 'text-white' : 'text-slate-800'}`}>{bed.patient.lastName}</p>
          <p className={`text-xs ${isCritical ? 'text-red-200 font-bold' : 'text-slate-500'}`}>NEWS: {bed.patient.news2Score}</p>
        </div>
      ) : (
        <span className="text-xs text-gray-500 font-medium">
          {bed.status.replace(/_/g, " ")}
        </span>
      )}
    </div>
  );
}

export default function BedBureauBoard({
  initialPatients,
  initialWards,
}: BedBureauBoardProps) {
  const [unassignedPatients, setUnassignedPatients] =
    useState<Patient[]>(initialPatients);

  const [isMounted, setIsMounted] = useState(false);

  const [wards, setWards] = useState<Ward[]>(initialWards);

  const [activePatient, setActivePatient] = useState<Patient | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const patientData = event.active.data.current?.patient;
    if (patientData) setActivePatient(patientData);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActivePatient(null);
    const { active, over } = event;

    if (!over) return;

    const targetBedId = (over.id as string).replace("bed-", "");
    const draggedPatient = active.data.current?.patient as Patient;
    const sourceBedId = active.data.current?.sourceBedId as string | undefined;

    if (!draggedPatient) return;

    const previousWardsSnapshot = [...wards];
    const previousUnassignedSnapshot = [...unassignedPatients];

    if (sourceBedId) {
      setWards((prevWards) =>
        prevWards.map((ward) => ({
          ...ward,
          beds: ward.beds.map((bed) => {
            if (bed.id === sourceBedId) {
              return { ...bed, status: "CLEANING_REQUIRED", patient: null };
            }
            if (bed.id === targetBedId) {
              return { ...bed, status: "OCCUPIED", patient: draggedPatient };
            }
            return bed;
          }),
        }))
      );
    } else {
      setUnassignedPatients((prev) =>
        prev.filter((p) => p.id !== draggedPatient.id)
      );
      setWards((prevWards) =>
        prevWards.map((ward) => ({
          ...ward,
          beds: ward.beds.map((bed) =>
            bed.id === targetBedId
              ? { ...bed, status: "OCCUPIED", patient: draggedPatient }
              : bed
          ),
        }))
      );
    }

    try {
      const result = await assignBed(draggedPatient.id, targetBedId);
      if (result.error) throw new Error(result.error);
      toast.success("Patient moved successfully");
    } catch (error) {
      setWards(previousWardsSnapshot);
      setUnassignedPatients(previousUnassignedSnapshot);
      toast.error(
        "Database update failed. Patient returned to original position."
      );
    }
  };

  const sortedTriageQueue = [...unassignedPatients].sort((a, b) => {
    const now = new Date().getTime();
    const fourHoursInMs = 4 * 60 * 60 * 1000;
    const thirtyMinutesInMs = 30 * 60 * 1000;

    const aTimeLeft = new Date(a.admissionDate).getTime() + fourHoursInMs - now;
    const bTimeLeft = new Date(b.admissionDate).getTime() + fourHoursInMs - now;

    const aIsBreaching = aTimeLeft <= thirtyMinutesInMs;
    const bIsBreaching = bTimeLeft <= thirtyMinutesInMs;

    if (aIsBreaching && !bIsBreaching) return -1;
    if (!aIsBreaching && bIsBreaching) return 1;

    if (a.news2Score !== b.news2Score) {
      return b.news2Score - a.news2Score;
    }
    return aTimeLeft - bTimeLeft;
  });

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel("hospital-vitals")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
        },
        (payload) => {
          console.log("incoming websocket payload", payload);
          if (payload.table.toLocaleLowerCase() === "patient") {
            const updatedPatient = payload.new;

            console.log("WebSocket caught a vital sign crash!", updatedPatient);

            setWards((currentWards) => {
              return currentWards.map((ward) => ({
                ...ward,
                beds: ward.beds.map((bed) => {
                  if (bed.patient && bed.patient?.id === updatedPatient.id) {
                    return {
                      ...bed,
                      patient: {
                        ...bed.patient,
                        news2Score: updatedPatient.news2Score,
                        heartRate: updatedPatient.heartRate,
                      },
                    };
                  }
                  return bed;
                }),
              }));
            });

            if (updatedPatient.news2Score >= 7) {
              toast.error(
                `CRITICAL: Patient ${updatedPatient.lastName} is deteriorating!`
              );
            }
          }
        }
      )
      .subscribe((status, err) => {
        console.log("📡 Supabase Connection Status:", status);
        if (err) console.error("📡 Supabase Connection Error:", err);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const [isSimulating, setIsSimulating] = useState(false);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleSimulation = () => {
    if (isSimulating) {
      if (simulationIntervalRef.current)
        clearInterval(simulationIntervalRef.current);
      setIsSimulating(false);
      toast.info("Patient simulation halted");
    } else {
      setIsSimulating(true);
      toast.info("God Mode activated. Patient will randomly deteriorate.");

      simulationIntervalRef.current = setInterval(async () => {
        const admittedPatients = initialWards
          .flatMap((ward) => ward.beds)
          .map((bed) => bed.patient)
          .filter(Boolean);

        if (admittedPatients.length === 0) return;

        const randomPatient =
          admittedPatients[Math.floor(Math.random() * admittedPatients.length)];

        if (randomPatient) {
          console.log(`Simulating crash for ${randomPatient.lastName}`);
          await simulatePatientCrash(randomPatient.id);
        }
      }, 10000);
    }
  };

  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current)
        clearInterval(simulationIntervalRef.current);
    };
  }, []);

  if (!isMounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500 font-medium animate-pulse">
          Loading Operations Board...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-6">
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="w-1/3 bg-gray-50 border rounded-lg p-4 flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
            Triage Queue ({unassignedPatients.length})
          </h2>

          <div className="flex-1 overflow-y-auto space-y-3">
            {unassignedPatients.length === 0 ? (
              <p className="text-gray-500 text-sm italic text-center mt-10">
                No patients waiting.
              </p>
            ) : (
              sortedTriageQueue.map((patient) => (
                <DraggablePatient key={patient.id} patient={patient} />
              ))
            )}
          </div>
        </div>
        <div className="w-2/3 bg-white border rounded-lg p-4 overflow-y-auto">
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              Hospital Capacity
            </h2>

            <button
              onClick={toggleSimulation}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-bold rounded-md transition-all ${
                isSimulating
                  ? "bg-red-100 text-red-700 border border-red-300 animate-pulse"
                  : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
              }`}
            >
              <Activity size={16} />
              {isSimulating ? "SIMULATION ACTIVE" : "God Mode"}
            </button>
          </div>

          <div className="space-y-6">
            {wards.map((ward) => {
              const sortedBeds = sortBedsByLabel(ward.beds);
              return (
                <div key={ward.id} className="border rounded bg-gray-50 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-gray-700">
                      {ward.name}
                    </h3>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {ward.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {sortedBeds.map((bed) => (
                      <DroppableBed key={bed.id} bed={bed} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <DragOverlay>
          {activePatient ? (
            <div className="bg-white border-2 border-blue-500 p-3 rounded shadow-2xl scale-105 cursor-grabbing rotate-3 w-70">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">
                    {activePatient.lastName}, {activePatient.firstName}
                  </p>
                  <p className="text-xs text-gray-500 truncate w-40">
                    {activePatient.complaintCategory
                      .join(", ")
                      .replace(/_/g, " ")}
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-800">
                  NEWS: {activePatient.news2Score}
                </span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
