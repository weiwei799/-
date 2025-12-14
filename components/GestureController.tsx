import React, { useEffect, useRef, useState, useCallback } from 'react';
import { analyzeGesture } from '../services/geminiService';
import { TreeState } from '../types';

interface GestureControllerProps {
  onStateChange: (state: TreeState) => void;
  onCameraMove: (pos: { x: number; y: number }) => void;
}

const GestureController: React.FC<GestureControllerProps> = ({ onStateChange, onCameraMove }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<string>("Initializing...");
  const [lastGesture, setLastGesture] = useState<string>("-");

  // Initialize Webcam on mount
  useEffect(() => {
    startWebcam();
  }, []);

  const startWebcam = async () => {
    try {
      setStatus("Requesting Camera...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setStatus("Active - Analyzing Hands...");
          requestAnimationFrame(processFrame);
        };
      }
    } catch (err) {
      setStatus("Camera Error: " + err);
    }
  };

  const lastCallTime = useRef(0);
  const isProcessing = useRef(false);

  const processFrame = useCallback(async (time: number) => {
    if (!videoRef.current || !canvasRef.current) return;

    // Rate limiting: Call API max once every 800ms to avoid quota issues and conserve resources
    // For a smoother experience, we'd use the Live API via WebSocket, but for this structure
    // we use the robust generateContent endpoint.
    if (time - lastCallTime.current > 800 && !isProcessing.current) {
      isProcessing.current = true;
      lastCallTime.current = time;

      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        // Draw video frame to canvas
        ctx.drawImage(videoRef.current, 0, 0, 320, 240);
        
        // Get Base64
        const base64 = canvasRef.current.toDataURL('image/jpeg', 0.6).split(',')[1];
        
        // Analyze
        analyzeGesture(base64).then((result) => {
           setLastGesture(`${result.gesture} (${result.handPosition.x.toFixed(2)}, ${result.handPosition.y.toFixed(2)})`);
           
           // State Machine Logic
           if (result.gesture === 'OPEN') {
             onStateChange(TreeState.CHAOS);
           } else if (result.gesture === 'CLOSED') {
             onStateChange(TreeState.FORMED);
           }
           
           // Camera Logic (Invert X for mirror effect)
           if (result.gesture !== 'NONE') {
             onCameraMove({ x: -result.handPosition.x, y: result.handPosition.y });
           }
        }).finally(() => {
          isProcessing.current = false;
        });
      } else {
        isProcessing.current = false;
      }
    }

    requestAnimationFrame(processFrame);
  }, [onStateChange, onCameraMove]);

  return (
    <div className="absolute top-4 left-4 z-50 bg-black/80 border border-[#D4AF37] p-4 rounded-lg shadow-[0_0_15px_#D4AF37] max-w-xs">
      <h3 className="text-[#D4AF37] font-bold mb-2 uppercase tracking-widest text-xs">Vision Control</h3>
      <div className="relative w-32 h-24 bg-black border border-gray-800 mb-2 overflow-hidden rounded">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover opacity-50" 
          muted 
          playsInline 
        />
        <canvas ref={canvasRef} width="320" height="240" className="hidden" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <span className="text-[10px] text-green-400 font-mono">{lastGesture}</span>
        </div>
      </div>
      <div className="text-[10px] text-gray-300 font-mono">
        <p>Status: <span className="text-[#D4AF37]">{status}</span></p>
        <p className="mt-1 opacity-70">
          • Open Hand: <span className="text-red-400">UNLEASH CHAOS</span><br/>
          • Fist/Closed: <span className="text-green-400">FORM TREE</span><br/>
          • Move Hand: Adjust View
        </p>
      </div>
    </div>
  );
};

export default GestureController;