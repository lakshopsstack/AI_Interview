import React from "react";
import { cn } from "@/lib/utils";

interface AIAvatarProps {
  isSpeaking?: boolean;
  size?: "sm" | "md" | "lg";
}

const AIAvatar: React.FC<AIAvatarProps> = ({
  isSpeaking = false,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center",
          sizeClasses[size]
        )}
      >
        <img src="/AIAvatar.svg" />
      </div>
      {isSpeaking && (
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
      )}
    </div>
  );
};

export default AIAvatar;
