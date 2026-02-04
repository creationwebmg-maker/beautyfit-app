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
  Heart,
  Footprints,
  Zap,
  CheckCircle2,
  Moon,
  Battery,
  Sparkles
} from "lucide-react";

const ProgrammeRamadan = () => {
  const navigate = useNavigate();
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedSeance, setSelectedSeance] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [stepCount, setStepCount] = useState(0);

  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);

  // Programme data
  const weeks = [
    { id: 1, name: "Semaine 1", title: "REMISE EN ROUTE", icon: "🌙", color: "from-amber-400 to-orange-500",
      seances: [
        { id: "s1", name: "Séance 1", phases: [
          { label: "Marche lente", duration: 300, fast: false },
          { label: "30s rapide + 30s lente + 1min active (x4)", duration: 480, fast: true },
          { label: "Marche bras actifs", duration: 420, fast: true },
          { label: "Retour au calme", duration: 300, fast: false }
        ]},
        { id: "s2", name: "Séance 2 - Rythme continu", phases: [
          { label: "Échauffement", duration: 300, fast: false },
          { label: "Marche active continue", duration: 900, fast: true },
          { label: "20s rapide + 40s lente (x5)", duration: 300, fast: true },
          { label: "Respiration + lente", duration: 300, fast: false }
        ]},
        { id: "s3", name: "Séance 3 - Douce (optionnelle)", optional: true, phases: [
          { label: "Marche libre", duration: 1800, fast: false }
        ]}
      ]
    },
    { id: 2, name: "Semaine 2", title: "ACTIVATION", icon: "🔥", color: "from-orange-400 to-red-500",
      seances: [
        { id: "s1", name: "Séance 1 - Fractionné court", phases: [
          { label: "Échauffement", duration: 300, fast: false },
          { label: "40s rapide + 20s récup + 1min active (x5)", duration: 600, fast: true },
          { label: "Retour au calme", duration: 480, fast: false }
        ]},
        { id: "s2", name: "Séance 2 - Variée", phases: [
          { label: "Marche fluide", duration: 300, fast: false },
          { label: "30s rapide + 1min lente (x4)", duration: 360, fast: true },
          { label: "Marche + bras", duration: 300, fast: true },
          { label: "Marche lente", duration: 300, fast: false }
        ]},
        { id: "s3", name: "Séance 3 - Posture (optionnelle)", optional: true, phases: [
          { label: "Marche active", duration: 1800, fast: true }
        ]}
      ]
    },
    { id: 3, name: "Semaine 3", title: "PIC CONTRÔLÉ", subtitle: "Semaine la plus intense", icon: "⚡", color: "from-red-400 to-rose-500",
      seances: [
        { id: "s1", name: "Séance 1 - Dynamique", phases: [
          { label: "Échauffement", duration: 300, fast: false },
          { label: "45s rapide + 15s lente + 1min active (x5)", duration: 600, fast: true },
          { label: "Marche libre", duration: 420, fast: false }
        ]},
        { id: "s2", name: "Séance 2 - Challenge doux", phases: [
          { label: "Marche cool", duration: 300, fast: false },
          { label: "2min rapide + 1min lente (x4)", duration: 720, fast: true },
          { label: "Marche lente", duration: 600, fast: false }
        ]},
        { id: "s3", name: "Séance 3 - Allégée (facultative)", optional: true, phases: [
          { label: "Marche continue", duration: 1200, fast: false }
        ]}
      ]
    },
    { id: 4, name: "Semaine 4", title: "FIN DE RAMADAN", subtitle: "Préserver l'énergie", icon: "🌟", color: "from-rose-400 to-purple-500",
      seances: [
        { id: "s1", name: "Séance 1 - Relance douce", phases: [
          { label: "Marche lente", duration: 600, fast: false },
          { label: "30s rapide + 1min lente (x5)", duration: 450, fast: true },
          { label: "Allure modérée", duration: 600, fast: true }
        ]},
        { id: "s2", name: "Séance 2 - Énergie basse OK", phases: [
          { label: "Marche libre", duration: 300, fast: false },
          { label: "20s rapide + 45s lente (x4)", duration: 260, fast: true },
          { label: "Allure modérée", duration: 300, fast: true },
          { label: "Lente + bras actifs", duration: 300, fast: false }
        ]},
        { id: "s3", name: "Séance 3 - Si possible", optional: true, phases: [
          { label: "Marche modérée", duration: 900, fast: false }
        ]}
      ]
    }
  ];

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => { if (audioContextRef.current) audioContextRef.current.close(); };
  }, []);

  const playBeep = useCallback((freq = 800, dur = 200) => {
    if (!soundEnabled || !audioContextRef.current) return;
    try {
      const osc = audioContextRef.current.createOscillator();
      const gain = audioContextRef.current.createGain();
      osc.connect(gain);
      gain.connect(audioContextRef.current.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + dur/1000);
      osc.start();
      osc.stop(audioContextRef.current.currentTime + dur/1000);
    } catch(e) {}
  }, [soundEnabled]);

  const vibrate = useCallback((pattern) => {
    if (vibrationEnabled && navigator.vibrate) navigator.vibrate(pattern);
  }, [vibrationEnabled]);

  const startSession = (seance) => {
    setSelectedSeance(seance);
    setCurrentPhaseIndex(0);
    setTimeLeft(seance.phases[0].duration);
    setIsRunning(true);
    setIsPaused(false);
    setSessionComplete(false);
    setStepCount(0);
    vibrate([300, 100, 300]);
    playBeep(1000, 300);
  };

  useEffect(() => {
    if (!isRunning || isPaused || !selectedSeance) return;
    
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          const nextIdx = currentPhaseIndex + 1;
          if (nextIdx >= selectedSeance.phases.length) {
            setIsRunning(false);
            setSessionComplete(true);
            vibrate([500, 200, 500]);
            playBeep(1200, 500);
            return 0;
          }
          setCurrentPhaseIndex(nextIdx);
          vibrate([300, 150, 300]);
          playBeep(1000, 400);
          return selectedSeance.phases[nextIdx].duration;
        }
        if (prev <= 4 && prev > 1) {
          playBeep(700, 100);
          vibrate([50]);
        }
        // Count steps during fast phases
        const phase = selectedSeance.phases[currentPhaseIndex];
        if (phase?.fast && Math.random() > 0.7) {
          setStepCount(s => s + 1);
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused, selectedSeance, currentPhaseIndex, vibrate, playBeep]);

  const resetSession = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSelectedSeance(null);
    setCurrentPhaseIndex(0);
    setTimeLeft(0);
    setSessionComplete(false);
    setStepCount(0);
    clearInterval(intervalRef.current);
  };

  const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  const phase = selectedSeance?.phases[currentPhaseIndex];
  const phaseColor = phase?.fast ? "from-rose-500 to-red-600" : "from-emerald-400 to-green-600";

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10" style={{ background: 'rgba(26,26,46,0.9)' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" 
                onClick={() => selectedSeance ? (isRunning ? resetSession() : setSelectedSeance(null)) : selectedWeek ? setSelectedWeek(null) : navigate(-1)}>
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
            <div className="flex gap-2">
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

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Active Session */}
        {selectedSeance && (isRunning || sessionComplete) ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center py-8">
              <div className={`relative w-72 h-72 rounded-full bg-gradient-to-br ${sessionComplete ? "from-emerald-400 to-green-600" : phaseColor} p-2 shadow-2xl`}>
                <div className="w-full h-full rounded-full flex flex-col items-center justify-center" style={{ background: '#1a1a2e' }}>
                  {sessionComplete ? (
                    <div className="text-center">
                      <div className="text-6xl mb-4">🌙</div>
                      <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-2 mx-auto" />
                      <span className="text-2xl font-bold text-emerald-400">Mabrouk !</span>
                      <p className="text-white/60">Session terminée</p>
                      <p className="text-xl font-semibold text-white mt-3">{stepCount} pas</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-6xl font-bold text-white">{formatTime(timeLeft)}</span>
                      <span className="block text-lg font-semibold mt-2 text-amber-400">{phase?.label}</span>
                      <div className="flex items-center justify-center gap-2 mt-2 text-white/60">
                        <span>Phase {currentPhaseIndex + 1}/{selectedSeance.phases.length}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!sessionComplete && (
                <div className="mt-4 flex items-center gap-2 text-white/60">
                  <Footprints className="w-5 h-5 text-amber-400" />
                  <span className="text-2xl font-bold text-white">{stepCount}</span>
                  <span>pas</span>
                </div>
              )}
            </div>

            <Card className="border-0 bg-white/5">
              <CardContent className="p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-white/80">Progression</span>
                  <span className="text-white/60">{Math.round((currentPhaseIndex / selectedSeance.phases.length) * 100)}%</span>
                </div>
                <Progress value={(currentPhaseIndex / selectedSeance.phases.length) * 100} className="h-2 bg-white/10" />
              </CardContent>
            </Card>

            <div className="flex justify-center gap-4">
              <Button variant="outline" size="lg" className="rounded-full w-14 h-14 border-white/20 text-white hover:bg-white/10" onClick={resetSession}>
                <RotateCcw className="w-6 h-6" />
              </Button>
              {!sessionComplete && (
                <Button size="lg" className={`rounded-full w-20 h-20 ${isPaused ? "bg-emerald-500" : "bg-amber-500"}`}
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
          /* Seances */
          <div className="space-y-4">
            <div className="text-center mb-6">
              <span className="text-4xl">{selectedWeek.icon}</span>
              <h2 className="text-2xl font-bold text-white">{selectedWeek.name}</h2>
              <p className="text-amber-400">{selectedWeek.title}</p>
              {selectedWeek.subtitle && <p className="text-white/60 text-sm">{selectedWeek.subtitle}</p>}
            </div>

            {selectedWeek.seances.map((seance) => (
              <Card key={seance.id} className={`cursor-pointer border-0 hover:scale-[1.02] transition-all ${seance.optional ? 'opacity-80' : ''}`}
                style={{ background: 'rgba(255,255,255,0.05)' }} onClick={() => startSession(seance)}>
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
                    {seance.optional && <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60">Optionnelle</span>}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10" onClick={() => setSelectedWeek(null)}>
              <ChevronLeft className="w-4 h-4 mr-2" />Retour
            </Button>
          </div>
        ) : (
          /* Weeks */
          <div className="space-y-6">
            <div className="text-center py-6">
              <div className="text-6xl mb-4">🌙</div>
              <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                ALLER BIEN, MÊME À JEUN
              </h1>
              <p className="text-amber-400 text-lg">Programme Ramadan Marche</p>
              <div className="flex flex-wrap justify-center gap-3 mt-4 text-sm">
                <span className="bg-white/10 px-3 py-1.5 rounded-full text-white/80">🚶 Marche rapide</span>
                <span className="bg-white/10 px-3 py-1.5 rounded-full text-white/80">⏱️ 30 min</span>
                <span className="bg-white/10 px-3 py-1.5 rounded-full text-white/80">📅 2-3x/semaine</span>
              </div>
            </div>

            <Card className="border-0" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(245,158,11,0.05))' }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-amber-400" />
                  <span className="font-semibold text-amber-300">Respect du jeûne</span>
                </div>
                <ul className="space-y-2 text-sm text-white/70">
                  {["Écoute ton corps", "Hydrate-toi bien", "Adapte l'intensité", "Pas de culpabilité"].map((r, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />{r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Timer className="w-5 h-5 text-amber-400" />Choisis ta semaine
              </h2>
              
              {weeks.map((week) => (
                <Card key={week.id} className="cursor-pointer border-0 hover:scale-[1.02] transition-all" onClick={() => setSelectedWeek(week)}>
                  <div className={`bg-gradient-to-r ${week.color} p-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{week.icon}</span>
                        <div>
                          <h3 className="text-xl font-bold">{week.name}</h3>
                          <p className="text-white/90 text-sm">{week.title}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-white/80">2-3 séances</div>
                    </div>
                    {week.subtitle && <p className="mt-2 text-sm text-white/70 italic">{week.subtitle}</p>}
                    <div className="mt-3 flex items-center gap-2">
                      <Battery className="w-4 h-4" />
                      <div className="flex-1 h-2 bg-white/20 rounded-full">
                        <div className="h-full bg-white/80 rounded-full" style={{ width: `${week.id === 3 ? 100 : week.id === 4 ? 40 : 50 + week.id * 15}%` }} />
                      </div>
                      <span className="text-xs">{week.id === 3 ? "Intense" : week.id === 4 ? "Doux" : "Modéré"}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="border-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Vibrate className="w-5 h-5 text-amber-400" />
                  <div>
                    <h4 className="font-medium text-white">Vibrations & Son</h4>
                    <p className="text-sm text-white/60">Chaque changement de phase déclenche une vibration.</p>
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

export default ProgrammeRamadan;
