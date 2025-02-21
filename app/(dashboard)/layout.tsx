"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Link from "next/link";
import React from "react";


const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-screen overflow-hidden bg-[#E5F4DD]">
          <Link
            href="/home"
            className="absolute top-4 left-4 z-50 px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition md:hidden"
            >
              ← Back to Home
          </Link>
          {children}
        </main>

      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;