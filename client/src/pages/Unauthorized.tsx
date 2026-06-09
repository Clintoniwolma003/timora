import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { AlertCircle } from "lucide-react";

export default function Unauthorized() {
  const [, navigate] = useLocation();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/")}>
              Go Home
            </Button>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
