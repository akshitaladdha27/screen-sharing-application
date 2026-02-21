import { useRef, useEffect, useState } from "react";
import { useScreenShare } from "../hooks/useScreenShare";
import Button from "../components/Button";

const ScreenTest = () => {
  const { status, setStatus, metadata, start, cleanup } = useScreenShare();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);

  const handleStart = async () => {
    const stream = await start();
    if (stream) {
      setActiveStream(stream);
    }
  };

  useEffect(() => {
    return () => {
      cleanup(); 
      setActiveStream(null);
    };
  }, [cleanup]);

  const handleGoToInitial = () => {
    setStatus("idle");
    setActiveStream(null);
  };

  const handleStop = () => {
    cleanup(true);
    setActiveStream(null);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  useEffect(() => {
    if (activeStream && videoRef.current) {
      videoRef.current.srcObject = activeStream;
      videoRef.current.play().catch(err => console.error("Play error:", err));
    }
  }, [activeStream, status]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl text-center">
        
        {status === "idle" && (
          <div className="py-10">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Screen Share Test App</h1>
            <Button onClick={handleStart}>Start Screen Test</Button>
          </div>
        )}

        {status === "requesting" && (
          <div className="py-20 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Please select a screen to share...</p>
          </div>
        )}

        {status === "granted" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-indigo-50 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-indigo-900 font-bold uppercase tracking-wider text-sm">Live</span>
              </div>
              <button 
                onClick={handleStop}
                className="bg-red-100 text-red-600 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-all"
              >
                Stop Sharing
              </button>
            </div>
            
              {status === "granted" && activeStream ? (
                <video ref={videoRef} autoPlay playsInline muted className="..." />
              ) : (
                status === "granted" && <p>Connection lost. Please restart.</p>
              )}

            {metadata && (
              <div className="text-xs text-gray-400 font-mono">
                {metadata.width}x{metadata.height} • {metadata.displaySurface}
              </div>
            )}
          </div>
        )}

        {(status === "ended" || status === "denied" || status === "cancelled") && (
          <div className="py-10 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Screen sharing stopped</h2>
            <p className="text-gray-500 mb-8">
              {status === "denied" ? "Permission was denied." : "The session has ended successfully."}
            </p>

            <div className="flex flex-col gap-4 max-w-xs mx-auto">
              <Button onClick={handleStart}>
                Retry Screen Test
              </Button>
              
              <button 
                onClick={handleGoToInitial}
                className="py-3 px-6 text-gray-600 font-semibold border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ScreenTest;