import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/utils";
import { toast } from "sonner";
import {
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Vibrate,
  Timer,
  Heart,
  Footprints,
  CheckCircle2,
  Moon,
  Battery,
  Sparkles,
  Smartphone,
  Lock,
  Loader2
} from "lucide-react";
import "./ProgrammeRamadan.css";

// Feedback modes
const FEEDBACK_VIBRATION = "vibration";
const FEEDBACK_SOUND = "sound";

// Silhouette images for different phases
const SILHOUETTES = {
  walk: "https://static.prod-images.emergentagent.com/jobs/abf886d8-0214-4db8-8bd9-a771888e9e78/images/4b3b2b0abc5e351c0499a15e1b3dff2994030dc8f1be0e3d588d4e2d26213090.png",
  fast_walk: "https://static.prod-images.emergentagent.com/jobs/abf886d8-0214-4db8-8bd9-a771888e9e78/images/0ed0cf66d9e2e6a8b334130149239e74bc82ad244324c4d69dab0a5a0441decb.png",
  rest: "https://static.prod-images.emergentagent.com/jobs/abf886d8-0214-4db8-8bd9-a771888e9e78/images/a29796073b5298f6ae1d980d9f0d21393f4d8ca97a06bca3a8e78c22856f2549.png"
};

function ProgrammeRamadan() {
  const navigate = useNavigate();
  const { token, isAuthenticated, isGuest } = useAuth();
  const [selectedWeekId, setSelectedWeekId] = useState(0);
  const [selectedSeanceId, setSelectedSeanceId] = useState(0);
  const [viewMode, setViewMode] = useState("weeks");
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [motionPermission, setMotionPermission] = useState(false);
  const [feedbackMode, setFeedbackMode] = useState(FEEDBACK_VIBRATION); // vibration or sound
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);
  const [isBackgroundMode, setIsBackgroundMode] = useState(false);

  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const lastAccelRef = useRef({ x: 0, y: 0, z: 0 });
  const stepThreshold = 10; // Sensitivity for step detection
  const lastStepTimeRef = useRef(0);
  const backgroundStepsRef = useRef(0); // Steps counted while in background
  const wakeLockRef = useRef(null); // Wake lock to keep screen on

  // Check if user has purchased the program
  useEffect(() => {
    const checkPurchase = async () => {
      if (!isAuthenticated || isGuest || !token) {
        setCheckingPurchase(false);
        return;
      }
      
      try {
        const purchases = await api.get("/user/purchases", token);
        const hasRamadanPurchase = purchases.some(p => 
          p.course_id === "prog_ramadan" || 
          p.course_id === "prog2" ||
          p.product_name?.toLowerCase().includes("ramadan")
        );
        setHasPurchased(hasRamadanPurchase);
      } catch (error) {
        console.error("Error checking purchase:", error);
      } finally {
        setCheckingPurchase(false);
      }
    };
    
    checkPurchase();
  }, [isAuthenticated, isGuest, token]);

  // Handle background/foreground mode for continuous step counting
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App goes to background
        setIsBackgroundMode(true);
        if (isRunning && !isPaused && !sessionComplete) {
          toast.info("Programme en arrière-plan - Les pas continuent d'être comptés", {
            duration: 2000,
            id: "background-mode"
          });
        }
      } else {
        // App comes back to foreground
        setIsBackgroundMode(false);
        if (isRunning && !isPaused && !sessionComplete) {
          toast.success(`De retour ! ${stepCount} pas comptés`, {
            duration: 2000,
            id: "foreground-mode"
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRunning, isPaused, sessionComplete, stepCount]);

  // Save session when complete
  const saveSession = useCallback(async () => {
    if (!isAuthenticated || isGuest || !token) return;
    
    const duration = sessionStartTime 
      ? Math.round((Date.now() - sessionStartTime) / 60000) 
      : 30;
    
    try {
      await api.post("/progress/session", {
        week_id: selectedWeekId,
        seance_id: selectedSeanceId,
        steps: stepCount,
        duration_minutes: duration,
        phases_completed: currentPhaseIndex + 1
      }, token);
      toast.success("Session enregistrée ! 🎉");
    } catch (error) {
      console.error("Error saving session:", error);
    }
    
    // Release wake lock when session completes
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  }, [isAuthenticated, isGuest, token, selectedWeekId, selectedSeanceId, stepCount, currentPhaseIndex, sessionStartTime]);

  // Simple data - phases for each seance [label, duration, isFastPhase]
  const getPhases = useCallback((weekId, seanceId) => {
    if (weekId === 1) {
      if (seanceId === 1) return [
        ["Marche lente", 300, false],
        ["Fractionné (x4)", 480, true],
        ["Marche bras actifs", 420, true],
        ["Retour au calme", 300, false]
      ];
      if (seanceId === 2) return [
        ["Échauffement", 300, false],
        ["Marche active", 900, true],
        ["Fractionnés courts (x5)", 300, true],
        ["Respiration lente", 300, false]
      ];
      return [["Marche libre", 1800, false]];
    }
    if (weekId === 2) {
      if (seanceId === 1) return [
        ["Échauffement", 300, false],
        ["Fractionnés intenses (x5)", 600, true],
        ["Retour au calme", 480, false]
      ];
      if (seanceId === 2) return [
        ["Marche fluide", 300, false],
        ["Alternance (x4)", 360, true],
        ["Marche + bras", 300, true],
        ["Marche lente", 300, false]
      ];
      return [["Marche active", 1800, true]];
    }
    if (weekId === 3) {
      if (seanceId === 1) return [
        ["Échauffement", 300, false],
        ["Fractionnés intensifs (x5)", 600, true],
        ["Marche libre", 420, false]
      ];
      if (seanceId === 2) return [
        ["Marche cool", 300, false],
        ["Blocs longs (x4)", 720, true],
        ["Marche lente", 600, false]
      ];
      return [["Marche continue", 1200, false]];
    }
    // Week 4
    if (seanceId === 1) return [
      ["Marche lente", 600, false],
      ["Fractionnés légers (x5)", 450, true],
      ["Allure modérée", 600, true]
    ];
    if (seanceId === 2) return [
      ["Marche libre", 300, false],
      ["Fractionnés doux (x4)", 260, true],
      ["Allure modérée", 300, true],
      ["Lente + bras", 300, false]
    ];
    return [["Marche modérée", 900, false]];
  }, []);

  // Get silhouette image based on current phase
  const getSilhouette = (phaseName, isFast) => {
    const nameLower = phaseName.toLowerCase();
    if (nameLower.includes("calme") || nameLower.includes("respiration") || nameLower.includes("échauffement") || nameLower.includes("retour")) {
      return SILHOUETTES.rest;
    }
    if (isFast || nameLower.includes("fractionné") || nameLower.includes("intense") || nameLower.includes("active")) {
      return SILHOUETTES.fast_walk;
    }
    return SILHOUETTES.walk;
  };

  const phases = getPhases(selectedWeekId, selectedSeanceId);
  const currentPhase = phases[currentPhaseIndex];

  // Initialize audio context
  useEffect(function initAudio() {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return function cleanup() { 
      if (audioContextRef.current) audioContextRef.current.close(); 
    };
  }, []);

  // Play beep sound
  const playBeep = useCallback(function beep(freq, dur) {
    if (feedbackMode !== FEEDBACK_SOUND || !audioContextRef.current) return;
    try {
      const osc = audioContextRef.current.createOscillator();
      const gain = audioContextRef.current.createGain();
      osc.connect(gain);
      gain.connect(audioContextRef.current.destination);
      osc.frequency.value = freq || 800;
      gain.gain.setValueAtTime(0.4, audioContextRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + (dur || 200)/1000);
      osc.start();
      osc.stop(audioContextRef.current.currentTime + (dur || 200)/1000);
    } catch(e) {}
  }, [feedbackMode]);

  // Play step sound (shorter beep for steps)
  const playStepSound = useCallback(function stepSound(isFast) {
    if (feedbackMode !== FEEDBACK_SOUND || !audioContextRef.current) return;
    try {
      const osc = audioContextRef.current.createOscillator();
      const gain = audioContextRef.current.createGain();
      osc.connect(gain);
      gain.connect(audioContextRef.current.destination);
      osc.frequency.value = isFast ? 600 : 400;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.2, audioContextRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.05);
      osc.start();
      osc.stop(audioContextRef.current.currentTime + 0.05);
    } catch(e) {}
  }, [feedbackMode]);

  // Vibrate device
  const vibrate = useCallback(function vib(pattern) {
    if (feedbackMode !== FEEDBACK_VIBRATION || !navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch(e) {}
  }, [feedbackMode]);

  // Vibrate for each step
  const vibrateStep = useCallback(function stepVib(isFast) {
    if (feedbackMode !== FEEDBACK_VIBRATION || !navigator.vibrate) return;
    try {
      navigator.vibrate(isFast ? [50] : [30]);
    } catch(e) {}
  }, [feedbackMode]);

  // Request motion permission and start session
  async function startSession(weekId, seanceId) {
    setSelectedWeekId(weekId);
    setSelectedSeanceId(seanceId);
    const firstPhases = getPhases(weekId, seanceId);
    setCurrentPhaseIndex(0);
    setTimeLeft(firstPhases[0][1]);
    setIsRunning(true);
    setIsPaused(false);
    setSessionComplete(false);
    setStepCount(0);
    setViewMode("session");
    setSessionStartTime(Date.now());
    
    // Reset accelerometer data
    lastAccelRef.current = { x: 0, y: 0, z: 0 };
    lastStepTimeRef.current = 0;
    
    // Try to acquire wake lock to keep screen on during exercise
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('Wake lock acquired - screen will stay on');
      }
    } catch (err) {
      console.log('Wake lock not available:', err);
    }
    
    // Feedback at start
    if (feedbackMode === FEEDBACK_VIBRATION) {
      vibrate([300, 100, 300]);
    } else {
      playBeep(1000, 300);
    }
    
    // Request motion permission for iOS
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            setMotionPermission(true);
          }
        })
        .catch(console.error);
    } else {
      setMotionPermission(true);
    }
  }

  // Real step detection using accelerometer
  useEffect(function stepDetection() {
    if (!isRunning || isPaused || sessionComplete || !motionPermission || viewMode !== "session") return;

    const handleMotion = (event) => {
      const { accelerationIncludingGravity } = event;
      if (!accelerationIncludingGravity) return;

      const { x, y, z } = accelerationIncludingGravity;
      const lastAccel = lastAccelRef.current;
      
      // Calculate acceleration change (delta)
      const deltaX = Math.abs((x || 0) - lastAccel.x);
      const deltaY = Math.abs((y || 0) - lastAccel.y);
      const deltaZ = Math.abs((z || 0) - lastAccel.z);
      const totalDelta = deltaX + deltaY + deltaZ;

      // Update last acceleration
      lastAccelRef.current = { x: x || 0, y: y || 0, z: z || 0 };

      // Detect step if acceleration change exceeds threshold
      const now = Date.now();
      const timeSinceLastStep = now - lastStepTimeRef.current;
      
      // Minimum 250ms between steps to avoid double counting
      if (totalDelta > stepThreshold && timeSinceLastStep > 250) {
        lastStepTimeRef.current = now;
        setStepCount(prev => prev + 1);
        
        // Get current phase to check if fast
        const currentPhases = getPhases(selectedWeekId, selectedSeanceId);
        const phase = currentPhases[currentPhaseIndex];
        const isFastPhase = phase ? phase[2] : false;
        
        // Trigger feedback based on mode
        if (feedbackMode === FEEDBACK_VIBRATION) {
          vibrateStep(isFastPhase);
        } else {
          playStepSound(isFastPhase);
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [isRunning, isPaused, sessionComplete, motionPermission, viewMode, selectedWeekId, selectedSeanceId, currentPhaseIndex, feedbackMode, getPhases, vibrateStep, playStepSound]);

  // Timer logic
  useEffect(function timerEffect() {
    if (!isRunning || isPaused || viewMode !== "session") return;
    
    const currentPhases = getPhases(selectedWeekId, selectedSeanceId);
    
    intervalRef.current = setInterval(function tick() {
      setTimeLeft(function updateTime(prev) {
        if (prev <= 1) {
          const nextIdx = currentPhaseIndex + 1;
          if (nextIdx >= currentPhases.length) {
            setIsRunning(false);
            setSessionComplete(true);
            // Save session to backend
            saveSession();
            if (feedbackMode === FEEDBACK_VIBRATION) {
              vibrate([500, 200, 500]);
            } else {
              playBeep(1200, 500);
            }
            return 0;
          }
          setCurrentPhaseIndex(nextIdx);
          if (feedbackMode === FEEDBACK_VIBRATION) {
            vibrate([300, 150, 300]);
          } else {
            playBeep(1000, 400);
          }
          return currentPhases[nextIdx][1];
        }
        // Countdown beep in last 3 seconds
        if (prev <= 4 && prev > 1) {
          if (feedbackMode === FEEDBACK_VIBRATION) {
            vibrate([50]);
          } else {
            playBeep(700, 100);
          }
        }
        return prev - 1;
      });
    }, 1000);
    
    return function cleanupTimer() { clearInterval(intervalRef.current); };
  }, [isRunning, isPaused, viewMode, selectedWeekId, selectedSeanceId, currentPhaseIndex, feedbackMode, getPhases, vibrate, playBeep]);

  function resetSession() {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentPhaseIndex(0);
    setTimeLeft(0);
    setSessionComplete(false);
    setStepCount(0);
    lastAccelRef.current = { x: 0, y: 0, z: 0 };
    lastStepTimeRef.current = 0;
    clearInterval(intervalRef.current);
    setViewMode("seances");
    
    // Release wake lock when session ends
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  }

  function formatTime(s) {
    return Math.floor(s / 60) + ":" + (s % 60).toString().padStart(2, "0");
  }

  function handleBack() {
    if (viewMode === "session") {
      if (isRunning) resetSession();
      else setViewMode("seances");
    } else if (viewMode === "seances") {
      setViewMode("weeks");
    } else {
      navigate(-1);
    }
  }

  function toggleFeedbackMode() {
    setFeedbackMode(prev => prev === FEEDBACK_VIBRATION ? FEEDBACK_SOUND : FEEDBACK_VIBRATION);
  }

  const weekNames = ["", "Semaine 1", "Semaine 2", "Semaine 3", "Semaine 4"];
  const weekTitles = ["", "REMISE EN ROUTE", "ACTIVATION", "PIC CONTRÔLÉ", "FIN DE RAMADAN"];
  const weekIcons = ["", "🌙", "🔥", "⚡", "🌟"];

  const phaseColorClass = currentPhase && currentPhase[2] ? "phase-fast" : "phase-slow";

  return (
    <div className="ramadan-page min-h-screen pb-24">
      <header className="ramadan-header sticky top-0 z-50 border-b" style={{ borderColor: '#D2DDE7' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" style={{ color: '#E37E7F' }} className="hover:bg-[#D5A0A8]/20" onClick={handleBack}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="ml-2">
                <h1 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#333' }}>
                  <Moon className="w-5 h-5" style={{ color: '#E37E7F' }} />
                  Programme Ramadan
                </h1>
                <p className="text-xs" style={{ color: '#999' }}>Aller bien, même à jeun</p>
              </div>
            </div>
            {/* Feedback Mode Toggle */}
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className={feedbackMode === FEEDBACK_VIBRATION ? "bg-[#D5A0A8]/20" : ""}
                style={{ color: feedbackMode === FEEDBACK_VIBRATION ? '#E37E7F' : '#999' }}
                onClick={() => setFeedbackMode(FEEDBACK_VIBRATION)}
                title="Vibrations"
              >
                <Vibrate className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={feedbackMode === FEEDBACK_SOUND ? "bg-[#D5A0A8]/20" : ""}
                style={{ color: feedbackMode === FEEDBACK_SOUND ? '#E37E7F' : '#999' }}
                onClick={() => setFeedbackMode(FEEDBACK_SOUND)}
                title="Son"
              >
                <Volume2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {viewMode === "session" ? (
          <div className="space-y-6">
            {/* Feedback Mode Indicator */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm" style={{ background: '#D5A0A8', color: 'white' }}>
                {feedbackMode === FEEDBACK_VIBRATION ? (
                  <>
                    <Vibrate className="w-4 h-4" />
                    <span>Vibrations activées</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Son activé</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center py-4">
              {/* Silhouette Animation */}
              {!sessionComplete && currentPhase && (
                <div className="mb-4 relative">
                  <img 
                    src={getSilhouette(currentPhase[0], currentPhase[2])} 
                    alt="Mouvement"
                    className={`h-32 w-auto object-contain ${!isPaused && isRunning ? 'animate-pulse' : ''}`}
                    style={{ 
                      filter: 'drop-shadow(0 4px 6px rgba(227, 126, 127, 0.3))',
                      transition: 'all 0.5s ease'
                    }}
                  />
                  {currentPhase[2] && !isPaused && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <span className="text-xs px-2 py-1 rounded-full text-white" style={{ background: '#E37E7F' }}>
                        Rythme rapide
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className={sessionComplete ? "timer-circle phase-complete" : `timer-circle ${phaseColorClass}`}>
                <div className="timer-inner">
                  {sessionComplete ? (
                    <div className="text-center">
                      <div className="text-6xl mb-4">🌙</div>
                      <CheckCircle2 className="w-16 h-16 mb-2 mx-auto" style={{ color: '#D5A0A8' }} />
                      <span className="text-2xl font-bold" style={{ color: '#E37E7F' }}>Mabrouk !</span>
                      <p style={{ color: '#999' }}>Session terminée</p>
                      <p className="text-xl font-semibold mt-3" style={{ color: '#333' }}>{stepCount} pas</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-6xl font-bold" style={{ color: '#333' }}>{formatTime(timeLeft)}</span>
                      <span className="block text-lg font-semibold mt-2" style={{ color: '#E37E7F' }}>{currentPhase ? currentPhase[0] : ""}</span>
                      <div className="flex items-center justify-center gap-2 mt-2" style={{ color: '#999' }}>
                        <span>Phase {currentPhaseIndex + 1}/{phases.length}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step Counter with animation */}
              {!sessionComplete && (
                <div className="mt-6 flex flex-col items-center">
                  <div className="flex items-center gap-3 px-6 py-3 rounded-full" style={{ background: '#D5A0A8' }}>
                    <Footprints className="w-6 h-6 text-white animate-bounce" />
                    <span className="text-3xl font-bold text-white">{stepCount}</span>
                    <span className="text-white/80">pas</span>
                  </div>
                  <p className="text-xs mt-2 flex items-center gap-1" style={{ color: '#999' }}>
                    <Smartphone className="w-3 h-3" />
                    Garde ton téléphone sur toi
                  </p>
                </div>
              )}
            </div>

            <Card className="border-0 shadow-md" style={{ background: 'white' }}>
              <CardContent className="p-4">
                <div className="flex justify-between mb-2">
                  <span style={{ color: '#666' }}>Progression</span>
                  <span style={{ color: '#999' }}>{Math.round((currentPhaseIndex / phases.length) * 100)}%</span>
                </div>
                <Progress value={(currentPhaseIndex / phases.length) * 100} className="h-2" style={{ background: '#D2DDE7' }} />
              </CardContent>
            </Card>

            <div className="flex justify-center gap-4">
              <Button variant="outline" size="lg" className="rounded-full w-14 h-14" style={{ borderColor: '#D5A0A8', color: '#D5A0A8' }} onClick={resetSession}>
                <RotateCcw className="w-6 h-6" />
              </Button>
              {!sessionComplete && (
                <Button size="lg" className="rounded-full w-20 h-20" style={{ background: isPaused ? '#D5A0A8' : '#E37E7F' }} onClick={() => setIsPaused(!isPaused)}>
                  {isPaused ? <Play className="w-10 h-10 text-white" /> : <Pause className="w-10 h-10 text-white" />}
                </Button>
              )}
              {sessionComplete && (
                <Button size="lg" className="rounded-full px-8 h-14 text-white" style={{ background: 'linear-gradient(135deg, #E37E7F, #EE9F80)' }} onClick={resetSession}>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Nouvelle session
                </Button>
              )}
            </div>

            {/* Motion Permission Info */}
            {!motionPermission && isRunning && (
              <Card className="border-0" style={{ background: 'rgba(213, 160, 168, 0.2)' }}>
                <CardContent className="p-4 text-center">
                  <p className="text-sm" style={{ color: '#E37E7F' }}>
                    📱 Autorise l'accès aux capteurs de mouvement pour le comptage des pas automatique
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Background Mode Indicator */}
            {isRunning && !sessionComplete && (
              <Card className="border-0" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <CardContent className="p-3 text-center">
                  <p className="text-sm" style={{ color: '#15803d' }}>
                    ✅ Mode arrière-plan activé - Tu peux verrouiller ton écran, les pas continuent d'être comptés !
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : viewMode === "seances" ? (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <span className="text-4xl">{weekIcons[selectedWeekId]}</span>
              <h2 className="text-2xl font-bold" style={{ color: '#333' }}>{weekNames[selectedWeekId]}</h2>
              <p style={{ color: '#E37E7F' }}>{weekTitles[selectedWeekId]}</p>
            </div>

            {/* Feedback Mode Selection */}
            <Card className="border-0 shadow-md" style={{ background: 'white' }}>
              <CardContent className="p-4">
                <p className="text-sm mb-3 text-center" style={{ color: '#666' }}>Choisis ton mode de feedback :</p>
                <div className="flex justify-center gap-3">
                  <Button 
                    className={`rounded-full flex items-center gap-2 ${feedbackMode === FEEDBACK_VIBRATION ? "text-white" : ""}`}
                    style={{ 
                      background: feedbackMode === FEEDBACK_VIBRATION ? '#E37E7F' : 'transparent',
                      border: feedbackMode === FEEDBACK_VIBRATION ? 'none' : '1px solid #D5A0A8',
                      color: feedbackMode === FEEDBACK_VIBRATION ? 'white' : '#D5A0A8'
                    }}
                    onClick={() => setFeedbackMode(FEEDBACK_VIBRATION)}
                  >
                    <Vibrate className="w-4 h-4" />
                    Vibrations
                  </Button>
                  <Button 
                    className={`rounded-full flex items-center gap-2 ${feedbackMode === FEEDBACK_SOUND ? "text-white" : ""}`}
                    style={{ 
                      background: feedbackMode === FEEDBACK_SOUND ? '#E37E7F' : 'transparent',
                      border: feedbackMode === FEEDBACK_SOUND ? 'none' : '1px solid #D5A0A8',
                      color: feedbackMode === FEEDBACK_SOUND ? 'white' : '#D5A0A8'
                    }}
                    onClick={() => setFeedbackMode(FEEDBACK_SOUND)}
                  >
                    <Volume2 className="w-4 h-4" />
                    Son
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="seance-card cursor-pointer hover:scale-[1.02] transition-all" onClick={() => startSession(selectedWeekId, 1)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={"w-12 h-12 rounded-full flex items-center justify-center week-" + selectedWeekId}>
                    <Play className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: '#333' }}>Séance 1</h3>
                    <p className="text-sm" style={{ color: '#999' }}>{getPhases(selectedWeekId, 1).length} phases</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="seance-card cursor-pointer hover:scale-[1.02] transition-all" onClick={() => startSession(selectedWeekId, 2)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={"w-12 h-12 rounded-full flex items-center justify-center week-" + selectedWeekId}>
                    <Play className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: '#333' }}>Séance 2</h3>
                    <p className="text-sm" style={{ color: '#999' }}>{getPhases(selectedWeekId, 2).length} phases</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="seance-card cursor-pointer hover:scale-[1.02] transition-all opacity-80" onClick={() => startSession(selectedWeekId, 3)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={"w-12 h-12 rounded-full flex items-center justify-center week-" + selectedWeekId}>
                      <Play className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: '#333' }}>Séance 3</h3>
                      <p className="text-sm" style={{ color: '#999' }}>{getPhases(selectedWeekId, 3).length} phases</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#D5A0A8', color: 'white' }}>Optionnelle</span>
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full rounded-full" style={{ borderColor: '#D5A0A8', color: '#D5A0A8' }} onClick={() => setViewMode("weeks")}>
              <ChevronLeft className="w-4 h-4 mr-2" />Retour
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center py-6">
              <div className="text-6xl mb-4">🌙</div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>ALLER BIEN, MÊME À JEUN</h1>
              <p className="text-lg" style={{ color: '#E37E7F' }}>Programme Ramadan Marche</p>
              <div className="flex flex-wrap justify-center gap-3 mt-4 text-sm">
                <span className="px-3 py-1.5 rounded-full" style={{ background: '#D5A0A8', color: 'white' }}>🚶 Marche rapide</span>
                <span className="px-3 py-1.5 rounded-full" style={{ background: '#E37E7F', color: 'white' }}>⏱️ 30 min</span>
                <span className="px-3 py-1.5 rounded-full" style={{ background: '#EE9F80', color: 'white' }}>📅 2-3x/semaine</span>
              </div>
            </div>

            <Card className="border-0 rules-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5" style={{ color: '#E37E7F' }} />
                  <span className="font-semibold" style={{ color: '#E37E7F' }}>Respect du jeûne</span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2" style={{ color: '#333' }}><CheckCircle2 className="w-4 h-4" style={{ color: '#E37E7F' }} />Écoute ton corps</li>
                  <li className="flex items-center gap-2" style={{ color: '#333' }}><CheckCircle2 className="w-4 h-4" style={{ color: '#E37E7F' }} />Hydrate-toi bien</li>
                  <li className="flex items-center gap-2" style={{ color: '#333' }}><CheckCircle2 className="w-4 h-4" style={{ color: '#E37E7F' }} />Adapte l'intensité</li>
                  <li className="flex items-center gap-2" style={{ color: '#333' }}><CheckCircle2 className="w-4 h-4" style={{ color: '#E37E7F' }} />Pas de culpabilité</li>
                </ul>
              </CardContent>
            </Card>

            {/* Step Detection Info */}
            <Card className="border-0 shadow-md" style={{ background: 'white' }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#FEF2F2' }}>
                    <Footprints className="w-5 h-5" style={{ color: '#E37E7F' }} />
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: '#333' }}>Comptage des pas automatique</h4>
                    <p className="text-sm mt-1" style={{ color: '#666' }}>
                      Ton téléphone détecte chaque pas et te donne un feedback en temps réel (vibration ou son).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {/* Prix et Achat - Affiché seulement si non acheté */}
              {!hasPurchased && (
                <Card className="border-0 shadow-lg overflow-hidden" style={{ background: 'linear-gradient(135deg, #E37E7F, #EE9F80)' }}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm">Programme complet</p>
                        <p className="text-3xl font-bold text-white">22 €</p>
                        <p className="text-white/80 text-sm">Accès illimité à vie</p>
                      </div>
                      <Button
                        onClick={() => navigate("/programme/checkout")}
                        className="rounded-full px-6 h-12 font-semibold"
                        style={{ background: 'white', color: '#E37E7F' }}
                        data-testid="buy-programme-btn"
                      >
                        Acheter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Message si acheté */}
              {hasPurchased && (
                <Card className="border-0 shadow-md" style={{ background: '#F0FDF4' }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-800">Programme débloqué !</p>
                        <p className="text-sm text-green-700">Accès illimité à toutes les semaines</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
                <Timer className="w-5 h-5" style={{ color: '#E37E7F' }} />Choisis ta semaine
              </h2>
              
              {checkingPurchase ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#E37E7F' }} />
                </div>
              ) : (
                [1, 2, 3, 4].map((weekId) => (
                  <Card 
                    key={weekId} 
                    className={`border-0 overflow-hidden transition-all ${hasPurchased ? 'cursor-pointer hover:scale-[1.02]' : 'opacity-80'}`}
                    onClick={() => {
                      if (hasPurchased) {
                        setSelectedWeekId(weekId);
                        setViewMode("seances");
                      } else {
                        toast.error("Achetez le programme pour accéder aux semaines");
                        navigate("/programme/checkout");
                      }
                    }}
                  >
                    <div className={"p-4 text-white week-" + weekId + " relative"}>
                      {/* Lock overlay if not purchased */}
                      {!hasPurchased && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="bg-white/90 rounded-full p-3">
                            <Lock className="w-6 h-6" style={{ color: '#E37E7F' }} />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{weekIcons[weekId]}</span>
                          <div>
                            <h3 className="text-xl font-bold">{weekNames[weekId]}</h3>
                            <p className="text-white/90 text-sm">{weekTitles[weekId]}</p>
                          </div>
                        </div>
                        <div className="text-right text-sm text-white/80">2-3 séances</div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Battery className="w-4 h-4" />
                        <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-white/80 rounded-full" style={{width: weekId === 3 ? "100%" : weekId === 4 ? "40%" : (50 + weekId * 15) + "%"}} />
                        </div>
                        <span className="text-xs">{weekId === 3 ? "Intense" : weekId === 4 ? "Doux" : "Modéré"}</span>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProgrammeRamadan;
