"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Timer, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  Flag,
  CheckCircle2,
  BrainCircuit,
  Info
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { analyzeLearningGap } from "@/ai/flows/ai-learning-gap-analysis-flow";
import { useToast } from "@/hooks/use-toast";

// Mock Questions for demo
const MOCK_QUESTIONS = [
  {
    id: "q1",
    text: "In classical mechanics, what does Newton's Second Law define as the relationship between force, mass, and acceleration?",
    options: ["F = m * a", "E = mc^2", "P = IV", "a = F * m"],
    answer: "F = m * a",
    topic: "Classical Mechanics"
  },
  {
    id: "q2",
    text: "Which of the following describes the 'Centripetal Force' acting on a body in circular motion?",
    options: [
      "An outward force away from the center",
      "An inward force towards the center",
      "A force acting tangential to the motion",
      "A force acting perpendicular to the radius"
    ],
    answer: "An inward force towards the center",
    topic: "Circular Motion"
  },
  {
    id: "q3",
    text: "What happens to the kinetic energy of an object if its velocity is doubled?",
    options: ["Doubles", "Triples", "Quadruples", "Remains constant"],
    answer: "Quadruples",
    topic: "Work & Energy"
  }
];

export default function QuizPage() {
  const { id: subjectId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [confidence, setConfidence] = React.useState<Record<string, number>>({});
  const [bookmarks, setBookmarks] = React.useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = React.useState(1800); // 30 mins
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Timer logic
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    toast({
      title: "Analyzing results...",
      description: "Our AI is detecting your learning gaps and misconceptions."
    });

    // Simulate flow input construction
    const quizResults = MOCK_QUESTIONS.map(q => ({
      questionId: q.id,
      questionText: q.text,
      correctAnswer: q.answer,
      studentAnswer: answers[q.id] || "",
      isCorrect: answers[q.id] === q.answer,
      confidenceLevel: confidence[q.id] || 50,
      subject: subjectId as string,
      topic: q.topic
    }));

    try {
      const analysis = await analyzeLearningGap({ quizResults });
      // Store in session storage to pass to analysis page for demo
      sessionStorage.setItem('lastAnalysis', JSON.stringify(analysis));
      router.push('/dashboard/analysis');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "There was an error processing your results."
      });
      setIsSubmitting(false);
    }
  };

  const question = MOCK_QUESTIONS[currentIdx];
  const progress = ((currentIdx + 1) / MOCK_QUESTIONS.length) * 100;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-card/40 p-4 rounded-xl border">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-headline font-bold">Physics Diagnostic Quiz</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Question {currentIdx + 1} of {MOCK_QUESTIONS.length}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-primary font-mono text-xl font-bold">
            <Timer className="h-5 w-5" />
            {formatTime(timeLeft)}
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90 px-6 font-bold" 
            disabled={Object.keys(answers).length < MOCK_QUESTIONS.length || isSubmitting}
            onClick={handleFinish}
          >
            {isSubmitting ? "Processing..." : "Finish Quiz"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Progress value={progress} className="h-2" />
          
          <Card className="min-h-[400px] flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="space-y-1">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] uppercase">{question.topic}</Badge>
                <CardTitle className="text-xl leading-relaxed mt-2">{question.text}</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className={bookmarks.has(question.id) ? "text-primary" : "text-muted-foreground"}
                onClick={() => {
                  const newB = new Set(bookmarks);
                  if (newB.has(question.id)) newB.delete(question.id);
                  else newB.add(question.id);
                  setBookmarks(newB);
                }}
              >
                <Bookmark className="h-5 w-5" fill={bookmarks.has(question.id) ? "currentColor" : "none"} />
              </Button>
            </CardHeader>
            <CardContent className="flex-grow pt-4">
              <RadioGroup 
                value={answers[question.id] || ""} 
                onValueChange={(val) => setAnswers({...answers, [question.id]: val})}
                className="space-y-3"
              >
                {question.options.map((opt, i) => (
                  <Label 
                    key={i} 
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      answers[question.id] === opt 
                      ? "bg-primary/5 border-primary ring-1 ring-primary" 
                      : "hover:bg-secondary/40"
                    }`}
                  >
                    <RadioGroupItem value={opt} />
                    <span className="text-sm font-medium">{opt}</span>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
            
            <CardFooter className="bg-secondary/20 p-6 flex flex-col gap-6 border-t">
              <div className="w-full space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <BrainCircuit className="h-4 w-4 text-accent" />
                    How confident are you?
                  </div>
                  <span className="text-sm font-mono text-accent">{confidence[question.id] || 50}%</span>
                </div>
                <Slider 
                  value={[confidence[question.id] || 50]} 
                  onValueChange={(val) => setConfidence({...confidence, [question.id]: val[0]})}
                  max={100} 
                  step={1} 
                />
                <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                  <span>Guessing</span>
                  <span>Sure</span>
                </div>
              </div>
              
              <div className="flex justify-between w-full pt-4 border-t border-border/50">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                  disabled={currentIdx === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button 
                  onClick={() => setCurrentIdx(Math.min(MOCK_QUESTIONS.length - 1, currentIdx + 1))}
                  disabled={currentIdx === MOCK_QUESTIONS.length - 1}
                  className="gap-2"
                >
                  Next Question <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Navigator Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-wider font-bold">Navigator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {MOCK_QUESTIONS.map((q, i) => {
                  const isAnswered = answers[q.id];
                  const isBookmarked = bookmarks.has(q.id);
                  const isCurrent = currentIdx === i;
                  
                  return (
                    <button 
                      key={q.id}
                      onClick={() => setCurrentIdx(i)}
                      className={`relative w-full aspect-square rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent 
                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110 z-10" 
                        : isAnswered 
                        ? "bg-primary/20 text-primary border border-primary/20" 
                        : "bg-secondary text-muted-foreground border border-transparent"
                      }`}
                    >
                      {i + 1}
                      {isBookmarked && (
                        <div className="absolute -top-1 -right-1">
                          <Bookmark className="h-3 w-3 fill-accent text-accent" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-6 space-y-3 pt-6 border-t">
                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
                   <div className="w-3 h-3 rounded-sm bg-primary" />
                   <span>Current</span>
                 </div>
                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
                   <div className="w-3 h-3 rounded-sm bg-primary/20" />
                   <span>Answered</span>
                 </div>
                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
                   <div className="w-3 h-3 rounded-sm bg-secondary" />
                   <span>Unanswered</span>
                 </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex gap-3">
              <Info className="h-5 w-5 text-primary shrink-0" />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Your confidence levels help our AI identify "Hidden Gaps"—areas where you're sure but actually incorrect. This is vital for deep learning.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}