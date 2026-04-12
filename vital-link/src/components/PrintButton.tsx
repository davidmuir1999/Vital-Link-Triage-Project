"use client"

import { Printer } from "lucide-react"

export default function PrintButton() {
    return (
        <button onClick={() => window.print()} className="print:hidden flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-bold shadow transition-colors">
            <Printer size={18}/> Save as PDF / Print
        </button>
    )
}