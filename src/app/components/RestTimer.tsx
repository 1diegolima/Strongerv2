import { useEffect, useState } from "react";
import { Timer, X, SkipForward } from "lucide-react";

interface RestTimerProps {
  duration: number; // seconds
  onComplete: () => void;
  onSkip: () => void;
}

export function RestTimer({ duration, onComplete, onSkip }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-amber-500">
            <Timer className="size-5" />
            <span className="font-semibold">Descanso</span>
          </div>
          <button
            onClick={onSkip}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="text-6xl font-bold text-white mb-2">
            {minutes.toString().padStart(2, "0")}:
            {seconds.toString().padStart(2, "0")}
          </div>
          <p className="text-zinc-400 text-sm">segundos restantes</p>
        </div>

        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-amber-500 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          onClick={onSkip}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <SkipForward className="size-5" />
          Pular Descanso
        </button>
      </div>
    </div>
  );
}