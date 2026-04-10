import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { storage, Workout, Exercise, ExecutedSet, WorkoutSession } from "../utils/storage";
import { ArrowLeft, Check, X, Timer, ChevronRight } from "lucide-react";
import { RestTimer } from "../components/RestTimer";

interface ExerciseExecution {
  exerciseId: string;
  exerciseName: string;
  plannedSets: number;
  completedSets: ExecutedSet[];
  currentSetIndex: number;
  isComplete: boolean;
}

export function ExecuteWorkoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [execution, setExecution] = useState<ExerciseExecution[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(60);

  // Form state for current set
  const [reps, setReps] = useState("");
  const [load, setLoad] = useState("");
  const [rir, setRir] = useState("");

  useEffect(() => {
    storage.init();
    if (id) {
      const w = storage.getWorkout(id);
      setWorkout(w || null);
      const exs = storage.getExercises();
      setExercises(exs);

      if (w) {
        // Initialize execution state
        const executionState = w.exercises
          .sort((a, b) => a.order - b.order)
          .map((we) => {
            const exercise = exs.find((e) => e.id === we.exerciseId);
            return {
              exerciseId: we.exerciseId,
              exerciseName: exercise?.name || "Exercício",
              plannedSets: we.sets.length,
              completedSets: [],
              currentSetIndex: 0,
              isComplete: false,
            };
          });
        setExecution(executionState);

        // Set initial load from plan
        if (w.exercises.length > 0 && w.exercises[0].sets.length > 0) {
          setLoad(w.exercises[0].sets[0].targetLoad.toString());
        }
      }
    }
  }, [id]);

  if (!workout || execution.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400">
        Carregando...
      </div>
    );
  }

  const currentExercise = execution[currentExerciseIndex];
  const workoutExercise = workout.exercises.find(
    (we) => we.exerciseId === currentExercise.exerciseId
  );
  const currentPlannedSet = workoutExercise?.sets[currentExercise.currentSetIndex];

  const isWorkoutComplete = execution.every((e) => e.isComplete);

  const handleCompleteSet = (isValid: boolean) => {
    if (!reps || !load) {
      alert("Preencha as repetições e carga");
      return;
    }

    const newSet: ExecutedSet = {
      reps: parseInt(reps),
      load: parseFloat(load),
      rir: rir ? parseInt(rir) : 0,
      isValid,
    };

    const newExecution = [...execution];
    newExecution[currentExerciseIndex].completedSets.push(newSet);
    newExecution[currentExerciseIndex].currentSetIndex += 1;

    if (
      newExecution[currentExerciseIndex].currentSetIndex >=
      newExecution[currentExerciseIndex].plannedSets
    ) {
      newExecution[currentExerciseIndex].isComplete = true;
    }

    setExecution(newExecution);
    setReps("");
    setRir("");

    // Start rest timer if not last set
    if (!newExecution[currentExerciseIndex].isComplete && currentPlannedSet) {
      setRestDuration(currentPlannedSet.restTime);
      setShowRestTimer(true);
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < execution.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      // Set load from next exercise plan
      const nextWorkoutExercise = workout.exercises[currentExerciseIndex + 1];
      if (nextWorkoutExercise?.sets[0]) {
        setLoad(nextWorkoutExercise.sets[0].targetLoad.toString());
      }
    }
  };

  const handleFinishWorkout = () => {
    const session: WorkoutSession = {
      id: Date.now().toString(),
      workoutId: workout.id,
      date: new Date().toISOString().split("T")[0],
      exercises: execution.map((e) => ({
        exerciseId: e.exerciseId,
        sets: e.completedSets,
      })),
      completed: true,
    };

    storage.addSession(session);
    navigate("/");
  };

  const totalSets = execution.reduce((acc, e) => acc + e.plannedSets, 0);
  const completedSetsCount = execution.reduce(
    (acc, e) => acc + e.completedSets.length,
    0
  );
  const progressPercentage = (completedSetsCount / totalSets) * 100;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => {
                if (confirm("Deseja realmente cancelar este treino?")) {
                  navigate(-1);
                }
              }}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="size-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-white">{workout.name}</h1>
              <p className="text-sm text-zinc-400">
                {completedSetsCount} / {totalSets} séries
              </p>
            </div>
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </header>

      {/* Exercise Navigation */}
      <div className="bg-zinc-900/50 border-b border-zinc-800 p-3 overflow-x-auto">
        <div className="max-w-lg mx-auto flex gap-2">
          {execution.map((ex, index) => (
            <button
              key={ex.exerciseId}
              onClick={() => setCurrentExerciseIndex(index)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                index === currentExerciseIndex
                  ? "bg-emerald-500 text-white"
                  : ex.isComplete
                  ? "bg-zinc-700 text-zinc-300"
                  : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {ex.isComplete && <Check className="inline size-3 mr-1" />}
              {index + 1}. {ex.exerciseName.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto p-4">
        {!isWorkoutComplete ? (
          <>
            {/* Current Exercise Info */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
              <h2 className="text-2xl font-bold text-white mb-2">
                {currentExercise.exerciseName}
              </h2>
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <span>
                  Série {currentExercise.currentSetIndex + 1} de{" "}
                  {currentExercise.plannedSets}
                </span>
                {currentPlannedSet && (
                  <>
                    <span>•</span>
                    <span>
                      {currentPlannedSet.minReps}-{currentPlannedSet.maxReps} reps
                    </span>
                    <span>•</span>
                    <span className="text-amber-500 font-medium">
                      {currentPlannedSet.targetLoad}kg
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Set Input Form */}
            {!currentExercise.isComplete && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Registrar Série
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Repetições
                    </label>
                    <input
                      type="number"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      placeholder={`${currentPlannedSet?.minReps}-${currentPlannedSet?.maxReps}`}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-lg text-center focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Carga (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={load}
                      onChange={(e) => setLoad(e.target.value)}
                      placeholder={currentPlannedSet?.targetLoad.toString()}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-lg text-center focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      RIR (opcional)
                    </label>
                    <input
                      type="number"
                      value={rir}
                      onChange={(e) => setRir(e.target.value)}
                      placeholder="0-4"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-lg text-center focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleCompleteSet(false)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <X className="size-5" />
                    Série Inválida
                  </button>
                  <button
                    onClick={() => handleCompleteSet(true)}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-black px-4 py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Check className="size-5" />
                    Série Válida
                  </button>
                </div>
              </div>
            )}

            {/* Completed Sets */}
            {currentExercise.completedSets.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Séries Completadas
                </h3>
                <div className="space-y-2">
                  {currentExercise.completedSets.map((set, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        set.isValid
                          ? "bg-amber-500/10 border border-amber-500/30"
                          : "bg-zinc-800/50 border border-zinc-700"
                      }`}
                    >
                      <span className="text-white font-medium">
                        Série {index + 1}
                      </span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-white">
                          {set.reps} reps × {set.load}kg
                        </span>
                        {set.rir > 0 && (
                          <span className="text-zinc-400">RIR {set.rir}</span>
                        )}
                        {set.isValid ? (
                          <Check className="size-4 text-amber-500" />
                        ) : (
                          <X className="size-4 text-zinc-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Exercise Button */}
            {currentExercise.isComplete && currentExerciseIndex < execution.length - 1 && (
              <button
                onClick={handleNextExercise}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black px-6 py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              >
                Próximo Exercício
                <ChevronRight className="size-5" />
              </button>
            )}
          </>
        ) : (
          /* Workout Complete */
          <div className="text-center py-12">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Check className="size-10 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Treino Completo!
            </h2>
            <p className="text-zinc-400 mb-6">
              Parabéns! Você completou todas as séries.
            </p>
            <button
              onClick={handleFinishWorkout}
              className="bg-amber-500 hover:bg-amber-600 text-black px-8 py-3.5 rounded-lg transition-colors font-medium"
            >
              Finalizar Treino
            </button>
          </div>
        )}
      </div>

      {/* Rest Timer Modal */}
      {showRestTimer && (
        <RestTimer
          duration={restDuration}
          onComplete={() => setShowRestTimer(false)}
          onSkip={() => setShowRestTimer(false)}
        />
      )}
    </div>
  );
}