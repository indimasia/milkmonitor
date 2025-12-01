"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Milk,
  LineChart,
  CalendarClock,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/feedings", label: "Feedings", icon: Milk },
    { href: "/growth", label: "Growth", icon: LineChart },
    { href: "/schedule", label: "Schedule", icon: CalendarClock },
  ];

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
