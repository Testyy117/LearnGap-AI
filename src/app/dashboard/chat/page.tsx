"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  BrainCircuit, 
  Trash2,
  Share2
} from "lucide-react";
import { askLearnBot } from "@/ai/flows/ai-learn-bot-tutor";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function LearnBotPage() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    setMounted(true);
    setMessages([
      {
        role: 'assistant',
        content: "Hello! I'm LearnBot, your AI tutor. I can help you clarify difficult concepts, solve problems, or prepare for exams. What's on your mind today?",
        timestamp: new Date()
      }
    ]);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await askLearnBot({ question: input });
      const assistantMsg: Message = {
        role: 'assistant',
        content: response.answer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Communication Error",
        description: "LearnBot is having trouble connecting. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, [messages]);

  return (
    <div className="h-[calc(100vh-10rem)] p-6 max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="text-white h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-headline font-bold">LearnBot <span className="text-primary text-sm">v2.5</span></h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-accent" /> Personalized AI Tutor
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setMessages([messages[0]])}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden bg-card/40 backdrop-blur-md">
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-6" ref={scrollRef}>
            <div className="space-y-6">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-secondary text-foreground' : 'bg-primary text-primary-foreground'
                  }`}>
                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                      ? 'bg-primary/10 border border-primary/20 text-foreground' 
                      : 'bg-secondary/40 text-foreground'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {mounted ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/40 text-sm flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t bg-secondary/20">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="w-full flex gap-3"
          >
            <div className="relative flex-1">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything... (e.g., Explain Quantum Tunnelling)"
                className="h-12 bg-background/50 pr-12 focus-visible:ring-primary"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <BrainCircuit className="h-5 w-5 text-muted-foreground/30" />
              </div>
            </div>
            <Button size="icon" className="h-12 w-12 bg-primary hover:bg-primary/90 rounded-xl" disabled={!input.trim() || isLoading}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </CardFooter>
      </Card>
      
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          "Explain photosynthesis simply",
          "What is Newton's 2nd Law?",
          "How to solve quadratics?",
          "Explain supply and demand"
        ].map((hint, i) => (
          <Button 
            key={i} 
            variant="outline" 
            size="sm" 
            className="text-[10px] font-bold uppercase tracking-tight h-8 bg-secondary/40 hover:bg-secondary/60 hover:border-primary/50"
            onClick={() => setInput(hint)}
          >
            {hint}
          </Button>
        ))}
      </div>
    </div>
  );
}
