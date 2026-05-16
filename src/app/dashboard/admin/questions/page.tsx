"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles,
  FileText,
  BrainCircuit,
  Save,
  GraduationCap
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function AddQuestionWizard() {
  const [step, setStep] = React.useState(1);
  const { toast } = useToast();
  const [formData, setFormData] = React.useState({
    subject: "",
    topic: "",
    difficulty: "Medium",
    text: "",
    options: ["", "", "", ""],
    correctIdx: 0,
    explanation: ""
  });

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = () => {
    toast({
      title: "Question Published",
      description: "Successfully added to the Physics knowledge bank."
    });
    setStep(1);
    // reset form in real app
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-headline font-bold">Question Wizard</h1>
        <p className="text-muted-foreground">Add high-quality diagnostic questions to the platform.</p>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-between px-4 relative">
         <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-secondary -translate-y-1/2 -z-10" />
         {[1, 2, 3].map((s) => (
           <div 
             key={s} 
             className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-2 ${
               step >= s ? 'bg-primary border-primary text-white scale-110' : 'bg-card border-secondary text-muted-foreground'
             }`}
           >
             {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
           </div>
         ))}
      </div>

      <Card className="bg-card/50 backdrop-blur-md">
        <CardHeader>
           <div className="flex items-center gap-3 text-primary mb-2">
             {step === 1 && <FileText className="h-5 w-5" />}
             {step === 2 && <GraduationCap className="h-5 w-5" />}
             {step === 3 && <BrainCircuit className="h-5 w-5" />}
             <CardTitle>
               {step === 1 && "Context & Meta"}
               {step === 2 && "Question Content"}
               {step === 3 && "Review & AI Check"}
             </CardTitle>
           </div>
           <CardDescription>
             {step === 1 && "Define where this question fits in the curriculum."}
             {step === 2 && "Draft the question text and answer choices."}
             {step === 3 && "Verify technical accuracy and AI readability."}
           </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-4">
          {step === 1 && (
            <div className="space-y-4">
               <div className="space-y-2">
                 <Label>Subject Area</Label>
                 <Select onValueChange={(v) => setFormData({...formData, subject: v})}>
                   <SelectTrigger className="bg-background/50">
                     <SelectValue placeholder="Select Subject" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="physics">Physics</SelectItem>
                     <SelectItem value="math">Mathematics</SelectItem>
                     <SelectItem value="bio">Biology</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label>Specific Topic</Label>
                 <Input 
                   placeholder="e.g. Thermodynamics, Kinematics..." 
                   className="bg-background/50" 
                   value={formData.topic}
                   onChange={(e) => setFormData({...formData, topic: e.target.value})}
                 />
               </div>
               <div className="space-y-2">
                 <Label>Difficulty Level</Label>
                 <div className="flex gap-2">
                   {['Easy', 'Medium', 'Hard'].map((d) => (
                     <Button 
                       key={d} 
                       variant={formData.difficulty === d ? "default" : "outline"}
                       className="flex-1"
                       onClick={() => setFormData({...formData, difficulty: d})}
                     >
                       {d}
                     </Button>
                   ))}
                 </div>
               </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
               <div className="space-y-2">
                 <Label>Question Text</Label>
                 <Textarea 
                   placeholder="Write your diagnostic question here..." 
                   className="min-h-[120px] bg-background/50" 
                   value={formData.text}
                   onChange={(e) => setFormData({...formData, text: e.target.value})}
                 />
               </div>
               <div className="space-y-3">
                 <Label>Multiple Choice Options</Label>
                 {formData.options.map((opt, i) => (
                   <div key={i} className="flex gap-3 items-center">
                     <div 
                       className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold border transition-all cursor-pointer ${
                         formData.correctIdx === i ? 'bg-primary border-primary text-white' : 'bg-secondary border-transparent text-muted-foreground'
                       }`}
                       onClick={() => setFormData({...formData, correctIdx: i})}
                     >
                       {String.fromCharCode(65 + i)}
                     </div>
                     <Input 
                       placeholder={`Option ${i + 1}`} 
                       className="flex-1 bg-background/50" 
                       value={opt}
                       onChange={(e) => {
                         const newO = [...formData.options];
                         newO[i] = e.target.value;
                         setFormData({...formData, options: newO});
                       }}
                     />
                   </div>
                 ))}
                 <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-2">Click the letter to mark as correct</p>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
               <div className="p-6 rounded-2xl bg-secondary/20 border-2 border-dashed border-border flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">AI Accuracy Check</h4>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Our system is verifying this question against curriculum standards and checking for ambiguity.
                    </p>
                  </div>
                  <Badge className="bg-accent text-accent-foreground font-bold uppercase py-1 px-4">Verification Passed</Badge>
               </div>

               <div className="space-y-4">
                  <Label>Final Explanation (for students)</Label>
                  <Textarea 
                    placeholder="Provide a detailed explanation of why the correct answer is right and why others are wrong..." 
                    className="min-h-[100px] bg-background/50"
                    value={formData.explanation}
                    onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                  />
               </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between p-6 pt-2">
           <Button variant="outline" disabled={step === 1} onClick={handleBack} className="gap-2">
             <ChevronLeft className="h-4 w-4" /> Back
           </Button>
           {step < 3 ? (
             <Button onClick={handleNext} className="gap-2 bg-primary hover:bg-primary/90 px-8">
               Continue <ChevronRight className="h-4 w-4" />
             </Button>
           ) : (
             <Button onClick={handleSubmit} className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-8 shadow-lg shadow-accent/20">
               <Save className="h-4 w-4" /> Publish Question
             </Button>
           )}
        </CardFooter>
      </Card>
    </div>
  );
}