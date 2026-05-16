"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calculator, 
  Atom, 
  Dna, 
  Beaker, 
  BookMarked, 
  PlayCircle, 
  Trophy, 
  Clock,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

const subjects = [
  {
    id: "math",
    name: "Advanced Mathematics",
    icon: Calculator,
    progress: 75,
    modules: 12,
    completed: 9,
    status: "In Progress",
    color: "bg-blue-500",
    description: "Calculus, Linear Algebra, and Statistical Analysis.",
    tags: ["STEM", "Core"]
  },
  {
    id: "physics",
    name: "Quantum Physics",
    icon: Atom,
    progress: 32,
    modules: 8,
    completed: 2,
    status: "Needs Focus",
    color: "bg-red-500",
    description: "Particle dynamics, waves, and quantum theory foundations.",
    tags: ["Science", "Advanced"]
  },
  {
    id: "biology",
    name: "Molecular Biology",
    icon: Dna,
    progress: 90,
    modules: 10,
    completed: 9,
    status: "Almost Mastered",
    color: "bg-green-500",
    description: "Genetics, cellular structures, and metabolic pathways.",
    tags: ["Science", "Medical"]
  },
  {
    id: "chemistry",
    name: "Organic Chemistry",
    icon: Beaker,
    progress: 45,
    modules: 15,
    completed: 7,
    status: "Improving",
    color: "bg-yellow-500",
    description: "Hydrocarbons, functional groups, and chemical reactions.",
    tags: ["Science", "Lab"]
  },
  {
    id: "history",
    name: "Modern World History",
    icon: BookMarked,
    progress: 15,
    modules: 20,
    completed: 3,
    status: "Started",
    color: "bg-purple-500",
    description: "Global conflicts, political movements, and technological eras.",
    tags: ["Humanities", "Elective"]
  }
];

export default function SubjectsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-headline font-bold">Your Subjects</h1>
          <p className="text-muted-foreground">Select a course to resume learning or start a gap-analysis quiz.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Active</Button>
          <Button variant="ghost" size="sm">Completed</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Card key={subject.id} className="group hover:border-primary/50 transition-all duration-300 flex flex-col bg-card/40 backdrop-blur-sm">
            <CardHeader className="p-0">
              <div className={`h-32 w-full rounded-t-xl overflow-hidden relative ${subject.color}/10 flex items-center justify-center`}>
                <div className={`absolute inset-0 opacity-10 bg-current`} />
                <subject.icon className={`h-16 w-16 ${subject.color.replace('bg-', 'text-')} group-hover:scale-110 transition-transform duration-500`} />
                <div className="absolute top-4 left-4 flex gap-2">
                  {subject.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-background/80 text-[10px] px-2 py-0 border-none">{tag}</Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-1">
              <div className="mb-4">
                <h3 className="text-xl font-headline font-bold mb-2 group-hover:text-primary transition-colors">{subject.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{subject.description}</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Mastery Level</span>
                  <span>{subject.progress}%</span>
                </div>
                <Progress value={subject.progress} className="h-2" indicatorClassName={subject.color} />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{subject.completed}/{subject.modules} Modules</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground justify-end">
                    <Trophy className="h-3.5 w-3.5" />
                    <span>{subject.status}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0 flex gap-2">
              <Link href={`/dashboard/quiz/${subject.id}`} className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary/90 gap-2 h-10">
                  <PlayCircle className="h-4 w-4" /> Start Quiz
                </Button>
              </Link>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}