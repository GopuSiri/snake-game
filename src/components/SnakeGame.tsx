import React, { useState, useEffect, useRef, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const INITIAL_SPEED = 70;

type Point = { x: number; y: number };

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [direction, setDirection] = useState<Point>({ x: 0, y: -1 });
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  // Use a ref for direction to prevent rapid double-key presses causing self-collision
  const directionRef = useRef(direction);
  const trailRef = useRef<Point[]>([]);

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      isOccupied = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
    }
    return newFood!;
  }, []);

  const resetGame = () => {
    const initialSnake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    setSnake(initialSnake);
    setDirection({ x: 0, y: -1 });
    directionRef.current = { x: 0, y: -1 };
    trailRef.current = [];
    setFood(generateFood(initialSnake));
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setHasStarted(true);
  };

  // Update trail
  useEffect(() => {
    if (gameOver || !hasStarted || isPaused) return;
    const tail = snake[snake.length - 1];
    if (tail) {
      trailRef.current.push({ ...tail });
      if (trailRef.current.length > 12) {
        trailRef.current.shift();
      }
    }
  }, [snake, gameOver, hasStarted, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && hasStarted && !gameOver) {
        setIsPaused((p) => !p);
        return;
      }

      if (!hasStarted || gameOver || isPaused) return;

      const currentDir = directionRef.current;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir.y !== 1) {
            setDirection({ x: 0, y: -1 });
            directionRef.current = { x: 0, y: -1 };
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir.y !== -1) {
            setDirection({ x: 0, y: 1 });
            directionRef.current = { x: 0, y: 1 };
          }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir.x !== 1) {
            setDirection({ x: -1, y: 0 });
            directionRef.current = { x: -1, y: 0 };
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir.x !== -1) {
            setDirection({ x: 1, y: 0 });
            directionRef.current = { x: 1, y: 0 };
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, gameOver, isPaused]);

  // Game Loop
  useEffect(() => {
    if (!hasStarted || gameOver || isPaused) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y,
        };

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop(); // Remove tail if no food eaten
        }

        return newSnake;
      });
    };

    // Increase speed slightly as score goes up, maxing out at 30ms
    const currentSpeed = Math.max(30, INITIAL_SPEED - Math.floor(score / 50) * 4);
    const gameInterval = setInterval(moveSnake, currentSpeed);

    return () => clearInterval(gameInterval);
  }, [hasStarted, gameOver, isPaused, food, score, generateFood]);

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#09090b'; // zinc-950
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid (optional, subtle)
    ctx.strokeStyle = '#27272a'; // zinc-800
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= CANVAS_SIZE; i += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }

    // Draw Food (Neon Pink)
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#f43f5e'; // rose-500
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      2 * Math.PI
    );
    ctx.fill();

    // Draw Trail
    trailRef.current.forEach((segment, index) => {
      const opacity = (index + 1) / trailRef.current.length * 0.4;
      const radius = (CELL_SIZE / 2 - 2) * ((index + 1) / trailRef.current.length);
      
      ctx.shadowBlur = 15 * opacity;
      ctx.shadowColor = '#22d3ee';
      ctx.fillStyle = `rgba(34, 211, 238, ${opacity})`;
      
      ctx.beginPath();
      ctx.arc(
        segment.x * CELL_SIZE + CELL_SIZE / 2,
        segment.y * CELL_SIZE + CELL_SIZE / 2,
        Math.max(1, radius),
        0,
        2 * Math.PI
      );
      ctx.fill();
    });

    // Draw Snake (Neon Cyan)
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      const opacity = isHead ? 1 : Math.max(0.3, 1 - (index / snake.length));
      
      if (isHead) {
        ctx.fillStyle = '#67e8f9'; // cyan-300
        ctx.shadowColor = '#67e8f9';
        ctx.shadowBlur = 20;
      } else {
        ctx.fillStyle = `rgba(34, 211, 238, ${opacity})`;
        ctx.shadowColor = `rgba(34, 211, 238, ${opacity})`;
        ctx.shadowBlur = 15 * opacity;
      }
      
      // Draw rounded rects for snake segments
      const x = segment.x * CELL_SIZE + 1;
      const y = segment.y * CELL_SIZE + 1;
      const size = CELL_SIZE - 2;
      const radius = 4;
      
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + size - radius, y);
      ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
      ctx.lineTo(x + size, y + size - radius);
      ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
      ctx.lineTo(x + radius, y + size);
      ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
    });

    // Reset shadow for text
    ctx.shadowBlur = 0;

  }, [snake, food]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex justify-between items-end mb-4 px-2">
        <div>
          <h2 className="text-3xl font-black text-cyan-400 tracking-widest drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] uppercase">
            Snake
          </h2>
          <p className="text-cyan-200/50 text-xs tracking-widest uppercase mt-1">
            Cyber Grid
          </p>
        </div>
        <div className="text-right">
          <p className="text-cyan-200/50 text-xs tracking-widest uppercase mb-1">Score</p>
          <p 
            className="text-6xl font-digital text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,1)] glitch-effect"
            data-text={score.toString().padStart(4, '0')}
          >
            {score.toString().padStart(4, '0')}
          </p>
        </div>
      </div>

      <div className="relative p-1 rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="bg-zinc-950 rounded-lg border border-cyan-500/30 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]"
        />

        {(!hasStarted || gameOver || isPaused) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm rounded-lg border border-cyan-500/50">
            <div className="text-center p-6">
              {gameOver ? (
                <>
                  <h3 
                    className="text-6xl font-glitch text-rose-500 mb-2 drop-shadow-[0_0_15px_rgba(244,63,94,1)] glitch-effect uppercase tracking-widest"
                    data-text="SYSTEM FAILURE"
                  >
                    SYSTEM FAILURE
                  </h3>
                  <p className="text-rose-200/70 mb-6 font-mono">Final Score: {score}</p>
                  <button
                    onClick={resetGame}
                    className="px-8 py-3 bg-rose-500/20 text-rose-400 border border-rose-500/50 rounded-full font-bold uppercase tracking-widest hover:bg-rose-500 hover:text-zinc-950 hover:shadow-[0_0_20px_rgba(244,63,94,0.6)] transition-all"
                  >
                    Reboot
                  </button>
                </>
              ) : !hasStarted ? (
                <>
                  <h3 className="text-3xl font-black text-cyan-400 mb-6 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] uppercase tracking-widest">
                    Ready?
                  </h3>
                  <button
                    onClick={resetGame}
                    className="px-8 py-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-full font-bold uppercase tracking-widest hover:bg-cyan-500 hover:text-zinc-950 hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] transition-all"
                  >
                    Initialize
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-3xl font-black text-amber-400 mb-6 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] uppercase tracking-widest">
                    Paused
                  </h3>
                  <button
                    onClick={() => setIsPaused(false)}
                    className="px-8 py-3 bg-amber-500/20 text-amber-400 border border-amber-500/50 rounded-full font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-zinc-950 hover:shadow-[0_0_20px_rgba(251,191,36,0.6)] transition-all"
                  >
                    Resume
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 flex gap-4 text-zinc-500 text-sm font-mono">
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-cyan-400/70">W A S D</kbd> to move
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-cyan-400/70">SPACE</kbd> to pause
        </span>
      </div>
    </div>
  );
}
