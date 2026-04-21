"use client";

import {
  Activity,
  LayoutDashboard,
  Bed,
  Users,
  Settings,
  HeartPulse,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import LogoutButton from "./LogoutButton";
import { Session } from "next-auth";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Triage Queue", url: "/dashboard", icon: Activity },
  { title: "Bed Bureau", url: "/dashboard", icon: Bed },
  { title: "Patient Roster", url: "/dashboard", icon: Users },
  { title: "Settings", url: "/dashboard", icon: Settings },
];

export function AppSidebar({session}: {session: Session | null}) {
  const { isMobile, state } = useSidebar();

  const isExpanded = state === "expanded" || isMobile;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={`h-16 border-b border-gray-200 ${ state === "expanded" ? "p-4" : "p-2 items-center justify-center"}`}>
        <div className="flex items-center gap-2 overflow-hidden">
          <HeartPulse className="w-6 h-6 text-blue-700 shrink-0" />
          {isExpanded && (
            <span className="text-xl font-bold text-blue-700 whitespace-nowrap">
              Vital-Link
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200 overflow-hidden">
        {isExpanded ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                {session?.user?.name?.[0] || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || "Unknown User"}
                </p>
                <p className="text-xs text-gray-500 truncate uppercase">
                  {session?.user?.role?.replace(/_/g, " ") || "STAFF"}
                </p>
              </div>
            </div>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
              {session?.user?.name?.[0] || "U"}
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
