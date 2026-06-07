"use client";
import { UserName as UserNameDisplay } from "./user-name";


import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';
import { 
  Sparkles, 
  Zap, 
  Target, 
  ArrowRight, 
  BookOpen, 
  AlertCircle,
  Clock,
  TrendingUp,
  BrainCircuit
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

const performanceData = [
  { name: 'Mon', score: 65 },
  { name: 'Tue', score: 78 },
  { name: 'Wed', score: 72 },
  { name: 'Thu', score: 85 },
  { name: 'Fri', score: 82 },
  { name: 'Sat', score: 91 },
  { name: 'Sun', score: 88 },
];

const radarData = [
  { subject: 'Math', A: 85, fullMark: 100 },
  { subject: 'Physics', A: 65, fullMark: 100 },
  { subject: 'Biology', A: 90, fullMark: 100 },
  { subject: 'History', A: 75, fullMark: 100 },
  { subject: 'Logic', A: 95, fullMark: 100 },
];

export default function StudentDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome & AI Quick Insight */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-2">
          <h1 className="text-3xl font-headline font-bold">Welcome back, <UserNameDisplay />.</h1>
          <p className="text-muted-foreground">You've completed 85% of your weekly goals. Ready to tackle those learning gaps?</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-start gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-primary mb-1 uppercase tracking-tight">AI Insight</h4>
            <p className="text-xs text-foreground/80 leading-relaxed">
              We've noticed a patterns in your Physics quizzes. You might be confusing "Centripetal" vs "Centrifugal" force. Review Recommended Module 4.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Study Streak", value: "12 Days", icon: Zap, color: "text-orange-500" },
          { label: "Mastery Score", value: "88/100", icon: Target, color: "text-primary" },
          { label: "Active Courses", value: "6", icon: BookOpen, color: "text-accent" },
          { label: "Focus Hours", value: "42.5h", icon: Clock, color: "text-purple-500" }
        ].map((stat, i) => (
          <Card key={i} className="overflow-hidden border-none shadow-sm bg-card/50 backdrop-blur-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl font-headline font-bold">{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl bg-secondary/50 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Weekly Performance</CardTitle>
              <CardDescription>Average quiz scores across all subjects</CardDescription>
            </div>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}}
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                />
                <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skill Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Skill Mastery</CardTitle>
            <CardDescription>Subject proficiency levels</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} />
                <Radar name="Student" dataKey="A" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Subject Progress */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Subject Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { name: "Mathematics", progress: 85, color: "bg-primary" },
              { name: "Physics", progress: 42, color: "bg-destructive" },
              { name: "Biology", progress: 78, color: "bg-accent" },
              { name: "Global History", progress: 92, color: "bg-purple-500" }
            ].map((sub, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{sub.name}</span>
                  <span className={sub.progress < 50 ? "text-destructive" : ""}>{sub.progress}%</span>
                </div>
                <Progress value={sub.progress} className="h-2" indicatorClassName={sub.color} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recommendation Feed */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Priority Learning Path</CardTitle>
              <CardDescription>Based on recent performance and detected gaps</CardDescription>
            </div>
            <Link href="/dashboard/plan">
              <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary hover:bg-primary/10">
                View Full Plan <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { 
                title: "Address physics misconception", 
                sub: "Kinematics & Force Vectors", 
                priority: "High", 
                icon: AlertCircle, 
                color: "text-destructive",
                bg: "bg-destructive/10"
              },
              { 
                title: "Complete Geometry Quiz", 
                sub: "3D Shapes & Volume", 
                priority: "Moderate", 
                icon: Clock, 
                color: "text-accent",
                bg: "bg-accent/10"
              },
              { 
                title: "Review Biology Flashcards", 
                sub: "Cellular Respiration", 
                priority: "Low", 
                icon: BookOpen, 
                color: "text-primary",
                bg: "bg-primary/10"
              }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl border bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-pointer group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.bg} ${item.color}`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-bold group-hover:text-primary transition-colors">{item.title}</h5>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight border ${item.color} border-current/20`}>
                  {item.priority}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}