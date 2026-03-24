import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: 'Neon Drive (AI Gen)',
    artist: 'SynthBot Alpha',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 2,
    title: 'Cyberpunk Nights (AI Gen)',
    artist: 'Neural Network Beats',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 3,
    title: 'Digital Horizon (AI Gen)',
    artist: 'Algorithm Groove',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
];

export function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((e) => {
            if (e.name !== 'AbortError') {
              console.error("Audio play failed:", e);
            }
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    const handleEnded = () => {
      handleNext();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = (clickX / rect.width) * 100;
    
    if (audioRef.current) {
      audioRef.current.currentTime = (newProgress / 100) * audioRef.current.duration;
      setProgress(newProgress);
    }
  };

  return (
    <div className="w-full max-w-md p-6 rounded-2xl bg-zinc-900/80 backdrop-blur-md border border-fuchsia-500/30 shadow-[0_0_30px_rgba(217,70,239,0.15)]">
      <audio ref={audioRef} src={currentTrack.url} preload="metadata" />
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-fuchsia-400 tracking-wider drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]">
            {currentTrack.title}
          </h3>
          <p className="text-sm text-fuchsia-200/60 uppercase tracking-widest mt-1">
            {currentTrack.artist}
          </p>
        </div>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.3)]">
          <div className={`w-4 h-4 rounded-full ${isPlaying ? 'bg-fuchsia-400 animate-pulse shadow-[0_0_10px_rgba(217,70,239,0.8)]' : 'bg-zinc-600'}`} />
        </div>
      </div>

      <div 
        className="h-2 w-full bg-zinc-800 rounded-full mb-6 cursor-pointer overflow-hidden border border-zinc-700"
        onClick={handleProgressClick}
      >
        <div 
          className="h-full bg-gradient-to-r from-fuchsia-600 to-fuchsia-400 relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button 
          onClick={toggleMute}
          className="p-2 text-zinc-400 hover:text-fuchsia-400 transition-colors"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        <div className="flex items-center gap-4">
          <button 
            onClick={handlePrev}
            className="p-3 rounded-full bg-zinc-800/50 text-fuchsia-400 hover:bg-fuchsia-500/20 hover:shadow-[0_0_15px_rgba(217,70,239,0.4)] transition-all border border-transparent hover:border-fuchsia-500/50"
          >
            <SkipBack size={24} fill="currentColor" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="p-4 rounded-full bg-fuchsia-500 text-zinc-950 hover:bg-fuchsia-400 hover:shadow-[0_0_25px_rgba(217,70,239,0.6)] transition-all transform hover:scale-105"
          >
            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>
          
          <button 
            onClick={handleNext}
            className="p-3 rounded-full bg-zinc-800/50 text-fuchsia-400 hover:bg-fuchsia-500/20 hover:shadow-[0_0_15px_rgba(217,70,239,0.4)] transition-all border border-transparent hover:border-fuchsia-500/50"
          >
            <SkipForward size={24} fill="currentColor" />
          </button>
        </div>

        <div className="w-9" /> {/* Spacer for balance */}
      </div>
    </div>
  );
}
