"use client";

import { useState, useTransition } from "react";
import { addClientNote } from "../actions/notes";

type Note = {
  id: string;
  message: string;
  timestamp: Date;
  author: {
    name: string;
    role: string;
  };
};

export default function ClinicalNotesFeed({
  patientId,
  initialNotes,
}: {
  patientId: string;
  initialNotes: Note[];
}) {
  const [newNote, setNewNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSaveNote = () => {
    if (!newNote.trim()) return;

    startTransition(async () => {
      const result = await addClientNote(patientId, newNote);

      if (result?.error) {
        alert(result.error);
      } else {
        setNewNote("");
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      <h3 className="font-bold text-lg mb-3">Clinical Notes</h3>

      {/* 1. The scrollable feed of existing notes */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
        {initialNotes?.length === 0 ? (
          <p className="text-gray-400 text-sm italic">
            No clinical notes recorded yet.
          </p>
        ) : (
          initialNotes.map((log) => (
            <div
              key={log.id}
              className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg text-sm"
            >
              <p className="text-gray-800">{log.message}</p>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span className="font-medium text-blue-800">
                  {log.author.name}{" "}
                  <span className="text-gray-400">({log.author.role})</span>
                </span>
                <span>
                  {new Date(log.timestamp).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 2. The input area locked to the bottom */}
      <div className="mt-auto border-t pt-4 bg-white">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="w-full border rounded-md p-2 text-sm focus:outline-blue-500 resize-none"
          rows={3}
          placeholder="Add a new clinical note..."
          disabled={isPending}
        />
        <button
          onClick={handleSaveNote}
          disabled={isPending || !newNote.trim()}
          className="mt-2 w-full bg-blue-600 text-white py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Note"}
        </button>
      </div>
    </div>
  );
}
