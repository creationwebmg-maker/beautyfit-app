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
  CheckCircle2,
  Moon,
  Battery,
  Sparkles
} from "lucide-react";
import "./ProgrammeRamadan.css";

function ProgrammeRamadan() {
  const navigate = useNavigate();
  const [selectedWeekId, setSelectedWeekId] = useState(0);
  const [selectedSeanceId, setSelectedSeanceId] = useState(0);
  const [viewMode, setViewMode] = useState("weeks");
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

  // Simple data - phases for each seance
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

  const phases = getPhases(selectedWeekId, selectedSeanceId);
  const currentPhase = phases[currentPhaseIndex];

  useEffect(function initAudio() {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return function cleanup() { 
      if (audioContextRef.current) audioContextRef.current.close(); 
    };
  }, []);

  const playBeep = useCallback(function beep(freq, dur) {
    if (!soundEnabled || !audioContextRef.current) return;
    try {
      const osc = audioContextRef.current.createOscillator();
      const gain = audioContextRef.current.createGain();
      osc.connect(gain);
      gain.connect(audioContextRef.current.destination);
      osc.frequency.value = freq || 800;
      gain.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + (dur || 200)/1000);
      osc.start();
      osc.stop(audioContextRef.current.currentTime + (dur || 200)/1000);
    } catch(e) {}
  }, [soundEnabled]);

  const vibrate = useCallback(function vib(pattern) {
    if (vibrationEnabled && navigator.vibrate) navigator.vibrate(pattern);
  }, [vibrationEnabled]);

  function startSession(weekId, seanceId) {
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
    vibrate([300, 100, 300]);
    playBeep(1000, 300);
  }

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
            vibrate([500, 200, 500]);
            playBeep(1200, 500);
            return 0;
          }
          setCurrentPhaseIndex(nextIdx);
          vibrate([300, 150, 300]);
          playBeep(1000, 400);
          return currentPhases[nextIdx][1];
        }
        if (prev <= 4 && prev > 1) {
          playBeep(700, 100);
          vibrate([50]);
        }
        if (currentPhases[currentPhaseIndex] && currentPhases[currentPhaseIndex][2] && Math.random() > 0.7) {
          setStepCount(function inc(s) { return s + 1; });
        }
        return prev - 1;
      });
    }, 1000);
    
    return function cleanupTimer() { clearInterval(intervalRef.current); };
  }, [isRunning, isPaused, viewMode, selectedWeekId, selectedSeanceId, currentPhaseIndex, vibrate, playBeep, getPhases]);

  function resetSession() {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentPhaseIndex(0);
    setTimeLeft(0);
    setSessionComplete(false);
    setStepCount(0);
    clearInterval(intervalRef.current);
    setViewMode("seances");
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

  const weekNames = ["", "Semaine 1", "Semaine 2", "Semaine 3", "Semaine 4"];
  const weekTitles = ["", "REMISE EN ROUTE", "ACTIVATION", "PIC CONTRÔLÉ", "FIN DE RAMADAN"];
  const weekIcons = ["", "🌙", "🔥", "⚡", "🌟"];

  return (
    <div className="ramadan-page min-h-screen pb-24">
      <header className="ramadan-header sticky top-0 z-50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={handleBack}>
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
                <Vibrate className={vibrationEnabled ? "w-5 h-5" : "w-5 h-5 text-white/40"} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {viewMode === "session" ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center py-8">
              <div className={sessionComplete ? "timer-circle phase-complete" : currentPhase && currentPhase[2] ? "timer-circle phase-fast" : "timer-circle phase-slow"}>
                <div className="timer-inner">
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
                      <span className="block text-lg font-semibold mt-2 text-amber-400">{currentPhase ? currentPhase[0] : ""}</span>
                      <div className="flex items-center justify-center gap-2 mt-2 text-white/60">
                        <span>Phase {currentPhaseIndex + 1}/{phases.length}</span>
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
                  <span className="text-white/60">{Math.round((currentPhaseIndex / phases.length) * 100)}%</span>
                </div>
                <Progress value={(currentPhaseIndex / phases.length) * 100} className="h-2 bg-white/10" />
              </CardContent>
            </Card>

            <div className="flex justify-center gap-4">
              <Button variant="outline" size="lg" className="rounded-full w-14 h-14 border-white/20 text-white hover:bg-white/10" onClick={resetSession}>
                <RotateCcw className="w-6 h-6" />
              </Button>
              {!sessionComplete && (
                <Button size="lg" className={isPaused ? "rounded-full w-20 h-20 bg-emerald-500" : "rounded-full w-20 h-20 bg-amber-500"} onClick={() => setIsPaused(!isPaused)}>
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
        ) : viewMode === "seances" ? (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <span className="text-4xl">{weekIcons[selectedWeekId]}</span>
              <h2 className="text-2xl font-bold text-white">{weekNames[selectedWeekId]}</h2>
              <p className="text-amber-400">{weekTitles[selectedWeekId]}</p>
            </div>

            <Card className="seance-card cursor-pointer border-0 hover:scale-[1.02] transition-all" onClick={() => startSession(selectedWeekId, 1)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={"w-12 h-12 rounded-full flex items-center justify-center week-" + selectedWeekId}>
                    <Play className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Séance 1</h3>
                    <p className="text-sm text-white/60">{getPhases(selectedWeekId, 1).length} phases</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="seance-card cursor-pointer border-0 hover:scale-[1.02] transition-all" onClick={() => startSession(selectedWeekId, 2)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={"w-12 h-12 rounded-full flex items-center justify-center week-" + selectedWeekId}>
                    <Play className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Séance 2</h3>
                    <p className="text-sm text-white/60">{getPhases(selectedWeekId, 2).length} phases</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="seance-card cursor-pointer border-0 hover:scale-[1.02] transition-all opacity-80" onClick={() => startSession(selectedWeekId, 3)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={"w-12 h-12 rounded-full flex items-center justify-center week-" + selectedWeekId}>
                      <Play className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Séance 3</h3>
                      <p className="text-sm text-white/60">{getPhases(selectedWeekId, 3).length} phases</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60">Optionnelle</span>
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10" onClick={() => setViewMode("weeks")}>
              <ChevronLeft className="w-4 h-4 mr-2" />Retour
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center py-6">
              <div className="text-6xl mb-4">🌙</div>
              <h1 className="text-3xl font-bold text-white mb-2">ALLER BIEN, MÊME À JEUN</h1>
              <p className="text-amber-400 text-lg">Programme Ramadan Marche</p>
              <div className="flex flex-wrap justify-center gap-3 mt-4 text-sm">
                <span className="bg-white/10 px-3 py-1.5 rounded-full text-white/80">🚶 Marche rapide</span>
                <span className="bg-white/10 px-3 py-1.5 rounded-full text-white/80">⏱️ 30 min</span>
                <span className="bg-white/10 px-3 py-1.5 rounded-full text-white/80">📅 2-3x/semaine</span>
              </div>
            </div>

            <Card className="border-0 rules-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-amber-400" />
                  <span className="font-semibold text-amber-300">Respect du jeûne</span>
                </div>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" />Écoute ton corps</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" />Hydrate-toi bien</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" />Adapte l'intensité</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" />Pas de culpabilité</li>
                </ul>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Timer className="w-5 h-5 text-amber-400" />Choisis ta semaine
              </h2>
              
              {[1, 2, 3, 4].map((weekId) => (
                <Card key={weekId} className="cursor-pointer border-0 hover:scale-[1.02] transition-all overflow-hidden" onClick={() => { setSelectedWeekId(weekId); setViewMode("seances"); }}>
                  <div className={"p-4 text-white week-" + weekId}>
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
              ))}
            </div>

            <Card className="border-0 info-card">
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
}

export default ProgrammeRamadan;
