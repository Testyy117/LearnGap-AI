'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!fullName || !email || !password || !grade) {
      setError('Please fill in all fields');
      return;
    }
    localStorage.setItem('userName', fullName);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userGrade', grade);
    localStorage.setItem('isLoggedIn', 'true');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Enter your details to begin your mastery journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <input
              className="w-full p-3 rounded-lg bg-muted border border-border"
              placeholder="Your full name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Class / Grade</label>
            <select
              className="w-full p-3 rounded-lg bg-muted border border-border"
              value={grade}
              onChange={e => setGrade(e.target.value)}
            >
              <option value="">Select your grade level</option>
              <option value="Primary">Primary School</option>
              <option value="Junior Secondary">Junior Secondary</option>
              <option value="Senior Secondary">Senior Secondary (WAEC)</option>
              <option value="University">University</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <input
              className="w-full p-3 rounded-lg bg-muted border border-border"
              placeholder="your@email.com"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input
              className="w-full p-3 rounded-lg bg-muted border border-border"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleSubmit}>
            Start Learning Free 🚀
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <a href="/login" className="text-primary underline">Sign in</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
