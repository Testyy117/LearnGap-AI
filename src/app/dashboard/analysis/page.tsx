"use client";

import * as React from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as ChartTooltip,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Target, 
  ArrowRight,
  Info,
  BrainCircuit,
  Lightbulb
} from "lucide-react";
import Link from "next/link";
import { AnalyzeLearningGapOutput } from "@/ai/flows/ai-learning-gap-analysis-flow";

export default function AnalysisPage() {
  const [data, setData] = React.useState<AnalyzeLearningGapOutput | null>(null);

  React.useEffect(() => {
    const saved = sessionStorage.getItem('lastAnalysis');
    if (saved) {
      setData(JSON.parse(saved));
    } else {
      // Mock data for demo if no session storage
      setData({
        overallInsight: "You have a strong understanding of Work & Energy, but clear misconceptions were identified in Circular Motion dynamics.",
        gapSummary: {
          totalGaps: 2,
          topicsWithGaps: ["Circular Motion", "Classical Mechanics"],
          misconceptionCount: 1
        },
        detectedGaps: [
          {
            topic: "Circular Motion",
            description: "You incorrectly identified centripetal force as an outward force. This is a common confusion with inertia in rotating frames.",
            accuracy: 0,
            confidence: 95,
            isMisconception: true,
            recommendation: "Watch the 'Centripetal Force vs. Inertia' deep-dive module."
          },
          {
            topic: "Classical Mechanics",
            description: "Some errors in applying Newton's laws to multi-body systems.",
            accuracy: 65,
            confidence: 40,
            isMisconception: false,
            recommendation: "Complete 5 practice problems on connected masses."
          }
        ]
      });
    }
  }, []);

  if (!data) return <div className="p-10 text-center">Loading analysis...</div>;

  const pieData = [
    { name: 'Mastered', value: 70, color: 'hsl(var(--accent))' },
    { name: 'Gaps', value: 20, color: 'hsl(var(--primary))' },
    { name: 'Misconceptions', value: 10, color: 'hsl(var(--destructive))' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header & Overall Insight */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-headline font-bold">Diagnostic Report</h1>
            <p className="text-muted-foreground">Detailed breakdown of your strengths and specific knowledge gaps.</p>
          </div>
          <Link href="/dashboard/plan">
            <Button className="bg-primary hover:bg-primary/90 gap-2 font-bold shadow-lg shadow-primary/20">
              Build Study Plan <Target className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -z-10 group-hover:bg-primary/20 transition-all" />
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary animate-pulse">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-primary uppercase tracking-widest">AI Synthesis</h4>
              <p className="text-lg font-medium leading-relaxed max-w-4xl italic">
                "{data.overallInsight}"
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pie Summary */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Performance Mix</CardTitle>
            <CardDescription>Knowledge profile breakdown</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center pt-0">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 w-full gap-2 mt-4">
               {pieData.map((item) => (
                 <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                       {item.name}
                    </div>
                    <span className="text-xs font-mono">{item.value}%</span>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        {/* Gap Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Detected Knowledge Gaps</CardTitle>
                <CardDescription>Targeted areas requiring immediate attention</CardDescription>
              </div>
              <Badge variant="outline" className="border-primary text-primary font-bold">
                {data.gapSummary.totalGaps} Issues Found
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y border-t">
                {data.detectedGaps.map((gap, i) => (
                  <div key={i} className={`p-6 flex flex-col md:flex-row gap-6 transition-colors ${gap.isMisconception ? 'bg-destructive/5' : 'hover:bg-secondary/20'}`}>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h4 className="text-md font-bold group-hover:text-primary">{gap.topic}</h4>
                        {gap.isMisconception && (
                          <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive uppercase text-[10px] gap-1 px-2">
                            <AlertTriangle className="h-3 w-3" /> Misconception
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{gap.description}</p>
                      
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10 text-xs">
                        <Lightbulb className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-semibold text-foreground">Recommendation:</span>
                        <span className="text-muted-foreground">{gap.recommendation}</span>
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-4 justify-center items-center shrink-0 border-l md:pl-6">
                      <div className="text-center px-4">
                        <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Accuracy</div>
                        <div className={`text-xl font-headline font-bold ${gap.accuracy < 50 ? 'text-destructive' : 'text-primary'}`}>
                          {gap.accuracy}%
                        </div>
                      </div>
                      <div className="text-center px-4 border-l md:border-l-0 md:border-t md:pt-4">
                        <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Confidence</div>
                        <div className={`text-xl font-headline font-bold ${gap.confidence > 70 && gap.accuracy < 40 ? 'text-orange-500' : 'text-accent'}`}>
                          {gap.confidence}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Learning Tips Widget */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-secondary/20">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              Your Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-3 bg-background/50 rounded-lg text-sm border border-accent/10">Excellent grasp of Energy Conservation principles (92% accuracy).</div>
            <div className="p-3 bg-background/50 rounded-lg text-sm border border-accent/10">Consistent high performance in problem solving involving vectors.</div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary/20">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-primary" />
              Mastery Pathway
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</div>
               <p className="text-xs text-muted-foreground">Address misconception in <span className="font-bold text-foreground">Circular Motion</span> first.</p>
             </div>
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">2</div>
               <p className="text-xs text-muted-foreground">Reinforce foundational <span className="font-bold text-foreground">Forces</span> concepts with 5 practice tests.</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}