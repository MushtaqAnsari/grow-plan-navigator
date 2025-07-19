import React from 'react';
import { AlertCircle, RefreshCw, Wifi, Database, Key, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorMessageProps {
  error: string | Error;
  onRetry?: () => void;
  context?: 'auth' | 'data' | 'network' | 'ai' | 'general';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onRetry, context = 'general' }) => {
  const errorMessage = error instanceof Error ? error.message : error;
  
  // Parse error and provide user-friendly explanation
  const getErrorDetails = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Authentication errors
    if (lowerMessage.includes('invalid login credentials')) {
      return {
        icon: Key,
        title: "Login Failed",
        userFriendly: "The email or password you entered is incorrect. Please double-check and try again.",
        technical: "Authentication credentials do not match our records",
        color: "text-red-500"
      };
    }
    
    if (lowerMessage.includes('email not confirmed')) {
      return {
        icon: AlertCircle,
        title: "Email Not Verified",
        userFriendly: "You need to check your email and click the verification link before you can sign in.",
        technical: "User account exists but email verification is pending",
        color: "text-orange-500"
      };
    }
    
    if (lowerMessage.includes('user already registered')) {
      return {
        icon: AlertCircle,
        title: "Account Already Exists",
        userFriendly: "An account with this email already exists. Please try signing in instead of creating a new account.",
        technical: "Attempted to create duplicate account",
        color: "text-blue-500"
      };
    }
    
    // Network errors
    if (lowerMessage.includes('network') || lowerMessage.includes('connection') || lowerMessage.includes('timeout')) {
      return {
        icon: Wifi,
        title: "Connection Problem",
        userFriendly: "There's a problem with your internet connection. Please check your connection and try again.",
        technical: "Network connectivity or timeout issue",
        color: "text-orange-500"
      };
    }
    
    // Database errors
    if (lowerMessage.includes('database') || lowerMessage.includes('supabase') || lowerMessage.includes('rls') || lowerMessage.includes('policy')) {
      return {
        icon: Database,
        title: "Data Access Issue",
        userFriendly: "We're having trouble accessing your data. This is usually temporary. Please try again in a moment.",
        technical: "Database or row-level security policy issue",
        color: "text-red-500"
      };
    }
    
    // AI/API errors
    if (lowerMessage.includes('openai') || lowerMessage.includes('quota') || lowerMessage.includes('insufficient_quota')) {
      return {
        icon: Code,
        title: "AI Service Unavailable",
        userFriendly: "The AI model generator is temporarily unavailable due to usage limits. You can still create your financial model manually.",
        technical: "OpenAI API quota exceeded or service unavailable",
        color: "text-purple-500"
      };
    }
    
    if (lowerMessage.includes('429') || lowerMessage.includes('rate limit')) {
      return {
        icon: AlertCircle,
        title: "Too Many Requests",
        userFriendly: "You're trying too fast! Please wait a moment before trying again.",
        technical: "API rate limit exceeded",
        color: "text-orange-500"
      };
    }
    
    // Permission errors
    if (lowerMessage.includes('permission') || lowerMessage.includes('unauthorized') || lowerMessage.includes('forbidden')) {
      return {
        icon: Key,
        title: "Permission Denied",
        userFriendly: "You don't have permission to access this data. Please sign in again or contact support.",
        technical: "Authorization or permission error",
        color: "text-red-500"
      };
    }
    
    // Default error
    return {
      icon: AlertCircle,
      title: "Something Went Wrong",
      userFriendly: "An unexpected error occurred. Our team has been notified and we're working to fix it.",
      technical: message || "Unknown error",
      color: "text-red-500"
    };
  };
  
  const errorDetails = getErrorDetails(errorMessage);
  const Icon = errorDetails.icon;
  
  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icon className={`h-6 w-6 ${errorDetails.color}`} />
          <div>
            <CardTitle className="text-lg">{errorDetails.title}</CardTitle>
            <CardDescription className="text-base mt-1">
              {errorDetails.userFriendly}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Technical Details (for developers)
          </summary>
          <div className="mt-2 p-3 bg-muted rounded-md font-mono text-xs break-all">
            {errorDetails.technical}
          </div>
        </details>
        
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ErrorMessage;