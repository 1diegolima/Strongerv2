import { useSessoes } from "../hooks/useSessoes";
import { useTreinos } from "../hooks/useTreinos";
import { Calendar, Dumbbell } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { LoadingSpinner } from "../components/LoadingSpinner";

export function HistoryPage() {
  const { sessoes, loading, error } = useSessoes();
  const { treinos, exercicios } = useTreinos();
  const [selectedSession, setSelectedSession] = useState<number | null>(null);

  const getWorkoutName = (treinoId: number) => {
    const treino = treinos.find((t) => t.id === treinoId);
    return treino?.nome || "Treino";
  };

  const getExerciseName = (exercicioId: string | number) => {
    const exercicio = exercicios.find((e) => e.id === Number(exercicioId));
    return exercicio?.nome || "Exercício";
  };

  const selectedSessionData = sessoes.find((s) => s.id === selectedSession);

  const getTotalVolume = (exerciciosExecutados: any[]) => {
    if (!exerciciosExecutados) return 0;
    return exerciciosExecutados.reduce((total: number, ex: any) => {
      return (
        total +
        (ex.sets || []).reduce((exTotal: number, set: any) => {
          return exTotal + (set.reps || 0) * (set.load || 0);
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

      {loading ? (
        <LoadingSpinner message="Carregando histórico..." />
      ) : error ? (
        <div className="text-center py-12 text-red-400">
          <p className="mb-1">Erro ao carregar histórico</p>
          <p className="text-zinc-500 text-sm">{error}</p>
        </div>
      ) : sessoes.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <Calendar className="size-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum treino registrado ainda</p>
          <p className="text-sm mt-2">Complete um treino para vê-lo aqui</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessoes.map((session) => {
            const dateStr = session.data_sessao.split("T")[0];
            const date = new Date(dateStr + "T00:00:00");
            const exerciciosExecutados = session.exercicios_executados || [];
            const totalSets = exerciciosExecutados.reduce(
              (acc: number, ex: any) => acc + (ex.sets?.length || 0),
              0
            );
            const validSets = exerciciosExecutados.reduce(
              (acc: number, ex: any) =>
                acc + (ex.sets || []).filter((s: any) => s.isValid).length,
              0
            );
            const volume = getTotalVolume(exerciciosExecutados);

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
                          {session.treino_nome || getWorkoutName(session.treino_id)}
                        </h3>
                      </div>
                      <p className="text-sm text-zinc-400">
                        {format(date, "dd 'de' MMMM 'de' yyyy")}
                      </p>
                    </div>
                    {session.completo && (
                      <div className="bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded text-xs font-medium">
                        Completo
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <span>{validSets} séries válidas</span>
                    <span>•</span>
                    <span>{volume.toFixed(0)} kg total</span>
                    {session.duracao_minutos && (
                      <>
                        <span>•</span>
                        <span>{session.duracao_minutos} min</span>
                      </>
                    )}
                  </div>
                </button>

                {selectedSession === session.id && selectedSessionData && (
                  <div className="bg-zinc-900/50 border border-zinc-800 border-t-0 rounded-b-lg p-4 -mt-2 space-y-3">
                    {(selectedSessionData.exercicios_executados || []).map(
                      (ex: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-zinc-800/50 rounded-lg p-3"
                        >
                          <h4 className="font-medium text-white mb-2">
                            {getExerciseName(ex.exerciseId || ex.exercicio_id)}
                          </h4>
                          <div className="space-y-1.5">
                            {(ex.sets || []).map((set: any, setIndex: number) => (
                              <div
                                key={setIndex}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-zinc-400">
                                  Série {setIndex + 1}
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
                      )
                    )}
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