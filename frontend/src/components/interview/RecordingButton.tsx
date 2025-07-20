import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecordingButtonProps {
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
  disabled?: boolean;
  recordingTime?: number;
  className?: string;
  isProcessing?: boolean;
  hasRecorded?: boolean;
}

const RecordingButton: React.FC<RecordingButtonProps> = ({
  onStartRecording,
  onStopRecording,
  isRecording,
  disabled = false,
  recordingTime = 0,
  className,
  isProcessing = false,
  hasRecorded = false
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculate recording progress percentage (for max 3 minutes)
  const maxRecordingTime = 180; // 3 minutes in seconds
  const progressPercentage = Math.min((recordingTime / maxRecordingTime) * 100, 100);
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {isRecording && (
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <Clock className="h-4 w-4" />
          <span>{formatTime(recordingTime)}</span>
          {recordingTime >= maxRecordingTime - 10 && (
            <span className="text-xs text-destructive animate-pulse font-medium">
              Recording will end soon
            </span>
          )}
        </div>
      )}
      
      {isProcessing ? (
        <Button disabled variant="outline" size="sm">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </Button>
      ) : hasRecorded ? (
        <Button disabled variant="secondary" size="sm">
          <Mic className="mr-2 h-4 w-4" />
          Answer Recorded
        </Button>
      ) : (
        <Button
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={disabled}
          variant={isRecording ? "destructive" : "default"}
          size="sm"
          className={isRecording ? "animate-pulse" : ""}
        >
          {isRecording ? (
            <>
              <Square className="mr-2 h-4 w-4" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="mr-2 h-4 w-4" />
              Record Answer
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default RecordingButton;
