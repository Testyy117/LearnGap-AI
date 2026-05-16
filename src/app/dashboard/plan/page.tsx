"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Target, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  LayoutGrid,
  ChevronRight
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { aiPrioritizedStudyPlan, AiPrioritizedStudyPlanOutput } from "@/ai/flows/ai-prioritized-study-plan";

export default function StudyPlanPage() {
  const [plan, setPlan] = React.useState<AiPrioritizedStudyPlanOutput | null>(null);

  React.useEffect(() => {
    // Simulated input from identified gaps
    const fetchPlan = async () => {
      const result = await aiPrioritizedStudyPlan({
        learningGaps: [
          { topic: "Circular Motion", accuracy: 0, confidence: 95, misconceptionDetail: "Centripetal vs Centrifugal force confusion" },
          { topic: "Multibody Systems", accuracy: 45, confidence: 30 },
          { topic: "Conservation of Energy", accuracy: 85, confidence: 90 }
        ]
      });
      setPlan(result);
    };
    fetchPlan();
  }, []);

  if (!plan) return <div className="p-10 text-center">Generating AI Study Plan...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-headline font-bold">Priority Study Plan</h1>
          <p className="text-muted-foreground">AI-orchestrated roadmap to target your specific weaknesses.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="gap-2">
             <Calendar className="h-4 w-4" /> Sync Calendar
           </Button>
           <Button className="bg-primary hover:bg-primary/90 gap-2">
             <Sparkles className="h-4 w-4" /> Refresh AI Plan
           </Button>
        </div>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 relative overflow-hidden group">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Strategic Overview</h4>
            <p className="text-md text-foreground/90 font-medium italic leading-relaxed">
              "{plan.overallInsight}"
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Priority Items */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-headline font-bold px-2">Action Items</h3>
          {plan.studyPlan.map((item, i) => (
            <Card key={i} className="group hover:border-primary/40 transition-all border-none shadow-sm bg-card/40 backdrop-blur-sm overflow-hidden">
               <CardContent className="p-0 flex">
                  <div className={`w-1.5 shrink-0 ${
                    item.urgency === 'High' ? 'bg-destructive' : item.urgency === 'Moderate' ? 'bg-accent' : 'bg-primary'
                  }`} />
                  <div className="p-6 flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{item.topic}</h4>
                          <Badge className={`uppercase text-[10px] font-bold ${
                            item.urgency === 'High' ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'
                          }`}>
                            {item.urgency} Priority
                          </Badge>
                       </div>
                       <Button variant="ghost" size="icon" className="group-hover:bg-primary/10 group-hover:text-primary">
                         <ChevronRight className="h-5 w-5" />
                       </Button>
                    </div>
                    
                    <div className="space-y-2">
                       <div className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                         <Target className="h-3 w-3" /> Recommendation
                       </div>
                       <p className="text-sm leading-relaxed">{item.recommendation}</p>
                    </div>

                    <div className="p-3 bg-secondary/30 rounded-lg text-xs italic text-muted-foreground border border-border/50">
                       <span className="font-bold text-foreground not-italic mr-1">AI Reasoning:</span>
                       {item.reasoning}
                    </div>
                  </div>
               </CardContent>
            </Card>
          ))}
        </div>

        {/* Weekly Schedule Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Schedule</CardTitle>
              <CardDescription>Daily focused slots</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { day: "Mon", task: "Physics (Misconception)", time: "18:00", active: true },
                { day: "Tue", task: "Math Practice", time: "17:30", active: false },
                { day: "Wed", task: "Biology Revision", time: "19:00", active: false },
                { day: "Thu", task: "Physics Lab Simulation", time: "18:00", active: false },
                { day: "Fri", task: "General Review", time: "16:00", active: false }
              ].map((day, i) => (
                <div key={i} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${day.active ? 'bg-primary/10 border-primary ring-1 ring-primary/20 shadow-md' : 'bg-secondary/20 border-transparent'}`}>
                  <div className="w-12 text-center border-r pr-4">
                     <div className={`text-xs font-bold uppercase tracking-tight ${day.active ? 'text-primary' : 'text-muted-foreground'}`}>{day.day}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className={`text-sm font-bold truncate ${day.active ? 'text-foreground' : 'text-muted-foreground'}`}>{day.task}</div>
                     <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                       <Clock className="h-3 w-3" /> {day.time}
                     </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card className="bg-accent/10 border-accent/20">
             <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-accent">
                  <LayoutGrid className="h-5 w-5" />
                  <span className="text-sm font-bold uppercase tracking-widest">Mastery Progress</span>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-bold">
                     <span>Weekly Goal</span>
                     <span>65%</span>
                   </div>
                   <Progress value={65} className="h-2" indicatorClassName="bg-accent" />
                </div>
                <p className="text-xs text-muted-foreground italic">
                  Complete 2 more Physics modules to stay on track for your exam targets.
                </p>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}