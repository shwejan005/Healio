import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import React from "react"
import { ArrowLeft } from "lucide-react"

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
    <SidebarProvider>
      <Toaster />
      <div className="flex min-h-screen w-full bg-gradient-to-br from-[#f2f9f0] via-[#e5f4dd] to-[#daf0d2] text-[#2d4c2d] relative overflow-hidden">
        {/* Subtle Ambient Radial Backdrops */}
        <div className="fixed -top-40 -right-40 w-96 h-96 bg-[#88c488]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed -bottom-40 -left-40 w-96 h-96 bg-[#3a633a]/10 rounded-full blur-3xl pointer-events-none" />

        <AppSidebar />

        <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative z-10">
          <Link
            href="/home"
            className="absolute top-4 left-4 z-50 px-3.5 py-2 text-xs font-bold bg-[#3a633a] text-white rounded-xl shadow-md hover:bg-[#2d4c2d] transition-all flex items-center gap-1.5 md:hidden"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}