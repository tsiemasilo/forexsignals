import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function SimpleLoginPage() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    if (showSignup && (!firstName || !lastName)) {
      toast({
        title: "Error", 
        description: "First name and last name are required for signup",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (showSignup) {
        // Sign up with all fields
        await login(email, firstName, lastName);
        toast({
          title: "Welcome to WatchlistFX!",
          description: "Account created and signed in successfully! You now have a free 7-day trial to access all forex signals.",
        });
      } else {
        // Sign in with just email
        await login(email);
        toast({
          title: "Welcome back!", 
          description: "Signed in successfully. Access to forex signals restored.",
        });
      }
    } catch (error: any) {
      console.log("Auth error:", error);
      
      if (error?.needsRegistration) {
        // Switch to signup form
        setShowSignup(true);
        toast({
          title: "Sign Up Required",
          description: "Please enter your name to create an account.",
        });
      } else {
        toast({
          title: "Error",
          description: error?.message || "Authentication failed. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setShowSignup(!showSignup);
    setFirstName("");
    setLastName("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">
            {showSignup ? "Create Account" : "Sign In"}
          </CardTitle>
          <CardDescription className="text-gray-300">
            {showSignup 
              ? "Start your free 7-day trial" 
              : "Access your forex signals dashboard"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                required
              />
            </div>

            {showSignup && (
              <>
                <div>
                  <Input
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required={showSignup}
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required={showSignup}
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Processing..." : (showSignup ? "Create Account" : "Sign In")}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              {showSignup 
                ? "Already have an account? Sign in" 
                : "Need an account? Sign up"
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}