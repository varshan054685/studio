'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Mail, Lock, Chrome, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    const normalizedEmail = email.trim().toLowerCase();

    if (!isLogin && password.length < 8) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "Use at least 8 characters for new accounts.",
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, normalizedEmail, password);
        toast({ title: "Welcome back!", description: "Successfully logged in." });
      } else {
        await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        toast({ title: "Account created", description: "Welcome to Lumina!" });
      }
      router.push('/');
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: isLogin
          ? "Check your email and password, then try again."
          : "We could not create that account. Try a different email or stronger password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth || loading) return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: "Welcome!", description: "Successfully logged in with Google." });
      router.push('/');
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') return;
      console.error(error);
      toast({
        variant: "destructive",
        title: "Google Sign-In Error",
        description: "Could not complete sign-in. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address to reset your password.",
      });
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      toast({
        title: "Reset Email Sent",
        description: "Check your inbox for password reset instructions.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not send reset email. Please verify the email address.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-[0_0_20px_rgba(186,156,255,0.4)] mb-4">
            <Wallet className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-headline font-bold text-foreground tracking-tight">Lumina Finance</h1>
          <p className="text-muted-foreground">The future of intelligent budgeting.</p>
        </div>

        <Card className="glass-card border-white/5 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="font-headline text-2xl">{isLogin ? 'Login' : 'Create Account'}</CardTitle>
            <CardDescription>
              {isLogin ? 'Enter your credentials to access your dashboard' : 'Join Lumina and take control of your finances'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-10 bg-muted/30 border-none h-11 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {isLogin && (
                    <button 
                      type="button" 
                      onClick={handleForgotPassword}
                      className="text-[11px] text-primary hover:underline font-bold uppercase tracking-wider"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="pl-10 pr-10 bg-muted/30 border-none h-11 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={isLogin ? undefined : 8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-12 font-headline font-bold rounded-xl bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all" disabled={loading}>
                {loading ? 'Processing...' : (isLogin ? 'LOG IN' : 'SIGN UP')}
              </Button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-bold tracking-widest">Or continue with</span>
              </div>
            </div>

            <Button variant="outline" className="w-full h-12 bg-muted/20 border-white/5 font-headline font-bold rounded-xl" onClick={handleGoogleSignIn} disabled={loading}>
              <Chrome className="mr-2 h-4 w-4" /> GOOGLE
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-white/5 pt-6">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
