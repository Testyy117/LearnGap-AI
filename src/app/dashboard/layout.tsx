"use client";

    import * as React from "react";
    import Link from "next/link";
    import { onAuthStateChanged, signOut, type User } from "firebase/auth";
    import { usePathname, useRouter } from "next/navigation";
    import { BookOpen, Calendar, FileText, GraduationCap, LayoutDashboard, LibraryBig, Loader2, LogOut, MessageSquare, Settings, ShieldCheck, Target, Trophy, TrendingUp, BrainCircuit } from "lucide-react";

    import { auth } from "@/lib/firebase";
    import { getUserProfile, isAdminUser, type UserProfile } from "@/lib/user-profile";
    import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
    import { Button } from "@/components/ui/button";
    import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarSeparator, SidebarTrigger } from "@/components/ui/sidebar";

    type NavItem = { name: string; icon: React.ComponentType<{ className?: string }>; href: string };

    const studentNav: NavItem[] = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Subjects", icon: BookOpen, href: "/dashboard/subjects" },
    { name: "Gap Analysis", icon: Target, href: "/dashboard/analysis" },
    { name: "Study Plan", icon: Calendar, href: "/dashboard/plan" },
    { name: "Resources", icon: FileText, href: "/dashboard/resources" },
    { name: "Progress", icon: TrendingUp, href: "/dashboard/report" },
    { name: "Achievements", icon: Trophy, href: "/dashboard/achievements" },
    { name: "LearnBot", icon: MessageSquare, href: "/dashboard/chat" },
    ];

    const adminNav: NavItem[] = [
    { name: "Admin Home", icon: ShieldCheck, href: "/dashboard/admin" },
  { name: "Curriculum", icon: LibraryBig, href: "/dashboard/admin/curriculum" },
    { name: "Manage Questions", icon: FileText, href: "/dashboard/admin/questions" },
    ];

    function initials(name: string) {
    return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "L";
    }

    export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [currentUser, setCurrentUser] = React.useState<User | null>(null);
    const [profile, setProfile] = React.useState<UserProfile | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      let cancelled = false;
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          if (!cancelled) { setCurrentUser(null); setProfile(null); setLoading(false); }
          router.replace("/login");
          return;
        }

        setCurrentUser(user);
        setLoading(true);
        try {
          const nextProfile = await getUserProfile(user);
          if (!cancelled) { setProfile(nextProfile); setLoading(false); }
        } catch {
          if (!cancelled) {
            setProfile({ uid: user.uid, displayName: user.displayName ?? undefined, email: user.email ?? undefined, photoURL: user.photoURL ?? undefined });
            setLoading(false);
          }
        }
      });
      return () => { cancelled = true; unsubscribe(); };
    }, [router]);

    if (loading || !currentUser || !profile) {
      return <div className="flex min-h-screen items-center justify-center bg-background text-foreground"><div className="flex items-center gap-3 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" />Loading your learning workspace…</div></div>;
    }

    const isAdmin = isAdminUser(currentUser, profile);
    const displayName = profile.displayName || currentUser.displayName || "Learner";
    const email = profile.email || currentUser.email || "No email available";
    const xp = profile.xp ?? 0;
    const level = profile.level ?? 1;

    const renderNav = (items: NavItem[]) => (
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon;
          return <SidebarMenuItem key={item.href}><SidebarMenuButton asChild isActive={pathname === item.href} className="h-11"><Link href={item.href} className="flex items-center gap-3"><Icon className="h-5 w-5" /><span>{item.name}</span></Link></SidebarMenuButton></SidebarMenuItem>;
        })}
      </SidebarMenu>
    );

    return (
      <SidebarProvider defaultOpen>
        <div className="flex min-h-screen w-full bg-background">
          <Sidebar className="border-r border-sidebar-border shadow-2xl">
            <SidebarHeader className="p-4"><div className="flex items-center gap-3 px-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20"><BrainCircuit className="h-5 w-5 text-white" /></div><div className="flex flex-col"><span className="font-headline font-bold leading-tight text-foreground">LearnGap AI</span><span className="text-[10px] font-bold uppercase tracking-widest text-primary">{isAdmin ? "Admin Console" : "Student Hub"}</span></div></div></SidebarHeader>
            <SidebarContent className="px-3 py-2">
              {renderNav(studentNav)}
              {isAdmin && <div className="mt-6 space-y-2"><p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Administration</p>{renderNav(adminNav)}</div>}
            </SidebarContent>
            <SidebarFooter className="p-4"><div className="space-y-4"><SidebarMenu><SidebarMenuItem><SidebarMenuButton asChild className="h-11"><Link href="/dashboard/settings" className="flex items-center gap-3"><Settings className="h-5 w-5 text-muted-foreground" /><span className="text-sm">Settings</span></Link></SidebarMenuButton></SidebarMenuItem><SidebarMenuItem><Button variant="ghost" className="h-11 w-full justify-start gap-3 px-2 hover:bg-destructive/10 hover:text-destructive" onClick={() => signOut(auth).then(() => router.replace("/login"))}><LogOut className="h-5 w-5" /><span className="text-sm">Sign Out</span></Button></SidebarMenuItem></SidebarMenu><SidebarSeparator /><div className="rounded-xl border bg-secondary/40 p-3"><div className="mb-3 flex items-center gap-3"><Avatar className="h-9 w-9 border-2 border-primary/20"><AvatarImage src={profile.photoURL} alt={displayName} /><AvatarFallback>{initials(displayName)}</AvatarFallback></Avatar><div className="flex min-w-0 flex-col"><span className="truncate text-sm font-semibold">{displayName}</span><span className="truncate text-[10px] text-muted-foreground">{email}</span></div></div>{isAdmin && <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary"><ShieldCheck className="h-3.5 w-3.5" />Authorized admin</div>}</div></div></SidebarFooter>
          </Sidebar>
          <SidebarInset className="flex flex-col"><header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-md"><SidebarTrigger className="-ml-1" /><SidebarSeparator orientation="vertical" className="h-4" /><div className="flex-1"><h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">{pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard"}</h2></div><div className="hidden items-center gap-2 rounded-full border bg-secondary px-3 py-1.5 text-xs font-medium sm:flex"><Trophy className="h-3.5 w-3.5 text-accent" /><span>{xp.toLocaleString()} XP</span><SidebarSeparator orientation="vertical" className="h-3" /><GraduationCap className="h-3.5 w-3.5 text-primary" /><span>Level {level}</span></div></header><main className="flex-1 overflow-auto bg-background/50">{children}</main></SidebarInset>
        </div>
      </SidebarProvider>
    );
    }
    