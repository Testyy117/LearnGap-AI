"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  BookOpen, 
  Target, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Trophy, 
  MessageSquare, 
  Settings, 
  UserCircle,
  ShieldCheck,
  BrainCircuit,
  LogOut,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const pathname = usePathname();

  const studentNav = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Subjects", icon: BookOpen, href: "/dashboard/subjects" },
    { name: "Gap Analysis", icon: Target, href: "/dashboard/analysis" },
    { name: "Study Plan", icon: Calendar, href: "/dashboard/plan" },
    { name: "Resources", icon: FileText, href: "/dashboard/resources" },
    { name: "Progress", icon: TrendingUp, href: "/dashboard/report" },
    { name: "Achievements", icon: Trophy, href: "/dashboard/achievements" },
    { name: "LearnBot", icon: MessageSquare, href: "/dashboard/chat" },
  ];

  const adminNav = [
    { name: "Admin Home", icon: ShieldCheck, href: "/dashboard/admin" },
    { name: "Manage Questions", icon: FileText, href: "/dashboard/admin/questions" },
    { name: "Platform Analytics", icon: TrendingUp, href: "/dashboard/admin/analytics" },
    { name: "System Settings", icon: Settings, href: "/dashboard/admin/settings" },
  ];

  const currentNav = isAdmin ? adminNav : studentNav;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-background w-full">
        <Sidebar className="border-r border-sidebar-border shadow-2xl">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <BrainCircuit className="text-white h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-bold text-foreground leading-tight">LearnGap AI</span>
                <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{isAdmin ? "Admin Console" : "Student Hub"}</span>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarSeparator className="opacity-50" />

          <SidebarContent className="px-2 py-4">
            <SidebarMenu>
              {currentNav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                    tooltip={item.name}
                    className={`transition-all duration-200 group h-11 ${
                      pathname === item.href 
                      ? "bg-primary/10 text-primary font-semibold" 
                      : "hover:bg-sidebar-accent hover:text-foreground"
                    }`}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className={`h-5 w-5 ${pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                      <span className="text-sm">{item.name}</span>
                      {pathname === item.href && (
                        <div className="ml-auto w-1 h-4 bg-primary rounded-full" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 mt-auto">
            <div className="space-y-4">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="h-11">
                    <Link href="/dashboard/settings" className="flex items-center gap-3">
                      <Settings className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start h-11 px-2 gap-3 hover:bg-destructive/10 hover:text-destructive group"
                  >
                    <LogOut className="h-5 w-5 text-muted-foreground group-hover:text-destructive" />
                    <span className="text-sm">Sign Out</span>
                  </Button>
                </SidebarMenuItem>
              </SidebarMenu>

              <SidebarSeparator />

              <div className="bg-secondary/40 rounded-xl p-3 border">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-9 w-9 border-2 border-primary/20">
                    <AvatarImage src="https://picsum.photos/seed/alex/100/100" />
                    <AvatarFallback>AS</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate">Alex Sterling</span>
                    <span className="text-[10px] text-muted-foreground truncate">alex.s@university.edu</span>
                  </div>
                </div>
                <Button 
                  onClick={() => setIsAdmin(!isAdmin)}
                  className={`w-full h-8 text-[11px] font-bold uppercase tracking-tight gap-1.5 transition-all shadow-sm ${
                    isAdmin 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "bg-sidebar-accent border border-primary/20 hover:border-primary/50"
                  }`}
                  variant="outline"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {isAdmin ? "Switch to Student View" : "Switch to Admin View"}
                </Button>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-6">
            <SidebarTrigger className="-ml-1" />
            <SidebarSeparator orientation="vertical" className="h-4" />
            <div className="flex-1">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                {pathname.split("/").pop()?.replace("-", " ") || "Dashboard"}
              </h2>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border text-xs font-medium">
                  <Trophy className="h-3.5 w-3.5 text-accent" />
                  <span>2,450 XP</span>
                  <SidebarSeparator orientation="vertical" className="h-3" />
                  <GraduationCap className="h-3.5 w-3.5 text-primary" />
                  <span>Level 12</span>
               </div>
               <Button size="icon" variant="ghost" className="relative">
                 <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
                 <Target className="h-5 w-5" />
               </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-background/50">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}