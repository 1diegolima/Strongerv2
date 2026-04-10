import { useEffect, useState } from "react";
import { Link } from "react-router";
import { storage, Workout } from "../utils/storage";
import { Dumbbell, Play, CheckCircle2 } from "lucide-react";

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    storage.init();
    setWorkouts(storage.getWorkouts());
    setSessions(storage.getSessions());
  }, []);

  const getWorkoutStatus = (workoutId: string) => {
    const today = new Date().toISOString().split("T")[0];
    return sessions.some(
      (s) => s.workoutId === workoutId && s.date === today && s.completed
    );
  };

  const currentDayOfWeek = new Date().getDay();

  return (
    <div className="min-h-screen bg-black p-4 max-w-lg mx-auto">
      <header className="mb-6 pt-2">
        <h1 className="text-3xl font-bold text-white mb-1">🦇</h1>
        <p className="text-zinc-400">Seus treinos da semana</p>
      </header>

      <div className="space-y-3">
        {workouts.map((workout) => {
          const isDone = getWorkoutStatus(workout.id);
          const isToday = workout.dayOfWeek === currentDayOfWeek;

          return (
            <div
              key={workout.id}
              className={`bg-zinc-900 border rounded-lg overflow-hidden transition-all ${
                isToday
                  ? "border-amber-500 shadow-lg shadow-amber-500/20"
                  : "border-zinc-800"
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Dumbbell className="size-5 text-amber-500" />
                      <h2 className="text-xl font-semibold text-white">
                        {workout.name}
                      </h2>
                    </div>
                    <p className="text-sm text-zinc-400">
                      {daysOfWeek[workout.dayOfWeek]}
                      {isToday && (
                        <span className="ml-2 text-amber-500 font-medium">
                          • Hoje
                        </span>
                      )}
                    </p>
                  </div>

                  {isDone && (
                    <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full">
                      <CheckCircle2 className="size-4" />
                      <span className="text-sm font-medium">Feito</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/workout/${workout.id}`}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-lg transition-colors text-center text-sm font-medium"
                  >
                    Ver Detalhes
                  </Link>
                  <Link
                    to={`/execute/${workout.id}`}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Play className="size-4" />
                    Iniciar
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {workouts.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          <Dumbbell className="size-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum treino cadastrado</p>
        </div>
      )}
    </div>
  );
}