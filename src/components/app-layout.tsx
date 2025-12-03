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
  Menu,
} from "lucide-react";
import { AppContext } from "@/context/app-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/icons";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/feedings", label: "Feedings", icon: Milk },
  { href: "/growth", label: "Growth", icon: LineChart },
  { href: "/suggestions", label: "AI Suggestions", icon: BrainCircuit },
];

function NavLinks({ isMobile }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const links = navItems.map((item) => {
    const linkButton = (
      <Link key={item.href} href={item.href} passHref>
        <Button
          variant={pathname === item.href ? "secondary" : "ghost"}
          className="justify-start w-full gap-3"
        >
          <item.icon className="size-4" />
          <span>{item.label}</span>
        </Button>
      </Link>
    );
    if (isMobile) {
      return <SheetClose asChild key={item.href}>{linkButton}</SheetClose>;
    }
    return linkButton;
  });

  return <nav className="flex flex-col gap-2">{links}</nav>;
}

function SidebarContent({ isMobile = false }: { isMobile?: boolean }) {
    const { currentUser, logout } = useContext(AppContext);
    
    const logoutButton = (
        <Button variant="outline" className="w-full justify-start gap-3" onClick={logout}>
            <LogOut className="size-4"/>
            <span>Logout</span>
        </Button>
    );

    return (
        <>
            <div className="flex items-center gap-2 p-4 border-b">
                <Logo className="size-6 text-primary" />
                <h2 className="text-xl font-semibold tracking-tight font-headline">
                MilkMonitor
                </h2>
            </div>
            <div className="flex-1 p-4">
                <NavLinks isMobile={isMobile} />
            </div>
            <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-4">
                <Avatar className="size-9">
                    <AvatarFallback>
                    <User />
                    </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate">{currentUser?.email}</span>
            </div>
            {isMobile ? <SheetClose asChild>{logoutButton}</SheetClose> : logoutButton}
            </div>
        </>
    );
}


export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.includes(pathname);

  if (isPublicPath) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden md:flex md:flex-col md:w-64 md:border-r bg-background">
        <SidebarContent />
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between h-14 border-b bg-background/80 backdrop-blur-sm px-4 md:hidden">
            <Link href="/" className="flex items-center gap-2">
                <Logo className="size-6 text-primary" />
                <h2 className="text-lg font-semibold tracking-tight font-headline">
                MilkMonitor
                </h2>
            </Link>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64 p-0 flex flex-col">
                   <SidebarContent isMobile={true} />
                </SheetContent>
            </Sheet>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
