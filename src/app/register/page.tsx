"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { BrainCircuit, CheckCircle2, Sparkles, Rocket, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Side: Benefits */}
      <div className="md:w-1/2 bg-primary/10 p-8 lg:p-16 flex flex-col justify-center relative overflow-hidden border-r border-primary/10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_50%)]" />
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-bold uppercase text-xs tracking-widest mb-12 relative z-10 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        
        <div className="max-w-md space-y-8 relative z-10">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20">
              <BrainCircuit className="text-white h-7 w-7" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-headline font-bold leading-tight">Join the future of learning.</h1>
            <p className="text-lg text-muted-foreground">Create your student account to start identifying and fixing your learning gaps today.</p>
          </div>

          <div className="space-y-6 pt-4">
            {[
              { title: "AI-Powered Analysis", desc: "Pinpoint misconceptions with clinical precision." },
              { title: "Adaptive Study Paths", desc: "Your schedule automatically adjusts to your progress." },
              { title: "24/7 Expert Tutor", desc: "Ask LearnBot anything, anytime, in any subject." },
              { title: "Mastery Tracking", desc: "Visualize your growth across the entire curriculum." }
            ].map((benefit, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{benefit.title}</h4>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
             <Sparkles className="h-5 w-5 text-accent shrink-0 animate-pulse" />
             <p className="text-xs text-muted-foreground leading-relaxed italic">
               "LearnGap AI helped me improve my Physics grade from a C to an A- in just three weeks by focusing on the 'Hidden Gaps' I didn't even know I had."
               <span className="block mt-2 font-bold text-foreground not-italic">— Sarah J., University Student</span>
             </p>
          </div>
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="md:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-background relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/10 blur-[100px] rounded-full -z-10" />
        
        <Card className="w-full max-w-md shadow-2xl shadow-primary/5 border-none bg-card/50 backdrop-blur-xl animate-in fade-in slide-in-from-right-4 duration-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-headline font-bold">Create Account</CardTitle>
            <CardDescription>Enter your details to begin your mastery journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>
              <Input id="fullname" placeholder="Alex Sterling" className="bg-background/50 h-11" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grade">Class / Grade</Label>
              <Select>
                <SelectTrigger className="bg-background/50 h-11">
                  <SelectValue placeholder="Select your grade level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="highschool">High School</SelectItem>
                  <SelectItem value="undergrad">Undergraduate</SelectItem>
                  <SelectItem value="grad">Graduate</SelectItem>
                  <SelectItem value="other">Other Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="alex@university.edu" className="bg-background/50 h-11" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" className="bg-background/50 h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input id="confirm" type="password" placeholder="••••••••" className="bg-background/50 h-11" />
              </div>
            </div>

            <Link href="/dashboard" className="w-full">
              <Button className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-bold shadow-lg shadow-primary/20 gap-2 mt-2">
                Start Learning Free <Rocket className="h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-center text-xs text-muted-foreground">
              By clicking "Start Learning Free", you agree to our{" "}
              <Link href="#" className="underline hover:text-primary">Terms of Service</Link> and{" "}
              <Link href="#" className="underline hover:text-primary">Privacy Policy</Link>.
            </div>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/dashboard" className="text-primary font-bold hover:underline">Log in</Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
