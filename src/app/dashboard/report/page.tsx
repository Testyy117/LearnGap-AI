"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { 
  Calendar, 
  TrendingUp, 
  Activity, 
  Trophy, 
  Zap,
  Target
} from "lucide-react";

const monthlyData = [
  { month: 'Jan', performance: 65, goal: 70 },
  { month: 'Feb', performance: 72, goal: 70 },
  { month: 'Mar', performance: 68, goal: 75 },
  { month: 'Apr', performance: 81, goal: 75 },
  { month: 'May', performance: 85, goal: 80 },
  { month: 'Jun', performance: 89, goal: 80 },
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--destructive))', '#A855F7', '#EAB308'];

export default function PerformanceReportPage() {
  // Simple heatmap data: 5 rows (weekdays) x 7 columns (days) for demo
  const heatmapDays = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    intensity: Math.floor(Math.random() * 5)
  }));

  const getIntensityColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-secondary/20';
      case 1: return 'bg-primary/20';
      case 2: return 'bg-primary/40';
      case 3: return 'bg-primary/60';
      case 4: return 'bg-primary/80';
      case 5: return 'bg-primary';
      default: return 'bg-secondary/20';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-headline font-bold">Mastery Metrics</h1>
          <p className="text-muted-foreground">Long-term progress and activity tracking.</p>
        </div>
        <div className="flex gap-2">
          <Card className="p-2 px-4 flex items-center gap-3 bg-secondary/20 border-none">
             <Calendar className="h-4 w-4 text-primary" />
             <span className="text-sm font-semibold">Last 6 Months</span>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Growth Trajectory</CardTitle>
            <CardDescription>Average performance vs Target goals</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'hsl(var(--secondary)/.4)'}}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: 'none' }}
                />
                <Bar dataKey="performance" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" barSize={32} />
                <Bar dataKey="goal" radius={[4, 4, 0, 0]} fill="hsl(var(--accent))" barSize={32} fillOpacity={0.3} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest font-bold">Activity Heatmap</CardTitle>
              <CardDescription>Daily study intensity (35 Days)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1.5">
                {heatmapDays.map((day) => (
                  <div 
                    key={day.id} 
                    className={`aspect-square rounded-sm ${getIntensityColor(day.intensity)} transition-all hover:scale-110 cursor-help`}
                    title={`Day ${day.id + 1}: Level ${day.intensity}`}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-end gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-secondary/20" />
                <div className="w-3 h-3 rounded-sm bg-primary/20" />
                <div className="w-3 h-3 rounded-sm bg-primary/60" />
                <div className="w-3 h-3 rounded-sm bg-primary" />
                <span>More</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/10 border-none overflow-hidden relative">
             <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/20 blur-2xl rounded-full" />
             <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-primary uppercase">Milestone</div>
                    <div className="text-md font-bold">Consistent Learner</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You've reached level 12 with over 50 hours of active study this month. Keep it up!
                </p>
             </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: "Completion Rate", value: "94.2%", icon: Activity, change: "+2.5%" },
          { label: "Problem Solving Speed", value: "48s", icon: Zap, change: "-4s" },
          { label: "Target Alignment", value: "88%", icon: Target, change: "+12%" }
        ].map((stat, i) => (
          <Card key={i} className="bg-card/40 backdrop-blur-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary shrink-0">
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase mb-1">{stat.label}</div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-headline font-bold">{stat.value}</span>
                  <span className="text-xs font-bold text-accent px-1.5 py-0.5 rounded bg-accent/10">{stat.change}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}