"use client";
import { SidebarTrigger } from '@/components/ui/sidebar'
import { usePathname } from 'next/navigation';
import React from 'react'

const Header = ({ title }) => {

  const pathname = usePathname();
  
   const parts = pathname.split("/").filter(Boolean);
    const lastPart = parts[parts.length - 1] || "Dashboard";

    return (
        <div>
            <header className="w-full sticky top-0 right-0 left-0 z-[50]  shadow-sm">
                <div className="h-14 px-4 border-b  flex items-center justify-between font-restart">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger />
                        <h2 className="text-md capitalize font-medium font-restart">{lastPart}</h2>
                    </div>
                </div>
            </header>

        </div>
    )
}

export default Header