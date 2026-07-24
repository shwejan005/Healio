import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import React from "react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) {
    redirect("/")
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <Toaster />
      <div className="flex min-h-screen w-full bg-gradient-to-br from-[#f5fbf3] via-[#e5f4dd] to-[#d9efd0] text-[#2d4c2d] relative overflow-hidden">
        {/* Subtle Ambient Radial Backdrops */}
        <div className="fixed -top-40 -right-40 w-96 h-96 bg-[#88c488]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed -bottom-40 -left-40 w-96 h-96 bg-[#3a633a]/10 rounded-full blur-3xl pointer-events-none" />

        <AppSidebar />

        <div className="flex-1 flex flex-col min-h-screen w-full overflow-x-hidden relative z-10">
          <DashboardHeader />
          <main className="flex-1 p-0 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}