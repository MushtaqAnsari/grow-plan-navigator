
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Bug } from 'lucide-react';

interface DebugPanelProps {
  authDebug?: {
    authState: string;
    sessionExists: boolean;
    userExists: boolean;
  };
  financialDebug?: {
    loadingState: string;
    error: string | null;
    currentModelId: string | null;
  };
  onRefresh?: () => void;
  onReset?: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  authDebug,
  financialDebug,
  onRefresh,
  onReset
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2 flex items-center gap-2"
      >
        <Bug className="w-4 h-4" />
        Debug
      </Button>
      
      {isVisible && (
        <Card className="w-80 max-h-96 overflow-y-auto">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Debug Information
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
              >
                ×
              </Button>
            </div>
            <CardDescription className="text-xs">
              Current system status and debugging info
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {/* Auth Debug Info */}
            {authDebug && (
              <div>
                <h4 className="font-semibold mb-2">Authentication</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>State:</span>
                    <Badge variant={authDebug.sessionExists ? "default" : "secondary"}>
                      {authDebug.authState}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Session:</span>
                    <Badge variant={authDebug.sessionExists ? "default" : "destructive"}>
                      {authDebug.sessionExists ? "✓" : "✗"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>User:</span>
                    <Badge variant={authDebug.userExists ? "default" : "destructive"}>
                      {authDebug.userExists ? "✓" : "✗"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Debug Info */}
            {financialDebug && (
              <div>
                <h4 className="font-semibold mb-2">Financial Data</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>State:</span>
                    <Badge variant={financialDebug.error ? "destructive" : "default"}>
                      {financialDebug.loadingState}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Model ID:</span>
                    <Badge variant={financialDebug.currentModelId ? "default" : "secondary"}>
                      {financialDebug.currentModelId ? "✓" : "None"}
                    </Badge>
                  </div>
                  {financialDebug.error && (
                    <div className="text-red-600 text-xs p-2 bg-red-50 rounded">
                      {financialDebug.error}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t">
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  className="w-full flex items-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh Data
                </Button>
              )}
              {onReset && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  className="w-full"
                >
                  Reset Setup
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DebugPanel;
