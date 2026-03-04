import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession as getNextAuthSession } from "next-auth/next";
import { AppSidebar } from "@/src/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/src/components/ui/sidebar";

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
<SidebarProvider>
      <AppSidebar session={session} />
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <header className="h-16 border-b border-gray-200 flex items-center bg-gray-50 shrink-0">
          <SidebarTrigger className="text-gray-500 hover:text-gray-900 pl-4" />
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}