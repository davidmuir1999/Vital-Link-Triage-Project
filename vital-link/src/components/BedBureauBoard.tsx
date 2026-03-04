"use client";

import { assignBed } from "../actions/bed-managment";
import { useState } from "react";
import {
  useDraggable,
  useDroppable,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { toast } from "sonner";

// 1. Define the Types based on your Prisma Schema
// We are only picking the fields we need for the UI right now to keep it clean.
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  news2Score: number;
  complaintCategory: string[];
}

// We need a nested type for the Ward because it includes Beds, and Beds can include a Patient.
interface Bed {
  id: string;
  label: string;
  status: "AVAILABLE" | "OCCUPIED" | "CLEANING_REQUIRED" | "MAINTENANCE";
  patient?: Patient | null; // The bed might be empty
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

// --- MINI COMPONENT 1: The Draggable Patient Card ---
function DraggablePatient({ patient }: { patient: Patient }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `patient-${patient.id}`, // Unique ID for the draggable
    data: { patient }, // We pass the whole patient object so we know WHO is being dragged
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`bg-white border p-3 rounded shadow-sm cursor-grab transition-colors relative ${
        isDragging ? "opacity-40 border-dashed" : "hover:border-blue-500"
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-gray-900">
            {patient.lastName}, {patient.firstName}
          </p>
          <p className="text-xs text-gray-500 truncate w-40">
            {patient.complaintCategory.join(", ").replace(/_/g, " ")}
          </p>
        </div>
        <span
          className={`text-xs font-bold px-2 py-1 rounded ${
            patient.news2Score >= 7
              ? "bg-red-100 text-red-800"
              : patient.news2Score >= 5
              ? "bg-orange-100 text-orange-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          NEWS: {patient.news2Score}
        </span>
      </div>
    </div>
  );
}

// --- MINI COMPONENT 2: The Droppable Bed ---
function DroppableBed({ bed }: { bed: Bed }) {
  // We only want to allow dropping if the bed is actually available
  const isAvailable = bed.status === "AVAILABLE";

  const { isOver, setNodeRef } = useDroppable({
    id: `bed-${bed.id}`, // Unique ID for the droppable zone
    data: { bedId: bed.id }, // So we know WHERE they were dropped
    disabled: !isAvailable, // Prevent dropping on occupied/dirty beds
  });

  return (
    <div
      ref={setNodeRef}
      className={`border-2 border-dashed rounded p-3 h-24 flex flex-col justify-center items-center text-center transition-all ${
        isOver && isAvailable
          ? "bg-blue-100 border-blue-500 scale-105 shadow-inner" // Highlight when hovering
          : isAvailable
          ? "bg-green-50 border-green-300 hover:bg-green-100"
          : bed.status === "OCCUPIED"
          ? "bg-red-50 border-red-300"
          : "bg-gray-100 border-gray-300 opacity-60"
      }`}
    >
      <span className="text-xs font-mono font-bold text-gray-500 mb-1">
        {bed.label}
      </span>

      {isAvailable ? (
        <span className="text-sm font-medium text-green-700">Empty</span>
      ) : bed.status === "OCCUPIED" && bed.patient ? (
        <div className="text-sm">
          <p className="font-bold text-red-800">{bed.patient.lastName}</p>
          <p className="text-xs text-red-600">NEWS: {bed.patient.news2Score}</p>
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
  // 2. Initialize local state.
  // We need this so when a drag finishes, we can instantly update the UI (Optimistic Update)
  // before the server finishes saving to the database.
  const [unassignedPatients, setUnassignedPatients] =
    useState<Patient[]>(initialPatients);
  const [wards, setWards] = useState<Ward[]>(initialWards);

  const [activeId, setActiveId] = useState<string | null>(null);
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    // 1. Did they drop it outside a valid bed? Do nothing.
    if (!over) return;

    // 2. Extract the raw IDs from the dnd-kit string IDs
    const patientId = (active.id as string).replace("patient-", "");
    const bedId = (over.id as string).replace("bed-", "");

    // 3. Find the patient object we are dragging
    const draggedPatient = unassignedPatients.find((p) => p.id === patientId);
    if (!draggedPatient) return;

    // --- OPTIMISTIC UI UPDATE ---

    // A. Remove patient from the triage queue
    setUnassignedPatients((prev) => prev.filter((p) => p.id !== patientId));

    // B. Place patient in the correct bed inside the wards state
    setWards((prevWards) =>
      prevWards.map((ward) => ({
        ...ward,
        beds: ward.beds.map((bed) =>
          bed.id === bedId
            ? { ...bed, status: "OCCUPIED", patient: draggedPatient }
            : bed
        ),
      }))
    );

    // --- SERVER TRANSACTION ---

    try {
      const result = await assignBed(patientId, bedId);
      if (result.error) throw new Error(result.error);

      console.log(`Successfully assigned patient ${patientId} to bed ${bedId}`);
      toast.success("Bed assigned successfully");
    } catch (error) {
      console.error(error);
      toast.error("Database failed to update. Refreshing board.");
    }
  };

  const activePatient = activeId
    ? unassignedPatients.find((p) => `patient-${p.id}` === activeId)
    : null;

  return (
    // 3. The Main Layout Grid
    <div className="flex h-full gap-6">
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* --- COLUMN 1: THE TRIAGE QUEUE (Draggable Sources) --- */}
        <div className="w-1/3 bg-gray-50 border rounded-lg p-4 flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
            Triage Queue ({unassignedPatients.length})
          </h2>

          {/* The list of patients waiting for beds */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {unassignedPatients.length === 0 ? (
              <p className="text-gray-500 text-sm italic text-center mt-10">
                No patients waiting.
              </p>
            ) : (
              unassignedPatients.map((patient) => (
                // 4. The Patient Card (Future Draggable)
                <DraggablePatient key={patient.id} patient={patient} />
              ))
            )}
          </div>
        </div>
        {/* --- COLUMN 2: THE WARD VIEW (Droppable Targets) --- */}
        <div className="w-2/3 bg-white border rounded-lg p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
            Hospital Capacity
          </h2>

          <div className="space-y-6">
            {wards.map((ward) => (
              <div key={ward.id} className="border rounded bg-gray-50 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-gray-700">
                    {ward.name}
                  </h3>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {ward.type}
                  </span>
                </div>

                {/* The Grid of Beds within the Ward */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {ward.beds.map((bed) => (
                    // 5. The Bed Card (Future Droppable)
                    <DroppableBed key={bed.id} bed={bed} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* THE FLYING CLONE */}
        <DragOverlay>
          {activePatient ? (
            // We render a static copy of the card here. It has no drag hooks, it just looks pretty.
            <div className="bg-white border-2 border-blue-500 p-3 rounded shadow-2xl scale-105 cursor-grabbing rotate-3">
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
