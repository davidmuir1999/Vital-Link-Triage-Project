"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
import { toast } from "sonner";

export default function LogoutButton() {

  async function handleLogout(){
    toast.success("Signing Out...");
    await new Promise((resolve) => setTimeout(resolve, 500));
    await signOut({ callbackUrl: "/login" });
  }


    return (
      <button
        onClick={handleLogout} // Redirects them to login after signing out
        className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <LogOut className="w-4 h-4"/>
        <span>Sign Out</span>
      </button>
    );
  }