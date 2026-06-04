import React, { useRef, useEffect, useState } from "react";
import jsQR from "jsqr";
import { Camera, X, Sparkles, CheckCircle, RefreshCw, Smartphone } from "lucide-react";
import { MOCK_EXTERNAL_PROFILES, MockProfile } from "../mockProfiles";

interface QrScannerProps {
  onScan: (profileData: {
    name: string;
    birthday: string;
    age: string;
    relationship: string;
    phone: string;
    whatsapp: string;
    email: string;
    snapchat: string;
    interests: string;
    connectedBack?: boolean;
  }) => void;
  onClose: () => void;
}

export const QrScanner: React.FC<QrScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"camera" | "simulator">("camera");

  // Web Audio scan success sound
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch check sound
      
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.18);
    } catch (e) {
      console.warn("Audio Context chime failed: ", e);
    }
  };

  // Start Camera
  const startCamera = async () => {
    try {
      setPermissionError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true"); // required for iOS Safari
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.error("Camera acquisition failed", err);
      setCameraActive(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionError("Camera access was denied. Please adjust your browser framing permissions.");
      } else {
        setPermissionError("No camera device was detected or hardware is busy. Enjoy our instant simulator below!");
      }
      // Failover to simulator tab if camera access is rejected
      setActiveTab("simulator");
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Camera cycle effect
  useEffect(() => {
    if (activeTab === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [activeTab]);

  // Real-time processing loop
  useEffect(() => {
    if (activeTab !== "camera" || !cameraActive) return;
    
    let animationFrameId: number;
    const canvas = canvasRef.current || document.createElement("canvas");
    const context = canvas.getContext("2d");
    
    const scanFrame = () => {
      const video = videoRef.current;
      if (video && video.readyState === video.HAVE_ENOUGH_DATA && context) {
        const width = 320;
        const height = 320;
        canvas.width = width;
        canvas.height = height;
        
        // Draw centered box frame onto canvas
        context.drawImage(video, 0, 0, width, height);
        
        const imageData = context.getImageData(0, 0, width, height);
        try {
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert"
          });
          
          if (code) {
            // Decoded a potential QR
            try {
              const data = JSON.parse(code.data);
              if (data && data.hbd) {
                // Perfect HBD QR card payload
                playBeep();
                setToastMessage(`Scanned ${data.name}!`);
                setTimeout(() => {
                  onScan({
                    name: data.name,
                    birthday: data.birthday,
                    age: data.age || "25",
                    relationship: data.relationship || "Best Friend",
                    phone: data.phone || "+1 (555) 555-0199",
                    whatsapp: data.whatsapp || data.phone || "+1 (555) 555-0199",
                    email: data.email || "scanned@hbd.app",
                    snapchat: data.snapchat || "scanned_snap",
                    interests: data.interests || "",
                    connectedBack: data.connectedBack ?? true
                  });
                }, 400);
                return; // Stop scanning loop
              }
            } catch (jsonErr) {
              // Try regex or fallback string parse if raw text was encoded
              if (code.data.includes("hbd:") || code.data.includes("username:")) {
                // Accept informal pattern
                playBeep();
                onScan({
                  name: "Scanned Contact",
                  birthday: "1998-05-18",
                  age: "28",
                  relationship: "Best Friend",
                  phone: "+1 (555) 123-4567",
                  whatsapp: "+1 (555) 123-4567",
                  email: "handshake@hbd.app",
                  snapchat: code.data.substring(0, 30),
                  interests: "Scanned QR, Tech Fan",
                  connectedBack: true
                });
                return;
              }
            }
          }
        } catch (scanErr) {
          // Silent catch
        }
      }
      animationFrameId = requestAnimationFrame(scanFrame);
    };
    
    animationFrameId = requestAnimationFrame(scanFrame);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [cameraActive, activeTab]);

  // Simulate perfect QR Scan trigger
  const handleSimulateScan = (profile: MockProfile) => {
    playBeep();
    setToastMessage(`Simulated scan of ${profile.name}!`);
    setTimeout(() => {
      onScan({
        name: profile.name,
        birthday: profile.birthday,
        age: profile.age,
        relationship: "Best Friend",
        phone: profile.phone,
        whatsapp: profile.phone,
        email: `${profile.username}@example.com`,
        snapchat: profile.username,
        interests: profile.interests.join(", "),
        connectedBack: true // Mutual QR scans activate connected state!
      });
    }, 450);
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Smartphone className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-100 flex items-center gap-1">
              <span>HBD Live QR Scanner</span>
            </h4>
            <p className="text-[10px] text-slate-400">Instantly populate buddies by scanning profile cards</p>
          </div>
        </div>
        <button 
          type="button" 
          onClick={onClose} 
          className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-800/60 p-1 rounded-xl gap-1 border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab("camera")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === "camera" 
              ? "bg-indigo-600 text-white shadow" 
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Real Camera</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("simulator")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === "simulator" 
              ? "bg-indigo-600 text-white shadow" 
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>QR Sandbox Simulator</span>
        </button>
      </div>

      {/* Scanning Stage */}
      <div className="relative aspect-video rounded-xl bg-black border border-slate-800 overflow-hidden flex items-center justify-center min-h-[180px]">
        {activeTab === "camera" ? (
          <>
            {permissionError ? (
              <div className="px-4 py-6 text-center text-xs text-slate-400 space-y-2.5 max-w-xs">
                <span className="text-xl">⚠️</span>
                <p className="font-semibold leading-relaxed text-slate-300">{permissionError}</p>
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-[10.5px] cursor-pointer shadow transition"
                >
                  Configure Frame &amp; Retry Camera
                </button>
              </div>
            ) : (
              <div className="absolute inset-0 w-full h-full">
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover" 
                  muted 
                  playsInline 
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Laser Overlay Box */}
                <div className="absolute inset-0 flex items-center justify-center bg-transparent pointer-events-none">
                  <div className="w-40 h-40 border-2 border-indigo-400/60 rounded-xl relative flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.25)]">
                    {/* Corner decorators */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-indigo-400 rounded-tl" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-indigo-400 rounded-tr" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-indigo-400 rounded-bl" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-indigo-400 rounded-br" />
                    
                    {/* Laser Scanner animation line */}
                    <div className="absolute left-1 right-1 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_10px_#818cf8] animate-pulse" style={{
                      top: "20%",
                      animation: "scanLine 2.2s infinite ease-in-out"
                    }} />

                    <div className="text-[9px] font-bold text-indigo-400 tracking-wider text-center uppercase bg-slate-950/80 px-2.5 py-1 rounded-md absolute bottom-2">
                      Align QR Code
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Simulator Stage */
          <div className="p-4 w-full h-full overflow-y-auto space-y-3 flex flex-col justify-center items-center bg-slate-950/40 text-center">
            <span className="text-xs font-black text-amber-400 flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 animate-spin" /> Interactive Handshake Simulated Scans
            </span>
            <p className="text-[10px] text-slate-400 max-w-[280px] leading-relaxed">
              Click any HBD companion profile below to instantly simulate a high-speed camera scanning transaction.
            </p>
            
            <div className="grid grid-cols-2 gap-2 w-full max-w-xs pt-1.5">
              {MOCK_EXTERNAL_PROFILES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSimulateScan(p)}
                  className="p-1.8 bg-slate-900 border border-slate-800 hover:border-indigo-500 text-left rounded-xl transition-all cursor-pointer text-slate-200 hover:bg-slate-850 flex items-center gap-1.5 group select-none hover:shadow-md"
                >
                  <span className={`w-5 h-5 text-[9px] font-black rounded-md flex items-center justify-center text-white font-serif tracking-tighter ${p.avatar}`}>
                    {p.name.split(" ").map(n => n[0]).join("")}
                  </span>
                  <div className="min-w-0 line-clamp-1">
                    <p className="text-[10px] font-extrabold truncate text-slate-201 group-hover:text-indigo-400">{p.name.split(" ")[0]}</p>
                    <p className="text-[8.5px] font-mono text-slate-500 truncate">@{p.username}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic scan flash / toast banner */}
        {toastMessage && (
          <div className="absolute inset-0 bg-indigo-600/95 flex flex-col items-center justify-center text-center space-y-2 select-none animate-fade-in z-20">
            <CheckCircle className="w-12 h-12 text-emerald-400 animate-bounce" />
            <h5 className="font-black text-white text-sm">{toastMessage}</h5>
            <p className="text-[10px] text-indigo-200">Handshake approved! Syncing database configurations...</p>
          </div>
        )}
      </div>

      <div className="text-[9.5px] text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed text-left flex gap-1.5">
        <span>💡</span>
        <span>Scanning a profile QR code instantly populates the companion form. When scanned, it automatically enables connected reciprocal permissions!</span>
      </div>

      {/* Styled custom scan line animation support in CSS */}
      <style>{`
        @keyframes scanLine {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  );
};
