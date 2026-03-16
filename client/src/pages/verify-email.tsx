import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useSearchParams } from "react-router-dom";
import { authApi } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyEmailPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Get token from URL params
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      return;
    }

    const verifyEmail = async () => {
      setIsLoading(true);
      try {
        const response = await authApi.auth.verifyEmail(token);
        if (response?.success) {
          setIsVerified(true);
          toast({
            title: "Email verified!",
            description: "Your email has been successfully verified. Redirecting to login...",
          });

          setTimeout(() => {
            setLocation("/login");
          }, 2000);
        } else {
          throw new Error(response?.message || "Verification failed");
        }
      } catch (error: any) {
        toast({
          title: "Verification failed",
          description: error.message || "Unable to verify your email. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, toast, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>Verifying your email address...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!token && (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                No verification token found. Please check your email for the verification link.
              </p>
              <Button onClick={() => setLocation("/login")} className="w-full">
                Return to Login
              </Button>
            </div>
          )}

          {token && isLoading && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-sm text-gray-600">Verifying your email...</p>
            </div>
          )}

          {token && isVerified && (
            <div className="text-center space-y-4">
              <div className="text-4xl">✓</div>
              <p className="text-sm text-gray-600">Email verified successfully!</p>
              <p className="text-xs text-gray-500">Redirecting to login...</p>
            </div>
          )}

          {token && !isLoading && !isVerified && (
            <div className="text-center space-y-4">
              <p className="text-sm text-red-600">
                Email verification failed. The link may have expired.
              </p>
              <Button onClick={() => setLocation("/login")} variant="outline" className="w-full">
                Return to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
