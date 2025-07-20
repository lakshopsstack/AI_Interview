import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface CameraFeedProps {
  onCameraError?: (error: string) => void;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ onCameraError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Only initialize if we haven't already
    if (streamRef.current) return;

    const initializeCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: "user"
          }
        });

        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        onCameraError?.("Failed to access camera. Please ensure you have granted camera permissions.");
      }
    };

    initializeCamera();

    // Cleanup only on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once on mount

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-60 bg-black overflow-hidden rounded-lg shadow-lg z-50">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
    </Card>
  );
};

export default CameraFeed; 