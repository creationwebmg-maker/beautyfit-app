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
  Baby,
  Timer,
  Flame,
  Heart,
  Footprints,
  Zap,
  CheckCircle2
} from "lucide-react";

// Programme data structure
const programmeData = {
  title: "Programme Marche Poussette",
  subtitle: "Post-partum (9 mois)",
  rules: [
    "Rééducation du périnée validée",
    "Aucun impact, pas d'apnée", 
    "Gainage doux permanent",
    "À la moindre gêne : on simplifie"
  ],
  months: [
    {
      id: 1,
      name: "Mois 1-2",
      sessions: "4 séances/semaine",
      duration: "25-35 min",
      intervals: {
        fast: { duration: 20, label: "Marche rapide" },
        slow: { duration: 45, label: "Marche lente" },
        repetitions: "10-15"
      },
      bonus: null,
      color: "from-emerald-400 to-emerald-600"
    },
    {
      id: 2,
      name: "Mois 3",
      sessions: "4-5 séances/semaine",
      duration: "30-40 min",
      intervals: {
        fast: { duration: 25, label: "Marche rapide" },
        slow: { duration: 40, label: "Marche lente" },
        repetitions: "15-20"
      },
      bonus: null,
      color: "from-teal-400 to-teal-600"
    },
    {
      id: 3,
      name: "Mois 4",
      sessions: "5 séances/semaine",
      duration: "35-45 min",
      intervals: {
        fast: { duration: 30, label: "Marche rapide" },
        slow: { duration: 30, label: "Marche active" },
        repetitions: "20"
      },
      bonus: ["Demi squats lents pendant la récupération"],
      color: "from-cyan-400 to-cyan-600"
    },
    {
      id: 4,
      name: "Mois 5",
      sessions: "5 séances/semaine",
      duration: "40-50 min",
      intervals: {
        fast: { duration: 30, label: "Marche rapide" },
        slow: { duration: 35, label: "Marche active" },
        repetitions: "20-25"
      },
      bonus: ["Squats", "Pas latéraux (avec élastique si possible)"],
      color: "from-blue-400 to-blue-600"
    },
    {
      id: 5,
      name: "Mois 6",
      sessions: "5-6 séances/semaine",
      duration: "45-55 min",
      intervals: {
        fast: { duration: 35, label: "Marche rapide" },
        slow: { duration: 25, label: "Marche lente" },
        repetitions: "25"
      },
      bonus: ["Fentes avant marchées (4 derniers fractionnés)", "Poussée bras poussette x12"],
      color: "from-indigo-400 to-indigo-600"
    },
    {
      id: 6,
      name: "Mois 7",
      sessions: "6 séances/semaine",
      duration: "50-60 min",
      intervals: {
        fast: { duration: 40, label: "Marche rapide" },
        slow: { duration: 20, label: "Marche active" },
        repetitions: "25"
      },
      bonus: ["10 fentes marchées", "15 sec gainage squat", "30 sec récup active", "x4 tours"],
      color: "from-violet-400 to-violet-600"
    },
    {
      id: 7,
      name: "Mois 8",
      sessions: "6 séances/semaine",
      duration: "55-65 min",
      intervals: {
        fast: { duration: 20, label: "Marche rapide" },
        medium: { duration: 20, label: "Marche active" },
        slow: { duration: 20, label: "Marche lente" },
        repetitions: "20"
      },
      bonus: ["Pas latéraux x20", "Squats x10", "Jumping jack x20", "x4 tours"],
      color: "from-purple-400 to-purple-600"
    },
    {
      id: 8,
      name: "Mois 9",
      sessions: "5-6 séances/semaine",
      duration: "20-30 min",
      intervals: {
        fast: { duration: 25, label: "Marche rapide" },
        slow: { duration: 30, label: "Récupération active" },
        repetitions: "20-30"
      },
      bonus: ["Sumo Squats Sautés x15", "Mountain Climber 45 sec", "Jumping jacks 45 sec", "x4 tours"],
      color: "from-rose-400 to-rose-600"
    }
  ]
};

// Vibration patterns
const vibrationPatterns = {
  fast: [200, 100, 200, 100, 200], // Strong pulse for fast walk
  slow: [100, 200], // Gentle pulse for slow walk
  start: [300, 100, 300], // Double pulse for start
  end: [500], // Long pulse for end
  countdown: [50], // Short tick
};

const ProgrammeMarche = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState("fast"); // fast, slow, medium
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentRep, setCurrentRep] = useState(1);
  const [totalReps, setTotalReps] = useState(10);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  
  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play beep sound
  const playBeep = useCallback((frequency = 800, duration = 200) => {
    if (!soundEnabled || !audioContextRef.current) return;
    
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
  }, [soundEnabled]);

  // Trigger vibration
  const triggerVibration = useCallback((pattern) => {
    if (!vibrationEnabled || !navigator.vibrate) return;
    navigator.vibrate(pattern);
  }, [vibrationEnabled]);

  // Start session
  const startSession = (month) => {
    setSelectedMonth(month);
    setCurrentPhase("fast");
    setTimeLeft(month.intervals.fast.duration);
    setCurrentRep(1);
    const reps = month.intervals.repetitions.includes("-") 
      ? parseInt(month.intervals.repetitions.split("-")[1]) 
      : parseInt(month.intervals.repetitions);
    setTotalReps(reps);
    setIsRunning(true);
    setIsPaused(false);
    setSessionComplete(false);
    triggerVibration(vibrationPatterns.start);
    playBeep(1000, 300);
  };

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused && selectedMonth) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Phase complete
            if (currentPhase === "fast") {
              // Switch to slow/recovery
              triggerVibration(vibrationPatterns.slow);
              playBeep(600, 200);
              setCurrentPhase("slow");
              return selectedMonth.intervals.slow?.duration || selectedMonth.intervals.medium?.duration || 30;
            } else if (currentPhase === "slow" || currentPhase === "medium") {
              // Check if we have medium phase (month 8)
              if (currentPhase === "slow" && selectedMonth.intervals.medium) {
                triggerVibration(vibrationPatterns.slow);
                playBeep(500, 200);
                setCurrentPhase("medium");
                return selectedMonth.intervals.medium.duration;
              }
              
              // Repetition complete
              if (currentRep >= totalReps) {
                // Session complete
                setIsRunning(false);
                setSessionComplete(true);
                triggerVibration(vibrationPatterns.end);
                playBeep(1200, 500);
                return 0;
              }
              
              // Next rep
              setCurrentRep((r) => r + 1);
              triggerVibration(vibrationPatterns.fast);
              playBeep(1000, 300);
              setCurrentPhase("fast");
              return selectedMonth.intervals.fast.duration;
            }
          }
          
          // Countdown beeps in last 3 seconds
          if (prev <= 4 && prev > 1) {
            triggerVibration(vibrationPatterns.countdown);
            playBeep(700, 100);
          }
          
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, selectedMonth, currentPhase, currentRep, totalReps, triggerVibration, playBeep]);

  // Reset session
  const resetSession = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSelectedMonth(null);
    setCurrentPhase("fast");
    setTimeLeft(0);
    setCurrentRep(1);
    setSessionComplete(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get phase color
  const getPhaseColor = () => {
    switch (currentPhase) {
      case "fast": return "from-rose-500 to-red-600";
      case "slow": return "from-emerald-500 to-green-600";
      case "medium": return "from-amber-500 to-orange-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  // Get phase label
  const getPhaseLabel = () => {
    if (!selectedMonth) return "";
    switch (currentPhase) {
      case "fast": return selectedMonth.intervals.fast.label;
      case "slow": return selectedMonth.intervals.slow?.label || "Récupération";
      case "medium": return selectedMonth.intervals.medium?.label || "Marche active";
      default: return "";
    }
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!selectedMonth) return 0;
    const totalDuration = currentPhase === "fast" 
      ? selectedMonth.intervals.fast.duration 
      : currentPhase === "medium"
        ? selectedMonth.intervals.medium?.duration || 20
        : selectedMonth.intervals.slow?.duration || 30;
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={() => selectedMonth && isRunning ? resetSession() : navigate(-1)}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="ml-2">
                <h1 className="text-lg font-semibold">{programmeData.title}</h1>
                <p className="text-xs text-muted-foreground">{programmeData.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={!soundEnabled ? "text-muted-foreground" : ""}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setVibrationEnabled(!vibrationEnabled)}
                className={!vibrationEnabled ? "text-muted-foreground" : ""}
              >
                <Vibrate className={`w-5 h-5 ${vibrationEnabled ? "text-foreground" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        {/* Active Session View */}
        {selectedMonth && (isRunning || sessionComplete) ? (
          <div className="space-y-6">
            {/* Timer Circle */}
            <div className="flex flex-col items-center justify-center py-8">
              <div className={`relative w-64 h-64 rounded-full bg-gradient-to-br ${getPhaseColor()} p-2 shadow-2xl`}>
                <div className="w-full h-full rounded-full bg-background flex flex-col items-center justify-center">
                  {sessionComplete ? (
                    <>
                      <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-2" />
                      <span className="text-2xl font-bold text-emerald-500">Bravo !</span>
                      <span className="text-sm text-muted-foreground">Session terminée</span>
                    </>
                  ) : (
                    <>
                      <span className="text-6xl font-bold text-foreground">{formatTime(timeLeft)}</span>
                      <span className={`text-lg font-semibold mt-2 ${currentPhase === "fast" ? "text-rose-500" : currentPhase === "medium" ? "text-amber-500" : "text-emerald-500"}`}>
                        {getPhaseLabel()}
                      </span>
                      <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                        <span className="text-sm">Répétition</span>
                        <span className="text-lg font-bold text-foreground">{currentRep}</span>
                        <span className="text-sm">/ {totalReps}</span>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Progress ring */}
                {!sessionComplete && (
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="128"
                      cy="128"
                      r="120"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-background/30"
                    />
                    <circle
                      cx="128"
                      cy="128"
                      r="120"
                      fill="none"
                      stroke="white"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 120}`}
                      strokeDashoffset={`${2 * Math.PI * 120 * (1 - getProgressPercentage() / 100)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                )}
              </div>

              {/* Phase indicator with vibration pattern */}
              {!sessionComplete && (
                <div className="mt-6 flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentPhase === "fast" ? "bg-rose-500/20 text-rose-600" : "bg-muted text-muted-foreground"}`}>
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-medium">Rapide</span>
                    {currentPhase === "fast" && <span className="flex gap-0.5">{[1,2,3].map(i => <span key={i} className="w-1.5 h-3 bg-rose-500 rounded-full animate-pulse" style={{animationDelay: `${i * 100}ms`}} />)}</span>}
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentPhase === "slow" ? "bg-emerald-500/20 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                    <Footprints className="w-4 h-4" />
                    <span className="text-sm font-medium">Récup</span>
                    {currentPhase === "slow" && <span className="flex gap-1">{[1,2].map(i => <span key={i} className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{animationDelay: `${i * 200}ms`}} />)}</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Overall progress */}
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progression globale</span>
                  <span className="text-sm text-muted-foreground">{Math.round((currentRep / totalReps) * 100)}%</span>
                </div>
                <Progress value={(currentRep / totalReps) * 100} className="h-2" />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{selectedMonth.name}</span>
                  <span>{selectedMonth.duration}</span>
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={resetSession}
              >
                <RotateCcw className="w-6 h-6" />
              </Button>
              
              {!sessionComplete && (
                <Button
                  size="lg"
                  className={`rounded-full w-20 h-20 ${isPaused ? "bg-emerald-500 hover:bg-emerald-600" : "bg-amber-500 hover:bg-amber-600"}`}
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? <Play className="w-10 h-10" /> : <Pause className="w-10 h-10" />}
                </Button>
              )}
              
              {sessionComplete && (
                <Button
                  size="lg"
                  className="rounded-full px-8 h-14 bg-emerald-500 hover:bg-emerald-600"
                  onClick={resetSession}
                >
                  Nouvelle session
                </Button>
              )}
            </div>

            {/* Bonus exercises */}
            {selectedMonth.bonus && (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="w-5 h-5 text-amber-500" />
                    <span className="font-semibold text-amber-600">Bonus After Walk</span>
                  </div>
                  <ul className="space-y-2">
                    {selectedMonth.bonus.map((exercise, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="w-4 h-4 text-amber-500" />
                        {exercise}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Month Selection View */
          <div className="space-y-6">
            {/* Rules Card */}
            <Card className="border-rose-500/30 bg-rose-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <span className="font-semibold text-rose-600">Règles de base</span>
                </div>
                <ul className="space-y-2">
                  {programmeData.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Month Cards */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Choisis ton mois</h2>
              {programmeData.months.map((month) => (
                <Card 
                  key={month.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-all border-0"
                  onClick={() => startSession(month)}
                  data-testid={`month-${month.id}`}
                >
                  <div className={`bg-gradient-to-r ${month.color} p-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{month.name}</h3>
                        <p className="text-white/80 text-sm">{month.sessions}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Timer className="w-4 h-4" />
                          <span className="font-semibold">{month.duration}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="bg-white/20 rounded-lg p-2 text-center">
                        <Zap className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-xs">{month.intervals.fast.duration}s</span>
                        <p className="text-xs opacity-80">Rapide</p>
                      </div>
                      <div className="bg-white/20 rounded-lg p-2 text-center">
                        <Footprints className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-xs">{month.intervals.slow?.duration || month.intervals.medium?.duration}s</span>
                        <p className="text-xs opacity-80">Récup</p>
                      </div>
                      <div className="bg-white/20 rounded-lg p-2 text-center">
                        <RotateCcw className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-xs">x{month.intervals.repetitions}</span>
                        <p className="text-xs opacity-80">Répétitions</p>
                      </div>
                    </div>

                    {month.bonus && (
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <div className="flex items-center gap-1 text-xs">
                          <Flame className="w-3 h-3" />
                          <span className="opacity-80">Bonus: {month.bonus[0]}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Info about vibrations */}
            <Card className="border-border/50 bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Vibrate className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Vibrations intelligentes</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ton téléphone vibrera différemment selon la phase :
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="flex gap-0.5">{[1,2,3].map(i => <span key={i} className="w-1 h-2 bg-rose-500 rounded-full" />)}</span>
                        Vibrations fortes = Marche rapide
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="flex gap-1">{[1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />)}</span>
                        Vibrations douces = Récupération
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
