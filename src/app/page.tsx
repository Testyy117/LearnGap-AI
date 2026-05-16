import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { BrainCircuit, Target, Sparkles, BookOpen, ChevronRight, GraduationCap, BarChart3, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BrainCircuit className="text-white h-5 w-5" />
            </div>
            <span className="text-xl font-headline font-bold text-foreground">LearnGap <span className="text-primary">AI</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#solutions" className="hover:text-primary transition-colors">Solutions</Link>
            <Link href="#stats" className="hover:text-primary transition-colors">Stats</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="hidden sm:flex">Log In</Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full -z-10" />
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6 animate-fade-in">
              <Sparkles className="h-3 w-3" />
              <span>Next-Gen Adaptive Learning</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-headline font-bold mb-8 leading-tight">
              Master subjects by <span className="text-primary">fixing your gaps</span> with AI.
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              LearnGap AI analyzes your quiz performance and confidence scores to pinpoint misconceptions and build a personalized path to mastery.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="h-14 px-8 text-base font-semibold bg-primary hover:bg-primary/90 group">
                  Start Learning Now
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base font-semibold">
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-card/30 border-y">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-headline font-bold mb-4">Core Intelligence</h2>
              <p className="text-muted-foreground">The tools you need to accelerate your academic journey.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Target,
                  title: "Gap Analysis",
                  description: "Identify exactly where you're struggling using AI-powered misconception detection logic."
                },
                {
                  icon: GraduationCap,
                  title: "Study Plans",
                  description: "Get dynamic weekly schedules prioritized by urgency and topic complexity."
                },
                {
                  icon: BrainCircuit,
                  title: "LearnBot Tutor",
                  description: "An AI educational expert available 24/7 to answer your complex subject questions."
                }
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-2xl border bg-card hover:border-primary/50 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-headline font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Active Students", value: "25k+", icon: Users },
                { label: "Quizzes Completed", value: "1.2M", icon: BookOpen },
                { label: "Gaps Identified", value: "450k", icon: Target },
                { label: "Avg. Grade Lift", value: "22%", icon: BarChart3 }
              ].map((stat, i) => (
                <div key={i} className="text-center group">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary mb-4 group-hover:scale-110 transition-transform">
                    <stat.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div className="text-4xl font-headline font-bold mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <BrainCircuit className="text-white h-4 w-4" />
            </div>
            <span className="text-lg font-headline font-bold">LearnGap <span className="text-primary">AI</span></span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 LearnGap AI Platform. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary">Privacy</Link>
            <Link href="#" className="hover:text-primary">Terms</Link>
            <Link href="#" className="hover:text-primary">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}