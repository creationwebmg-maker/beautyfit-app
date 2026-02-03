import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { api, formatDuration } from "@/lib/utils";
import { toast } from "sonner";
import { 
  Play, 
  Pause, 
  ArrowLeft,
  Maximize,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Loader2,
  CheckCircle,
  Sparkles
} from "lucide-react";

const VideoPlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const videoRef = useRef(null);
  
  const [course, setCourse] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [courseId, token]);

  useEffect(() => {
    let timeout;
    if (playing) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [playing, showControls]);

  const fetchCourse = async () => {
    try {
      const courseData = await api.get(`/courses/${courseId}`);
      setCourse(courseData);
      
      if (token) {
        const accessData = await api.get(`/courses/${courseId}/access`, token);
        setHasAccess(accessData.has_access);
        
        if (!accessData.has_access) {
          toast.error("Tu n'as pas accès à ce cours");
          navigate(`/courses/${courseId}`);
        }
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / total) * 100);
      
      if (current >= total * 0.9 && !completed) {
        setCompleted(true);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressClick = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percent * videoRef.current.duration;
    }
  };

  const skip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (!course || !hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black" data-testid="video-player-page">
      {/* Completion Overlay */}
      {completed && !playing && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center animate-fade-in">
          <div className="bg-card p-8 rounded-2xl text-center max-w-md mx-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 
              className="text-2xl font-bold text-foreground mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Bravo 👏
            </h2>
            <p className="text-lg text-foreground/80 font-handwritten mb-6">
              Séance terminée, sois fière de toi !
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/dashboard")}
                className="w-full h-12 rounded-full bg-foreground text-background"
                data-testid="go-dashboard-btn"
              >
                Retour au tableau de bord
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCompleted(false);
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                  }
                }}
                className="w-full h-12 rounded-full"
                data-testid="replay-btn"
              >
                Revoir le cours
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Video Container */}
      <div 
        className="relative w-full h-screen"
        onMouseMove={() => setShowControls(true)}
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={course.video_url}
          poster={course.thumbnail_url}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => {
            setPlaying(false);
            setCompleted(true);
          }}
          data-testid="video-element"
        />

        {/* Top Bar */}
        <div 
          className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="text-white hover:bg-white/20"
              data-testid="back-btn"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </Button>
            <h1 className="text-white text-lg font-medium hidden md:block">
              {course.title}
            </h1>
            <div className="w-24" />
          </div>
        </div>

        {/* Center Play Button */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-12 h-12 text-white fill-white ml-2" />
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div 
          className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bar */}
          <div 
            className="w-full h-1 bg-white/30 rounded-full mb-4 cursor-pointer group"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-white rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={(e) => { e.stopPropagation(); skip(-10); }}
                className="text-white hover:text-white/80 transition-colors"
                data-testid="skip-back-btn"
              >
                <SkipBack className="w-6 h-6" />
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center"
                data-testid="play-pause-btn"
              >
                {playing ? (
                  <Pause className="w-6 h-6 text-black" />
                ) : (
                  <Play className="w-6 h-6 text-black fill-black ml-1" />
                )}
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); skip(10); }}
                className="text-white hover:text-white/80 transition-colors"
                data-testid="skip-forward-btn"
              >
                <SkipForward className="w-6 h-6" />
              </button>

              <button 
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                className="text-white hover:text-white/80 transition-colors"
                data-testid="mute-btn"
              >
                {muted ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </button>

              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
              className="text-white hover:text-white/80 transition-colors"
              data-testid="fullscreen-btn"
            >
              <Maximize className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
