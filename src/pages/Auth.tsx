
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, BarChart3 } from "lucide-react";

const Auth = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SignedOut>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <h1 className="text-2xl font-bold">Stratosphere Trading</h1>
            </div>
            <CardTitle>Welcome to Professional Trading</CardTitle>
            <CardDescription>
              Sign in to access advanced trading tools, risk management, and portfolio analytics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Shield className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">Advanced Risk Management</p>
                  <p className="text-xs text-muted-foreground">Real-time portfolio monitoring</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium text-sm">Professional Analytics</p>
                  <p className="text-xs text-muted-foreground">Comprehensive market intelligence</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-sm">Live Trading</p>
                  <p className="text-xs text-muted-foreground">Execute trades with confidence</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <SignInButton fallbackRedirectUrl="/dashboard">
                <Button className="w-full" size="lg">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton fallbackRedirectUrl="/dashboard">
                <Button variant="outline" className="w-full" size="lg">
                  Create Account
                </Button>
              </SignUpButton>
            </div>
          </CardContent>
        </Card>
      </SignedOut>
      
      <SignedIn>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Welcome Back!</CardTitle>
            <CardDescription>
              You are successfully signed in to Stratosphere Trading.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <UserButton afterSignOutUrl="/auth" />
            <Button asChild className="w-full">
              <a href="/dashboard">Go to Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      </SignedIn>
    </div>
  );
};

export default Auth;
