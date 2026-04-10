import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { storage, Workout, Exercise } from "../utils/storage";
import { ArrowLeft, Play, Dumbbell } from "lucide-react";

export function WorkoutDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    storage.init();
    if (id) {
      const w = storage.getWorkout(id);
      setWorkout(w || null);
      setExercises(storage.getExercises());
    }
  }, [id]);

  if (!workout) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400">
        Treino não encontrado
      </div>
    );
  }

  const getExerciseName = (exerciseId: string) => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    return exercise?.name || "Exercício";
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">{workout.name}</h1>
            <p className="text-sm text-zinc-400">Planejamento do treino</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 pb-6">
        <div className="mb-6">
          <Link
            to={`/execute/${workout.id}`}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black px-6 py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Play className="size-5" />
            Iniciar Treino
          </Link>
        </div>

        <h2 className="text-lg font-semibold text-white mb-4">
          Exercícios ({workout.exercises.length})
        </h2>

        <div className="space-y-3">
          {workout.exercises
            .sort((a, b) => a.order - b.order)
            .map((workoutExercise, index) => (
              <div
                key={workoutExercise.exerciseId}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-amber-500/10 text-amber-500 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">
                      {getExerciseName(workoutExercise.exerciseId)}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      {workoutExercise.sets.length} séries planejadas
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {workoutExercise.sets.map((set, setIndex) => (
                    <div
                      key={setIndex}
                      className="bg-zinc-800/50 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-400 text-sm font-medium">
                          Série {setIndex + 1}
                        </span>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-white font-medium">
                            {set.minReps}-{set.maxReps}
                          </span>
                          <span className="text-zinc-500">reps</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-amber-500 font-semibold">
                            {set.targetLoad}kg
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <span>{set.restTime}s</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}