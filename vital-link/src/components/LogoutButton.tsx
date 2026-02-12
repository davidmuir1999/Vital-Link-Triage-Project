"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export default function LogoutButton() {
    return (
      <button
        onClick={() => signOut({ callbackUrl: "/login" })} // Redirects them to login after signing out
        className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out</span>
      </button>
    );
  }