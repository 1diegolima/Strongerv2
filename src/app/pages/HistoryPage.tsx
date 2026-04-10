import { useEffect, useState } from "react";
import { storage, WorkoutSession, Workout, Exercise } from "../utils/storage";
import { Calendar, Dumbbell, TrendingUp, Filter } from "lucide-react";
import { format } from "date-fns";

export function HistoryPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    storage.init();
    setSessions(storage.getSessions().sort((a, b) => b.date.localeCompare(a.date)));
    setWorkouts(storage.getWorkouts());
    setExercises(storage.getExercises());
  }, []);

  const getWorkoutName = (workoutId: string) => {
    const workout = workouts.find((w) => w.id === workoutId);
    return workout?.name || "Treino";
  };

  const getExerciseName = (exerciseId: string) => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    return exercise?.name || "Exercício";
  };

  const selectedSessionData = sessions.find((s) => s.id === selectedSession);

  const getTotalVolume = (session: WorkoutSession) => {
    return session.exercises.reduce((total, ex) => {
      return (
        total +
        ex.sets.reduce((exTotal, set) => {
          return exTotal + set.reps * set.load;
        }, 0)
      );
    }, 0);
  };

  return (
    <div className="min-h-screen bg-black p-4 max-w-lg mx-auto">
      <header className="mb-6 pt-2">
        <h1 className="text-3xl font-bold text-white mb-1">Histórico</h1>
        <p className="text-zinc-400">Seus treinos realizados</p>
      </header>

      {sessions.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <Calendar className="size-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum treino registrado ainda</p>
          <p className="text-sm mt-2">Complete um treino para vê-lo aqui</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const date = new Date(session.date + "T00:00:00");
            const totalSets = session.exercises.reduce(
              (acc, ex) => acc + ex.sets.length,
              0
            );
            const validSets = session.exercises.reduce(
              (acc, ex) => acc + ex.sets.filter((s) => s.isValid).length,
              0
            );
            const volume = getTotalVolume(session);

            return (
              <div key={session.id}>
                <button
                  onClick={() =>
                    setSelectedSession(
                      selectedSession === session.id ? null : session.id
                    )
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors text-left"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Dumbbell className="size-5 text-amber-500" />
                        <h3 className="font-semibold text-white">
                          {getWorkoutName(session.workoutId)}
                        </h3>
                      </div>
                      <p className="text-sm text-zinc-400">
                        {format(date, "dd 'de' MMMM 'de' yyyy")}
                      </p>
                    </div>
                    {session.completed && (
                      <div className="bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded text-xs font-medium">
                        Completo
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <span>{validSets} séries válidas</span>
                    <span>•</span>
                    <span>{volume.toFixed(0)} kg total</span>
                  </div>
                </button>

                {selectedSession === session.id && selectedSessionData && (
                  <div className="bg-zinc-900/50 border border-zinc-800 border-t-0 rounded-b-lg p-4 -mt-2 space-y-3">
                    {selectedSessionData.exercises.map((ex) => (
                      <div
                        key={ex.exerciseId}
                        className="bg-zinc-800/50 rounded-lg p-3"
                      >
                        <h4 className="font-medium text-white mb-2">
                          {getExerciseName(ex.exerciseId)}
                        </h4>
                        <div className="space-y-1.5">
                          {ex.sets.map((set, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-zinc-400">
                                Série {index + 1}
                              </span>
                              <div className="flex items-center gap-3">
                                <span className="text-white">
                                  {set.reps} reps × {set.load}kg
                                </span>
                                {set.rir > 0 && (
                                  <span className="text-zinc-500">
                                    RIR {set.rir}
                                  </span>
                                )}
                                <span
                                  className={
                                    set.isValid
                                      ? "text-amber-500"
                                      : "text-zinc-500"
                                  }
                                >
                                  {set.isValid ? "✓" : "✗"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}