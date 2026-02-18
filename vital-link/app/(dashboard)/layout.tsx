import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import LogoutButton from "@/src/components/LogoutButton";
import { getServerSession as getNextAuthSession } from "next-auth/next";
import formatRole from "@/lib/formatRole";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // User Logged In?
  const session = await getNextAuthSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-gray-100">

      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-blue-700">Vital-Link</span>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {session.user?.name?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session.user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session.user ? formatRole(session.user.role) : ""}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="mb-4">
              <LogoutButton />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}