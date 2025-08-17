import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("=== LOGIN PAGE FORM SUBMIT ===");
    console.log("Email:", email);
    console.log("isRegistering:", isRegistering);
    
    if (!email) return;
    if (isRegistering && (!firstName || !lastName)) return;

    setLoading(true);
    try {
      if (isRegistering) {
        const response = await register(email, firstName, lastName);
        toast({
          title: "Success",
          description: response.message || "Account created successfully! Please sign in with your email.",
        });
        // Switch to login mode and clear form fields
        setIsRegistering(false);
        setEmail("");
        setFirstName("");
        setLastName("");
      } else {
        await login(email);
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
      }
    } catch (error: any) {
      console.log("Login error caught:", error);
      console.log("Error needsRegistration:", error?.needsRegistration);
      console.log("Error userExists:", error?.userExists);
      console.log("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
      
      // Handle specific error cases
      if (error?.needsRegistration === true) {
        console.log("Setting isRegistering to true");
        setIsRegistering(true);
        toast({
          title: "Registration Required",
          description: "Please complete your registration to create an account.",
        });
      } else if (error?.userExists === true) {
        setIsRegistering(false);
        toast({
          title: "Account Exists",
          description: "This account already exists. Please sign in instead.",
        });
      } else {
        console.log("Falling through to generic error handling");
        toast({
          title: isRegistering ? "Registration Failed" : "Login Failed",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ForexSignals Pro</h1>
          <p className="text-gray-600">Professional Trading Signals Platform</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>{isRegistering ? "Create Account" : "Welcome Back"}</CardTitle>
            <CardDescription>
              {isRegistering 
                ? "Create your account to access premium trading signals"
                : "Enter your email address to access your trading signals"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {isRegistering && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>
                </>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                disabled={loading || !email || (isRegistering && (!firstName || !lastName))}
              >
                {loading 
                  ? (isRegistering ? "Creating Account..." : "Signing In...") 
                  : (isRegistering ? "Create Account" : "Sign In")
                }
              </Button>

              {isRegistering && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsRegistering(false);
                    setFirstName("");
                    setLastName("");
                  }}
                >
                  Already have an account? Sign In
                </Button>
              )}
            </form>
            
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>New to ForexSignals Pro?</p>
              <p className="mt-1">Simply enter your email to create an account automatically.</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          <p>Secure access to professional forex trading signals</p>
        </div>
      </div>
    </div>
  );
}