import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Vibrate,
  Timer,
  Flame,
  Heart,
  Footprints,
  Zap,
  CheckCircle2,
  Moon,
  Sun,
  Battery,
  Sparkles
} from "lucide-react";

// Programme de 4 semaines
const programmeWeeks = [
  {
    id: 1,
    name: "Semaine 1",
    title: "REMISE EN ROUTE",
    sessions: "2-3 séances",
    duration: "30 min",
    color: "from-amber-400 to-orange-500",
    icon: "🌙",
    seances: [
      {
        id: "s1-1",
        name: "Séance 1 - Fractionné doux",
        phases: [
          { type: "warmup", label: "Marche lente", duration: 300, vibration: false },
          { type: "circuit", label: "Circuit fractionné", rounds: 4, exercises: [
            { name: "Marche rapide", duration: 30, vibration: true },
            { name: "Marche lente", duration: 30, vibration: false },
            { name: "Marche active", duration: 60, vibration: true }
          ]},
          { type: "active", label: "Marche bras actifs", duration: 420, vibration: true },
          { type: "cooldown", label: "Retour au calme", duration: 300, vibration: false }
        ]
      },
      {
        id: "s1-2",
        name: "Séance 2 - Rythme continu",
        phases: [
          { type: "warmup", label: "Échauffement", duration: 300, vibration: false },
          { type: "active", label: "Marche active continue", duration: 900, vibration: true },
          { type: "circuit", label: "Fractionnés courts", rounds: 5, exercises: [
            { name: "Marche rapide", duration: 20, vibration: true },
            { name: "Marche lente", duration: 40, vibration: false }
          ]},
          { type: "cooldown", label: "Respiration + lente", duration: 300, vibration: false }
        ]
      },
      {
        id: "s1-3",
        name: "Séance 3 - Douce (optionnelle)",
        optional: true,
        phases: [
          { type: "active", label: "Marche libre", duration: 1800, vibration: false },
          { type: "circuit", label: "Circuit training", rounds: 4, restBetween: 30, exercises: [
            { name: "5 squats", duration: 30, vibration: true },
            { name: "20 montées genoux", duration: 45, vibration: true },
            { name: "10 squats latéraux", duration: 40, vibration: true }
          ]}
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Semaine 2",
    title: "ACTIVATION",
    subtitle: "Brûler + tonifier sans s'épuiser",
    sessions: "2-3 séances",
    duration: "30 min",
    color: "from-orange-400 to-red-500",
    icon: "🔥",
    seances: [
      {
        id: "s2-1",
        name: "Séance 1 - Fractionné court",
        phases: [
          { type: "warmup", label: "Échauffement", duration: 300, vibration: false },
          { type: "circuit", label: "Fractionnés intenses", rounds: 5, exercises: [
            { name: "Marche rapide", duration: 40, vibration: true },
            { name: "Récupération", duration: 20, vibration: false },
            { name: "Marche active", duration: 60, vibration: true }
          ]},
          { type: "cooldown", label: "Retour au calme", duration: 480, vibration: false }
        ]
      },
      {
        id: "s2-2",
        name: "Séance 2 - Variée",
        phases: [
          { type: "warmup", label: "Marche fluide", duration: 300, vibration: false },
          { type: "circuit", label: "Alternance", rounds: 4, exercises: [
            { name: "Marche rapide", duration: 30, vibration: true },
            { name: "Marche lente", duration: 60, vibration: false }
          ]},
          { type: "active", label: "Marche + bras", duration: 300, vibration: true },
          { type: "cooldown", label: "Marche lente", duration: 300, vibration: false }
        ]
      },
      {
        id: "s2-3",
        name: "Séance 3 - Posture (optionnelle)",
        optional: true,
        phases: [
          { type: "active", label: "Marche active", duration: 1800, vibration: true },
          { type: "circuit", label: "Circuit posture", rounds: 4, restBetween: 30, exercises: [
            { name: "10 fentes alternées", duration: 40, vibration: true },
            { name: "20 talons fesses", duration: 30, vibration: true },
            { name: "Jumping jack sans saut", duration: 30, vibration: true }
          ]}
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Semaine 3",
    title: "PIC CONTRÔLÉ",
    subtitle: "Équivalent 1h de marche - Semaine la plus intense MAIS courte",
    sessions: "2-3 séances",
    duration: "30 min",
    color: "from-red-400 to-rose-500",
    icon: "⚡",
    seances: [
      {
        id: "s3-1",
        name: "Séance 1 - Dynamique",
        phases: [
          { type: "warmup", label: "Échauffement", duration: 300, vibration: false },
          { type: "circuit", label: "Fractionnés intensifs", rounds: 5, exercises: [
            { name: "Marche rapide", duration: 45, vibration: true },
            { name: "Marche lente", duration: 15, vibration: false },
            { name: "Marche active", duration: 60, vibration: true }
          ]},
          { type: "cooldown", label: "Marche libre", duration: 420, vibration: false }
        ]
      },
      {
        id: "s3-2",
        name: "Séance 2 - Challenge doux",
        phases: [
          { type: "warmup", label: "Marche cool", duration: 300, vibration: false },
          { type: "circuit", label: "Blocs longs", rounds: 4, exercises: [
            { name: "Marche rapide", duration: 120, vibration: true },
            { name: "Marche lente", duration: 60, vibration: false }
          ]},
          { type: "cooldown", label: "Marche lente", duration: 600, vibration: false }
        ]
      },
      {
        id: "s3-3",
        name: "Séance 3 - Allégée (facultative)",
        optional: true,
        phases: [
          { type: "active", label: "Marche continue (zéro fractionné)", duration: 1200, vibration: false },
          { type: "circuit", label: "Circuit récupération", rounds: 4, restBetween: 30, exercises: [
            { name: "10 squats", duration: 30, vibration: true },
            { name: "10 ciseaux sans saut", duration: 30, vibration: true },
            { name: "15 montées genoux diago", duration: 35, vibration: true }
          ]}
        ]
      }
    ]
  },
  {
    id: 4,
    name: "Semaine 4",
    title: "FATIGUE & FIN DE RAMADAN",
    subtitle: "NE PAS LÂCHER, préserver l'énergie",
    sessions: "2-3 séances",
    duration: "20-30 min",
    color: "from-rose-400 to-purple-500",
    icon: "🌟",
    seances: [
      {
        id: "s4-1",
        name: "Séance 1 - Relance douce",
        phases: [
          { type: "warmup", label: "Marche lente", duration: 600, vibration: false },
          { type: "circuit", label: "Fractionnés légers", rounds: 5, exercises: [
            { name: "Marche rapide", duration: 30, vibration: true },
            { name: "Marche lente", duration: 60, vibration: false }
          ]},
          { type: "active", label: "Allure modérée", duration: 600, vibration: true }
        ]
      },
      {
        id: "s4-2",
        name: "Séance 2 - Énergie basse OK",
        phases: [
          { type: "warmup", label: "Marche libre", duration: 300, vibration: false },
          { type: "circuit", label: "Fractionnés doux", rounds: 4, exercises: [
            { name: "Marche rapide", duration: 20, vibration: true },
            { name: "Marche lente", duration: 45, vibration: false }
          ]},
          { type: "active", label: "Allure modérée", duration: 300, vibration: true },
          { type: "cooldown", label: "Lente + bras actifs", duration: 300, vibration: false }
        ]
      },
      {
        id: "s4-3",
        name: "Séance 3 - Si possible",
        optional: true,
        phases: [
          { type: "active", label: "Marche modérée", duration: 900, vibration: false },
          { type: "circuit", label: "Circuit final", rounds: 4, restBetween: 30, exercises: [
            { name: "10 fentes alternées", duration: 35, vibration: true },
            { name: "10 jumping jack", duration: 25, vibration: true },
            { name: "10 squats", duration: 30, vibration: true }
          ]}
        ]
      }
    ]
  }
];

const ProgrammeRamadan = () => {
  const navigate = useNavigate();
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedSeance, setSelectedSeance] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [motionPermission, setMotionPermission] = useState(false);
  const [isResting, setIsResting] = useState(false);

  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const lastAccelRef = useRef({ x: 0, y: 0, z: 0 });
  const stepThreshold = 12;
  const lastStepTimeRef = useRef(0);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const playBeep = useCallback((frequency = 800, duration = 200) => {
    if (!soundEnabled || !audioContextRef.current) return;
    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration / 1000);
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
    } catch (e) {}
  }, [soundEnabled]);

  const triggerVibration = useCallback((pattern) => {
    if (!vibrationEnabled || !navigator.vibrate) return;
    try { navigator.vibrate(pattern); } catch (e) {}
  }, [vibrationEnabled]);

  const getCurrentPhase = () => {
    if (!selectedSeance) return null;
    return selectedSeance.phases[currentPhaseIndex];
  };

  const startSession = (seance) => {
    setSelectedSeance(seance);
    setCurrentPhaseIndex(0);
    setCurrentExerciseIndex(0);
    setCurrentRound(1);
    setIsResting(false);
    
    const firstPhase = seance.phases[0];
    if (firstPhase.type === "circuit") {
      setTimeLeft(firstPhase.exercises[0].duration);
    } else {
      setTimeLeft(firstPhase.duration);
    }
    
    setIsRunning(true);
    setIsPaused(false);
    setSessionComplete(false);
    setStepCount(0);
    triggerVibration([300, 100, 300]);
    playBeep(1000, 300);

    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then(response => { if (response === 'granted') setMotionPermission(true); })
        .catch(console.error);
    } else {
      setMotionPermission(true);
    }
  };

  // Step detection
  useEffect(() => {
    if (!isRunning || isPaused || sessionComplete || !motionPermission) return;

    const handleMotion = (event) => {
      const { accelerationIncludingGravity } = event;
      if (!accelerationIncludingGravity) return;

      const { x, y, z } = accelerationIncludingGravity;
      const lastAccel = lastAccelRef.current;
      const deltaX = Math.abs(x - lastAccel.x);
      const deltaY = Math.abs(y - lastAccel.y);
      const deltaZ = Math.abs(z - lastAccel.z);
      const totalDelta = deltaX + deltaY + deltaZ;

      lastAccelRef.current = { x, y, z };

      const now = Date.now();
      const timeSinceLastStep = now - lastStepTimeRef.current;

      if (totalDelta > stepThreshold && timeSinceLastStep > 250) {
        lastStepTimeRef.current = now;
        setStepCount(prev => prev + 1);
        const phase = getCurrentPhase();
        if (phase?.vibration || (phase?.type === "circuit" && phase.exercises[currentExerciseIndex]?.vibration)) {
          triggerVibration([40]);
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isRunning, isPaused, sessionComplete, motionPermission, currentExerciseIndex, triggerVibration]);

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused && selectedSeance) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            const phase = getCurrentPhase();
            
            if (phase.type === "circuit") {
              // Check if we need rest between rounds
              if (isResting) {
                setIsResting(false);
                triggerVibration([200, 100, 200]);
                playBeep(1000, 200);
                return phase.exercises[0].duration;
              }
              
              // Move to next exercise in circuit
              if (currentExerciseIndex < phase.exercises.length - 1) {
                setCurrentExerciseIndex(i => i + 1);
                triggerVibration([150, 100, 150]);
                playBeep(600, 200);
                return phase.exercises[currentExerciseIndex + 1].duration;
              }
              
              // Move to next round
              if (currentRound < phase.rounds) {
                setCurrentRound(r => r + 1);
                setCurrentExerciseIndex(0);
                triggerVibration([200, 100, 200, 100, 200]);
                playBeep(800, 300);
                
                // Add rest between rounds if specified
                if (phase.restBetween) {
                  setIsResting(true);
                  return phase.restBetween;
                }
                return phase.exercises[0].duration;
              }
            }
            
            // Move to next phase
            if (currentPhaseIndex < selectedSeance.phases.length - 1) {
              setCurrentPhaseIndex(i => i + 1);
              setCurrentExerciseIndex(0);
              setCurrentRound(1);
              setIsResting(false);
              
              const nextPhase = selectedSeance.phases[currentPhaseIndex + 1];
              triggerVibration([300, 150, 300]);
              playBeep(1000, 400);
              
              if (nextPhase.type === "circuit") {
                return nextPhase.exercises[0].duration;
              }
              return nextPhase.duration;
            }
            
            // Session complete
            setIsRunning(false);
            setSessionComplete(true);
            triggerVibration([500, 200, 500]);
            playBeep(1200, 500);
            return 0;
          }
          
          if (prev <= 4 && prev > 1) {
            playBeep(700, 100);
            triggerVibration([50]);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, isPaused, selectedSeance, currentPhaseIndex, currentExerciseIndex, currentRound, isResting, triggerVibration, playBeep]);

  const resetSession = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSelectedSeance(null);
    setCurrentPhaseIndex(0);
    setCurrentExerciseIndex(0);
    setCurrentRound(1);
    setTimeLeft(0);
    setSessionComplete(false);
    setStepCount(0);
    setIsResting(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentLabel = () => {
    if (isResting) return "🧘 Repos";
    const phase = getCurrentPhase();
    if (!phase) return "";
    if (phase.type === "circuit") {
      return phase.exercises[currentExerciseIndex]?.name || phase.label;
    }
    return phase.label;
  };

  const getPhaseColor = () => {
    if (isResting) return "from-blue-400 to-blue-600";
    const phase = getCurrentPhase();
    if (!phase) return "from-amber-400 to-orange-500";
    if (phase.type === "warmup" || phase.type === "cooldown") return "from-emerald-400 to-green-600";
    if (phase.type === "active") return "from-amber-400 to-orange-500";
    const exercise = phase.exercises?.[currentExerciseIndex];
    if (exercise?.vibration) return "from-rose-500 to-red-600";
    return "from-emerald-400 to-green-600";
  };

  const getTotalProgress = () => {
    if (!selectedSeance) return 0;
    let totalPhases = selectedSeance.phases.length;
    let completedPhases = currentPhaseIndex;
    return (completedPhases / totalPhases) * 100;
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10" style={{ background: 'rgba(26, 26, 46, 0.9)' }}>
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => selectedSeance && isRunning ? resetSession() : selectedSeance ? setSelectedSeance(null) : selectedWeek ? setSelectedWeek(null) : navigate(-1)}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="ml-2">
                <h1 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Moon className="w-5 h-5 text-amber-400" />
                  Programme Ramadan
                </h1>
                <p className="text-xs text-white/60">Aller bien, même à jeun</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setSoundEnabled(!soundEnabled)}>
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-white/40" />}
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setVibrationEnabled(!vibrationEnabled)}>
                <Vibrate className={`w-5 h-5 ${!vibrationEnabled ? "text-white/40" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        {/* Active Session View */}
        {selectedSeance && (isRunning || sessionComplete) ? (
          <div className="space-y-6 animate-fade-in">
            {/* Timer Circle */}
            <div className="flex flex-col items-center justify-center py-8">
              <div className={`relative w-72 h-72 rounded-full bg-gradient-to-br ${getPhaseColor()} p-2 shadow-2xl animate-pulse-slow`}>
                <div className="w-full h-full rounded-full flex flex-col items-center justify-center" style={{ background: '#1a1a2e' }}>
                  {sessionComplete ? (
                    <div className="text-center">
                      <div className="text-6xl mb-4 animate-bounce">🌙</div>
                      <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-2 mx-auto" />
                      <span className="text-2xl font-bold text-emerald-400">Mabrouk !</span>
                      <p className="text-sm text-white/60">Session terminée</p>
                      <p className="text-xl font-semibold text-white mt-3">{stepCount} pas</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-6xl font-bold text-white">{formatTime(timeLeft)}</span>
                      <span className="block text-lg font-semibold mt-2 text-amber-400">
                        {getCurrentLabel()}
                      </span>
                      {getCurrentPhase()?.type === "circuit" && !isResting && (
                        <div className="flex items-center justify-center gap-2 mt-2 text-white/60">
                          <span className="text-sm">Tour</span>
                          <span className="text-lg font-bold text-white">{currentRound}</span>
                          <span className="text-sm">/ {getCurrentPhase().rounds}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {!sessionComplete && (
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="144" cy="144" r="136" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                    <circle cx="144" cy="144" r="136" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 136}`}
                      strokeDashoffset={`${2 * Math.PI * 136 * (timeLeft / (getCurrentPhase()?.type === "circuit" ? getCurrentPhase().exercises[currentExerciseIndex]?.duration : getCurrentPhase()?.duration || 1))}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                )}
              </div>

              {/* Phase Indicators */}
              {!sessionComplete && (
                <div className="mt-6 flex items-center gap-3">
                  {selectedSeance.phases.map((phase, idx) => (
                    <div 
                      key={idx}
                      className={`w-3 h-3 rounded-full transition-all ${idx === currentPhaseIndex ? 'bg-amber-400 scale-125' : idx < currentPhaseIndex ? 'bg-emerald-400' : 'bg-white/20'}`}
                    />
                  ))}
                </div>
              )}

              {/* Step Counter */}
              {!sessionComplete && (
                <div className="mt-4 flex items-center justify-center gap-2 text-white/60">
                  <Footprints className="w-5 h-5 text-amber-400 animate-bounce" />
                  <span className="text-2xl font-bold text-white">{stepCount}</span>
                  <span className="text-sm">pas</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <Card className="border-0 bg-white/5 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white/80">Progression</span>
                  <span className="text-sm text-white/60">{Math.round(getTotalProgress())}%</span>
                </div>
                <Progress value={getTotalProgress()} className="h-2 bg-white/10" />
              </CardContent>
            </Card>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="lg" className="rounded-full w-14 h-14 border-white/20 text-white hover:bg-white/10" onClick={resetSession}>
                <RotateCcw className="w-6 h-6" />
              </Button>
              {!sessionComplete && (
                <Button size="lg" className={`rounded-full w-20 h-20 ${isPaused ? "bg-emerald-500 hover:bg-emerald-600" : "bg-amber-500 hover:bg-amber-600"}`}
                  onClick={() => setIsPaused(!isPaused)}>
                  {isPaused ? <Play className="w-10 h-10" /> : <Pause className="w-10 h-10" />}
                </Button>
              )}
              {sessionComplete && (
                <Button size="lg" className="rounded-full px-8 h-14 bg-gradient-to-r from-amber-500 to-orange-500" onClick={resetSession}>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Nouvelle session
                </Button>
              )}
            </div>
          </div>
        ) : selectedWeek && !selectedSeance ? (
          /* Seances List */
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 block">{selectedWeek.icon}</span>
              <h2 className="text-2xl font-bold text-white">{selectedWeek.name}</h2>
              <p className="text-amber-400 font-semibold">{selectedWeek.title}</p>
              {selectedWeek.subtitle && <p className="text-white/60 text-sm mt-1">{selectedWeek.subtitle}</p>}
            </div>

            {selectedWeek.seances.map((seance) => (
              <Card 
                key={seance.id}
                className={`overflow-hidden cursor-pointer border-0 transition-all hover:scale-[1.02] ${seance.optional ? 'opacity-80' : ''}`}
                style={{ background: 'rgba(255,255,255,0.05)' }}
                onClick={() => startSession(seance)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${selectedWeek.color} flex items-center justify-center`}>
                        <Play className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{seance.name}</h3>
                        <p className="text-sm text-white/60">{seance.phases.length} phases</p>
                      </div>
                    </div>
                    {seance.optional && (
                      <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60">Optionnelle</span>
                    )}
                  </div>
                  
                  {/* Phase preview */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {seance.phases.map((phase, idx) => (
                      <span 
                        key={idx}
                        className={`text-xs px-2 py-1 rounded-full ${
                          phase.type === 'warmup' ? 'bg-emerald-500/20 text-emerald-300' :
                          phase.type === 'cooldown' ? 'bg-blue-500/20 text-blue-300' :
                          phase.type === 'circuit' ? 'bg-rose-500/20 text-rose-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {phase.label}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button 
              variant="outline" 
              className="w-full border-white/20 text-white hover:bg-white/10"
              onClick={() => setSelectedWeek(null)}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Retour aux semaines
            </Button>
          </div>
        ) : (
          /* Week Selection */
          <div className="space-y-6 animate-fade-in">
            {/* Hero */}
            <div className="text-center py-6">
              <div className="text-6xl mb-4 animate-float">🌙</div>
              <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                ALLER BIEN, MÊME À JEUN
              </h1>
              <p className="text-amber-400 text-lg">Programme Ramadan Marche</p>
              <div className="flex flex-wrap justify-center gap-3 mt-4 text-sm">
                <span className="bg-white/10 px-3 py-1.5 rounded-full text-white/80">🚶 Marche rapide & fractionnés</span>
                <span className="bg-white/10 px-3 py-1.5 rounded-full text-white/80">⏱️ 30 min</span>
                <span className="bg-white/10 px-3 py-1.5 rounded-full text-white/80">📅 2-3 séances/semaine</span>
              </div>
            </div>

            {/* Rules Card */}
            <Card className="border-0 overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(245,158,11,0.05))' }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-amber-400" />
                  <span className="font-semibold text-amber-300">Respect du jeûne & de la fatigue</span>
                </div>
                <ul className="space-y-2">
                  {["Écoute ton corps", "Hydrate-toi bien au ftour et suhur", "Adapte l'intensité selon ton énergie", "Pas de culpabilité si tu sautes une séance"].map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-white/70">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Weeks */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Timer className="w-5 h-5 text-amber-400" />
                Choisis ta semaine
              </h2>
              
              {programmeWeeks.map((week) => (
                <Card 
                  key={week.id}
                  className="overflow-hidden cursor-pointer border-0 transition-all hover:scale-[1.02]"
                  onClick={() => setSelectedWeek(week)}
                >
                  <div className={`bg-gradient-to-r ${week.color} p-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{week.icon}</span>
                        <div>
                          <h3 className="text-xl font-bold">{week.name}</h3>
                          <p className="text-white/90 text-sm font-medium">{week.title}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/80">{week.sessions}</p>
                        <p className="text-xs text-white/60">{week.duration}</p>
                      </div>
                    </div>
                    {week.subtitle && (
                      <p className="mt-2 text-sm text-white/70 italic">{week.subtitle}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <Battery className="w-4 h-4" />
                      <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white/80 rounded-full"
                          style={{ width: `${week.id === 3 ? 100 : week.id === 4 ? 40 : 60 + week.id * 10}%` }}
                        />
                      </div>
                      <span className="text-xs">{week.id === 3 ? "Intense" : week.id === 4 ? "Doux" : "Modéré"}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Info Card */}
            <Card className="border-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Vibrate className="w-5 h-5 text-amber-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white">Vibrations & Son</h4>
                    <p className="text-sm text-white/60 mt-1">
                      Chaque changement de phase déclenche une vibration. Garde ton téléphone sur toi pour ne rien manquer !
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
      `}</style>
    </div>
  );
};

export default ProgrammeRamadan;
