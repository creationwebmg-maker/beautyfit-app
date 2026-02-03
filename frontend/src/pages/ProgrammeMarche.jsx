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
  ChevronRight,
  Timer,
  Flame,
  Heart,
  Footprints,
  Zap,
  CheckCircle2
} from "lucide-react";

const programmeMonths = [
  {
    id: 1, name: "Mois 1-2", sessions: "4 séances/semaine", duration: "25-35 min",
    fast: 20, slow: 45, reps: 15, color: "from-emerald-400 to-emerald-600", bonus: null
  },
  {
    id: 2, name: "Mois 3", sessions: "4-5 séances/semaine", duration: "30-40 min",
    fast: 25, slow: 40, reps: 20, color: "from-teal-400 to-teal-600", bonus: null
  },
  {
    id: 3, name: "Mois 4", sessions: "5 séances/semaine", duration: "35-45 min",
    fast: 30, slow: 30, reps: 20, color: "from-cyan-400 to-cyan-600", bonus: "Demi squats lents"
  },
  {
    id: 4, name: "Mois 5", sessions: "5 séances/semaine", duration: "40-50 min",
    fast: 30, slow: 35, reps: 25, color: "from-blue-400 to-blue-600", bonus: "Squats + Pas latéraux"
  },
  {
    id: 5, name: "Mois 6", sessions: "5-6 séances/semaine", duration: "45-55 min",
    fast: 35, slow: 25, reps: 25, color: "from-indigo-400 to-indigo-600", bonus: "Fentes marchées + Poussée bras x12"
  },
  {
    id: 6, name: "Mois 7", sessions: "6 séances/semaine", duration: "50-60 min",
    fast: 40, slow: 20, reps: 25, color: "from-violet-400 to-violet-600", bonus: "10 fentes + 15s gainage x4"
  },
  {
    id: 7, name: "Mois 8", sessions: "6 séances/semaine", duration: "55-65 min",
    fast: 20, slow: 20, reps: 20, color: "from-purple-400 to-purple-600", bonus: "Pas latéraux + Squats + Jumping jack x4"
  },
  {
    id: 8, name: "Mois 9", sessions: "5-6 séances/semaine", duration: "20-30 min",
    fast: 25, slow: 30, reps: 30, color: "from-rose-400 to-rose-600", bonus: "Sumo Squats + Mountain Climber x4"
  }
];

const rules = [
  "Rééducation du périnée validée",
  "Aucun impact, pas d'apnée",
  "Gainage doux permanent",
  "À la moindre gêne : on simplifie"
];

const ProgrammeMarche = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState("fast");
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentRep, setCurrentRep] = useState(1);
  const [totalReps, setTotalReps] = useState(10);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [motionPermission, setMotionPermission] = useState(false);
  
  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const lastAccelRef = useRef({ x: 0, y: 0, z: 0 });
  const stepThreshold = 12; // Sensitivity for step detection
  const lastStepTimeRef = useRef(0);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
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
    } catch (e) {
      console.log("Audio error", e);
    }
  }, [soundEnabled]);

  const triggerVibration = useCallback((pattern) => {
    if (!vibrationEnabled || !navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.log("Vibration error", e);
    }
  }, [vibrationEnabled]);

  const startSession = (month) => {
    setSelectedMonth(month);
    setCurrentPhase("fast");
    setTimeLeft(month.fast);
    setCurrentRep(1);
    setTotalReps(month.reps);
    setIsRunning(true);
    setIsPaused(false);
    setSessionComplete(false);
    setStepCount(0);
    triggerVibration([300, 100, 300]);
    playBeep(1000, 300);
  };

  // Step vibration effect - vibrates at each step
  useEffect(() => {
    if (isRunning && !isPaused && !sessionComplete) {
      // Faster steps during "fast" phase, slower during "slow" phase
      const stepInterval = currentPhase === "fast" ? 500 : 900;
      
      stepIntervalRef.current = setInterval(() => {
        // Vibration pattern: stronger for fast walk, gentler for recovery
        if (currentPhase === "fast") {
          triggerVibration([80]); // Short strong pulse for each fast step
        } else {
          triggerVibration([40]); // Gentle pulse for recovery steps
        }
        setStepCount(prev => prev + 1);
      }, stepInterval);
    }
    
    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, [isRunning, isPaused, sessionComplete, currentPhase, triggerVibration]);

  useEffect(() => {
    if (isRunning && !isPaused && selectedMonth) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (currentPhase === "fast") {
              triggerVibration([150, 100, 150]);
              playBeep(600, 200);
              setCurrentPhase("slow");
              return selectedMonth.slow;
            } else {
              if (currentRep >= totalReps) {
                setIsRunning(false);
                setSessionComplete(true);
                triggerVibration([500]);
                playBeep(1200, 500);
                return 0;
              }
              setCurrentRep((r) => r + 1);
              triggerVibration([200, 100, 200, 100, 200]);
              playBeep(1000, 300);
              setCurrentPhase("fast");
              return selectedMonth.fast;
            }
          }
          if (prev <= 4 && prev > 1) {
            playBeep(700, 100);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused, selectedMonth, currentPhase, currentRep, totalReps, triggerVibration, playBeep]);

  const resetSession = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSelectedMonth(null);
    setCurrentPhase("fast");
    setTimeLeft(0);
    setCurrentRep(1);
    setSessionComplete(false);
    setStepCount(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = () => currentPhase === "fast" ? "from-rose-500 to-red-600" : "from-emerald-500 to-green-600";
  const getPhaseLabel = () => currentPhase === "fast" ? "Marche rapide" : "Récupération";

  const getProgressPercentage = () => {
    if (!selectedMonth) return 0;
    const totalDuration = currentPhase === "fast" ? selectedMonth.fast : selectedMonth.slow;
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={() => selectedMonth && isRunning ? resetSession() : navigate(-1)}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="ml-2">
                <h1 className="text-lg font-semibold">Programme Marche Poussette</h1>
                <p className="text-xs text-muted-foreground">Post-partum (9 mois)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)}>
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setVibrationEnabled(!vibrationEnabled)}>
                <Vibrate className={`w-5 h-5 ${!vibrationEnabled ? "text-muted-foreground" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        {selectedMonth && (isRunning || sessionComplete) ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-8">
              <div className={`relative w-64 h-64 rounded-full bg-gradient-to-br ${getPhaseColor()} p-2 shadow-2xl`}>
                <div className="w-full h-full rounded-full bg-background flex flex-col items-center justify-center">
                  {sessionComplete ? (
                    <div className="text-center">
                      <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-2 mx-auto" />
                      <span className="text-2xl font-bold text-emerald-500">Bravo !</span>
                      <p className="text-sm text-muted-foreground">Session terminée</p>
                      <p className="text-lg font-semibold text-foreground mt-2">{stepCount} pas</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-6xl font-bold text-foreground">{formatTime(timeLeft)}</span>
                      <span className={`block text-lg font-semibold mt-2 ${currentPhase === "fast" ? "text-rose-500" : "text-emerald-500"}`}>
                        {getPhaseLabel()}
                      </span>
                      <div className="flex items-center justify-center gap-1 mt-2 text-muted-foreground">
                        <span className="text-sm">Répétition</span>
                        <span className="text-lg font-bold text-foreground">{currentRep}</span>
                        <span className="text-sm">/ {totalReps}</span>
                      </div>
                    </div>
                  )}
                </div>
                {!sessionComplete && (
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="128" cy="128" r="120" fill="none" stroke="currentColor" strokeWidth="8" className="text-background/30" />
                    <circle cx="128" cy="128" r="120" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 120}`}
                      strokeDashoffset={`${2 * Math.PI * 120 * (1 - getProgressPercentage() / 100)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                )}
              </div>

              {!sessionComplete && (
                <div className="mt-6 flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentPhase === "fast" ? "bg-rose-500/20 text-rose-600" : "bg-muted text-muted-foreground"}`}>
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-medium">Rapide</span>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentPhase === "slow" ? "bg-emerald-500/20 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                    <Footprints className="w-4 h-4" />
                    <span className="text-sm font-medium">Récup</span>
                  </div>
                </div>
              )}

              {/* Step Counter */}
              {!sessionComplete && (
                <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground">
                  <Footprints className={`w-5 h-5 ${currentPhase === "fast" ? "text-rose-500 animate-bounce" : "text-emerald-500"}`} />
                  <span className="text-2xl font-bold text-foreground">{stepCount}</span>
                  <span className="text-sm">pas</span>
                </div>
              )}
            </div>

            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progression globale</span>
                  <span className="text-sm text-muted-foreground">{Math.round((currentRep / totalReps) * 100)}%</span>
                </div>
                <Progress value={(currentRep / totalReps) * 100} className="h-2" />
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="lg" className="rounded-full w-14 h-14" onClick={resetSession}>
                <RotateCcw className="w-6 h-6" />
              </Button>
              {!sessionComplete && (
                <Button size="lg" className={`rounded-full w-20 h-20 ${isPaused ? "bg-emerald-500 hover:bg-emerald-600" : "bg-amber-500 hover:bg-amber-600"}`}
                  onClick={() => setIsPaused(!isPaused)}>
                  {isPaused ? <Play className="w-10 h-10" /> : <Pause className="w-10 h-10" />}
                </Button>
              )}
              {sessionComplete && (
                <Button size="lg" className="rounded-full px-8 h-14 bg-emerald-500 hover:bg-emerald-600" onClick={resetSession}>
                  Nouvelle session
                </Button>
              )}
            </div>

            {selectedMonth.bonus && (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-amber-500" />
                    <span className="font-semibold text-amber-600">Bonus After Walk</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedMonth.bonus}</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="border-rose-500/30 bg-rose-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <span className="font-semibold text-rose-600">Règles de base</span>
                </div>
                <ul className="space-y-2">
                  {rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Choisis ton mois</h2>
              {programmeMonths.map((month) => (
                <Card key={month.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-all border-0"
                  onClick={() => startSession(month)} data-testid={`month-${month.id}`}>
                  <div className={`bg-gradient-to-r ${month.color} p-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{month.name}</h3>
                        <p className="text-white/80 text-sm">{month.sessions}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer className="w-4 h-4" />
                        <span className="font-semibold">{month.duration}</span>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="bg-white/20 rounded-lg p-2 text-center">
                        <Zap className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-xs">{month.fast}s</span>
                        <p className="text-xs opacity-80">Rapide</p>
                      </div>
                      <div className="bg-white/20 rounded-lg p-2 text-center">
                        <Footprints className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-xs">{month.slow}s</span>
                        <p className="text-xs opacity-80">Récup</p>
                      </div>
                      <div className="bg-white/20 rounded-lg p-2 text-center">
                        <RotateCcw className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-xs">x{month.reps}</span>
                        <p className="text-xs opacity-80">Répétitions</p>
                      </div>
                    </div>
                    {month.bonus && (
                      <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-1 text-xs">
                        <Flame className="w-3 h-3" />
                        <span className="opacity-80">Bonus: {month.bonus}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <Card className="border-border/50 bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Vibrate className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Vibrations à chaque pas</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ton téléphone vibrera à chaque pas pour te guider dans ton rythme :
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-rose-500" />
                        <span>Marche rapide : vibrations rapides (toutes les 0.5s)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Footprints className="w-3 h-3 text-emerald-500" />
                        <span>Récupération : vibrations lentes (toutes les 0.9s)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProgrammeMarche;
