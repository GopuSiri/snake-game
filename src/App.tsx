/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MusicPlayer } from './components/MusicPlayer';
import { SnakeGame } from './components/SnakeGame';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[120px]" />
        
        {/* Subtle Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: 'linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
        
        {/* Left/Top: Snake Game */}
        <div className="flex-1 flex justify-center lg:justify-end w-full">
          <SnakeGame />
        </div>

        {/* Right/Bottom: Music Player */}
        <div className="flex-1 flex justify-center lg:justify-start w-full">
          <div className="flex flex-col items-center gap-8">
            <div className="text-center mb-4">
              <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 tracking-tighter drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]">
                NEON SYNTH
              </h1>
              <p className="text-zinc-400 font-mono text-sm tracking-widest uppercase mt-2">
                Interactive Audio Experience
              </p>
            </div>
            
            <MusicPlayer />
          </div>
        </div>

      </div>
    </div>
  );
}

