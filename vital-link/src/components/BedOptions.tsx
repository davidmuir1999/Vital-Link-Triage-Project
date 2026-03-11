"use client";

import { Maximize2, EllipsisVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
// 1. Add the Dropdown Menu imports
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function BedOptions({ bed }: { bed: any }) {
  const patient = bed.patient;

  if (!patient) return null;

  return (
    <Dialog>
      <div className="text-gray-400 absolute bottom-2 right-2 flex gap-2 z-10">
        
        <DialogTrigger asChild>
          <button className="hover:text-black hover:bg-gray-100 p-1 rounded transition duration-200">
            <Maximize2 className="w-4 h-4" />
          </button>
        </DialogTrigger>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hover:text-black hover:bg-gray-100 p-1 rounded transition duration-200">
              <EllipsisVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Bed Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem className="text-orange-600 font-medium cursor-pointer">
              Flag Cleaning Required
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem className="text-red-600 font-medium cursor-pointer focus:bg-red-50 focus:text-red-700">
              Discharge Patient
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>

      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
      <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl flex justify-between items-center">
            <span>
              {patient.lastName}, {patient.firstName}
            </span>
            <span className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold">
              NEWS2: {patient.news2Score}
            </span>
          </DialogTitle>
          <div className="text-sm text-gray-500 flex gap-4 mt-2">
            <span>DOB: {new Date(patient.dob).toLocaleDateString()}</span>
            <span>NHS: {patient.nhsNumber}</span>
            <span>Admitted: {new Date(patient.admissionDate).toLocaleString()}</span>
          </div>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden mt-4">
          
          <div className="border-r pr-6 overflow-y-auto">
            <h3 className="font-bold text-lg mb-3">Clinical Overview</h3>
            <div className="bg-gray-50 p-3 rounded mb-4">
              <p className="font-semibold text-sm">Presenting Complaints:</p>
              <p className="text-sm text-gray-700">
                {patient.complaintCategory.join(", ").replace(/_/g, " ")}
              </p>
              {patient.complaintDetails && (
                <p className="text-sm text-gray-600 italic mt-1">"{patient.complaintDetails}"</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="border p-2 rounded">❤️ HR: {patient.heartRate} bpm</div>
              <div className="border p-2 rounded">🩸 BP: {patient.bpSystolic}</div>
              <div className="border p-2 rounded">🫁 RR: {patient.respiratoryRate}</div>
              <div className="border p-2 rounded">
                O2: {patient.oxygenSat}% {patient.isOnOxygen && "(Supp)"}
              </div>
              <div className="border p-2 rounded">🌡️ Temp: {patient.temperature}°C</div>
              <div className="border p-2 rounded">🧠 Alert: {patient.consciousness}</div>
            </div>
          </div>

          <div className="flex flex-col h-full">
            <h3 className="font-bold text-lg mb-3">Clinical Notes</h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
              {patient.history?.length === 0 ? (
                <p className="text-gray-400 text-sm italic">No clinical notes recorded yet.</p>
              ) : (
                patient.history.map((log: any) => (
                  <div key={log.id} className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg text-sm">
                    <p className="text-gray-800">{log.message}</p>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <span className="font-medium text-blue-800">{log.author.name} ({log.author.role})</span>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-auto border-t pt-4">
              <textarea 
                className="w-full border rounded-md p-2 text-sm focus:outline-blue-500" 
                rows={3} 
                placeholder="Add a new clinical note..."
              />
              <button className="mt-2 w-full bg-blue-600 text-white py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition">
                Save Note
              </button>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}