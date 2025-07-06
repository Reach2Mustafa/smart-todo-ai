"use client";
import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { SidebarProvider } from "@/components/ui/sidebar";


import React, { Suspense } from "react";

const Layout = ({ children }) => {
  return (
    <Suspense fallback={<div><Loading/></div>}>
      <div className="flex h-screen w-full overflow-hidden">
        <SidebarProvider
          style={{
            "--sidebar-width": "20rem",
          }}
        >
          <AppSidebar />

          <div className="flex flex-col flex-1 h-full">
            {/* Header */}
            <Header
             title="Profile" />

            {/* Scrollable content area */}
            <main className="flex-1  h-full overflow-y-auto">{children}</main>
          </div>
        </SidebarProvider>
      </div>
    </Suspense>
  );
};

export default Layout;
