import { useState, useRef, useCallback, useEffect } from "react";

export type ScreenStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "ended"
  | "denied"
  | "cancelled"
  | "unsupported"
  | "error";

interface Metadata {
  width?: number;
  height?: number;
  displaySurface?: string;
}

export const useScreenShare = () => {
  // const [status, setStatus] = useState<ScreenStatus>("idle");
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initial state ko localStorage se check karo
  const [status, setStatus] = useState<ScreenStatus>(() => {
    const saved = localStorage.getItem("screen_share_status");
    return (saved as ScreenStatus) || "idle";
  });

  // Jab bhi status badle, use save karo
  useEffect(() => {
    localStorage.setItem("screen_share_status", status);
  }, [status]);

  const cleanup = useCallback((isManual = false) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setMetadata(null);
    
    // 🔥 Fix: Sirf tabhi "ended" set karo jab user ne manually stop kiya ho
    // Ya jab koi active stream sach mein band ho rahi ho.
    if (isManual) {
      setStatus("ended");
    }
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setStatus("unsupported");
      return null;
    }

    try {
      setStatus("requesting");
      
      // Yahan cleanup call ho raha hai, lekin isManual=false (default)
      // taaki status "ended" na ho jaye start hote hi.
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30 } },
        audio: false,
      });

      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();

      setMetadata({
        width: settings.width,
        height: settings.height,
        displaySurface: settings.displaySurface,
      });

      track.onended = () => {
        cleanup(true); // Jab browser se stop karein tab "ended" ho
      };

      setStatus("granted");
      return stream;
    } catch (err: any) {
      if (err.name === "NotAllowedError") setStatus("denied");
      else if (err.name === "AbortError") setStatus("cancelled");
      else setStatus("error");
      return null;
    }
  }, [cleanup]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return { status, setStatus, metadata, start, cleanup };
};