"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Target, 
  FilePlus, 
  BarChart3, 
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  Settings
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip,
  AreaChart,
  Area
} from 'recharts';
import Link from "next/link";

const platformActivity = [
  { day: 'Mon', active: 450, quizzes: 1200 },
  { day: 'Tue', active: 520, quizzes: 1450 },
  { day: 'Wed', active: 610, quizzes: 1800 },
  { day: 'Thu', active: 580, quizzes: 1600 },
  { day: 'Fri', active: 720, quizzes: 2100 },
  { day: 'Sat', active: 850, quizzes: 2800 },
  { day: 'Sun', active: 790, quizzes: 2400 },
];

export default function AdminDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold uppercase text-[10px] tracking-widest">
            <ShieldCheck className="h-3 w-3" /> System Administrator
          </div>
          <h1 className="text-3xl font-headline font-bold">Platform Overview</h1>
          <p className="text-muted-foreground">Monitoring learning health and content performance across all cohorts.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/admin/questions">
            <Button className="bg-primary hover:bg-primary/90 gap-2 font-bold shadow-lg shadow-primary/20">
              <FilePlus className="h-4 w-4" /> Add Question Wizard
            </Button>
          </Link>
          <Button variant="outline" size="icon">
             <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: "24,850", icon: Users, color: "text-primary" },
          { label: "Critical Gaps", value: "128", icon: AlertTriangle, color: "text-destructive" },
          { label: "Avg Mastery", value: "72%", icon: Target, color: "text-accent" },
          { label: "AI Accuracy", value: "98.4%", icon: BrainCircuit, color: "text-purple-500" }
        ].map((stat, i) => (
          <Card key={i} className="bg-card/40 border-none shadow-md overflow-hidden group">
            <CardContent className="p-6 relative">
               <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform">
                 <stat.icon className={`h-12 w-12 ${stat.color}`} />
               </div>
               <div className="space-y-1">
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                 <h3 className="text-3xl font-headline font-bold">{stat.value}</h3>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <Card className="lg:col-span-2">
           <CardHeader className="flex flex-row items-center justify-between">
              <div>
                 <CardTitle className="text-lg">User Engagement</CardTitle>
                 <CardDescription>Active sessions vs Quizzes taken (Past 7 Days)</CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-primary" />
           </CardHeader>
           <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={platformActivity}>
                  <defs>
                    <linearGradient id="colorQuizzes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <ChartTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: 'none' }}
                  />
                  <Area type="monotone" dataKey="quizzes" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorQuizzes)" />
                  <Area type="monotone" dataKey="active" stroke="hsl(var(--accent))" strokeWidth={2} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
           </CardContent>
        </Card>

        {/* Gap Alerts */}
        <div className="space-y-6">
          <Card className="border-destructive/20 bg-destructive/5">
             <CardHeader className="pb-3">
               <div className="flex items-center gap-2 text-destructive">
                 <AlertTriangle className="h-4 w-4" />
                 <CardTitle className="text-sm font-bold uppercase tracking-widest">Urgent Gap Alerts</CardTitle>
               </div>
             </CardHeader>
             <CardContent className="space-y-4">
                {[
                  { topic: "Quantum Tunnelling", students: 450, gap: "Misconception" },
                  { topic: "Electromagnetism", students: 312, gap: "Low Accuracy" },
                  { topic: "Organic Acids", students: 205, gap: "Misconception" }
                ].map((alert, i) => (
                  <div key={i} className="p-3 bg-card/60 rounded-xl border flex items-center justify-between group cursor-pointer hover:border-destructive/50 transition-all">
                     <div className="min-w-0">
                       <div className="text-xs font-bold truncate">{alert.topic}</div>
                       <div className="text-[10px] text-muted-foreground uppercase tracking-tight">{alert.students} Students affected</div>
                     </div>
                     <Badge variant="outline" className="text-[9px] border-destructive text-destructive font-bold uppercase">{alert.gap}</Badge>
                  </div>
                ))}
                <Button variant="ghost" className="w-full text-xs text-destructive hover:bg-destructive/10 group">
                   View Critical Analytics <ArrowUpRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
             </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
               <CardTitle className="text-sm font-bold uppercase tracking-widest">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {[
                 { user: "User #4521", action: "Completed Mastery Level 10", time: "2m ago" },
                 { user: "Admin #01", action: "Published 12 New Questions", time: "15m ago" },
                 { user: "System", action: "Generated Cohort Gap Report", time: "1h ago" }
               ].map((log, i) => (
                 <div key={i} className="flex items-start gap-3 border-l-2 border-primary/20 pl-4 py-1">
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-tight text-primary">{log.user}</div>
                      <div className="text-xs font-medium text-foreground">{log.action}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{log.time}</div>
                    </div>
                 </div>
               ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}