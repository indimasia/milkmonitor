"use client";

import React, { useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Milk,
  LineChart,
  BrainCircuit,
  LogOut,
  User,
} from "lucide-react";
import { AppContext } from "@/context/app-context";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/icons";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, logout } = useContext(AppContext);

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/feedings", label: "Feedings", icon: Milk },
    { href: "/growth", label: "Growth", icon: LineChart },
    { href: "/suggestions", label: "AI Suggestions", icon: BrainCircuit },
  ];
  
  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.includes(pathname);

  if (isPublicPath) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0" asChild>
              <Link href="/">
                <Logo className="size-5 text-primary" />
              </Link>
            </Button>
            <h2 className="text-lg font-semibold tracking-tight font-headline">
              MilkMonitor
            </h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator />
          <SidebarMenu>
            <SidebarMenuItem>
               <SidebarMenuButton tooltip={{children: currentUser?.email}}>
                 <Avatar className="size-7">
                    <AvatarFallback>
                      <User />
                    </AvatarFallback>
                  </Avatar>
                 <span>{currentUser?.email}</span>
               </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
               <SidebarMenuButton onClick={logout} tooltip={{children: 'Logout'}}>
                 <LogOut />
                 <span>Logout</span>
               </SidebarMenuButton>
             </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex items-center h-14 border-b bg-background/80 backdrop-blur-sm md:hidden px-4">
            <SidebarTrigger />
            <div className="flex items-center gap-2 mx-auto">
                <Logo className="size-5 text-primary" />
                <h2 className="text-lg font-semibold tracking-tight font-headline">
                MilkMonitor
                </h2>
            </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
