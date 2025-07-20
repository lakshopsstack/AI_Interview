import React from 'react';

interface VoiceAnimationProps {
  isSpeaking: boolean;
}

const VoiceAnimation: React.FC<VoiceAnimationProps> = ({ isSpeaking }) => {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-1 h-4 bg-brand rounded-full transition-all duration-300 ${
            isSpeaking ? 'animate-voice' : 'opacity-50'
          }`}
          style={{
            animationDelay: `${i * 100}ms`,
            animationDuration: '1s',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out',
          }}
        />
      ))}
    </div>
  );
};

export default VoiceAnimation; 