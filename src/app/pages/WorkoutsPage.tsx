import { useState } from "react";
import { Link } from "react-router";
import { useTreinos } from "../hooks/useTreinos";
import { useSessoes } from "../hooks/useSessoes";
import { Dumbbell, Play, CheckCircle2, Plus, X, Loader2, Trash2, Flame } from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "../components/LoadingSpinner";

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const daysOfWeekFull = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export function WorkoutsPage() {
  const { treinos, loading, error, createTreino, deleteTreino } = useTreinos();
  const { sessoes } = useSessoes();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    dia_semana: new Date().getDay(),
    observacoes: "",
  });

  const getWorkoutStatus = (workoutId: number) => {
    const today = new Date().toISOString().split("T")[0];
    return sessoes.some(
      (s) =>
        s.treino_id === workoutId &&
        s.data_sessao.split("T")[0] === today &&
        s.completo
    );
  };

  const currentDayOfWeek = new Date().getDay();

  const handleCreate = async () => {
    if (!form.nome.trim()) {
      toast.error("Digite um nome para o treino");
      return;
    }
    setCreating(true);
    try {
      await createTreino({
        nome: form.nome,
        dia_semana: form.dia_semana,
        observacoes: form.observacoes || undefined,
      });
      toast.success(`Treino "${form.nome}" criado! 💪`);
      setForm({ nome: "", dia_semana: new Date().getDay(), observacoes: "" });
      setShowCreateForm(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar treino");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number, nome: string) => {
    if (confirm(`Tem certeza que deseja remover o treino "${nome}"?`)) {
      try {
        await deleteTreino(id);
        toast.success("Treino removido com sucesso");
      } catch (err: any) {
        toast.error(err.message || "Erro ao remover treino");
      }
    }
  };

  const getWeeklyStreak = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - currentDay);

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const hasSession = sessoes.some(
        (s) => s.data_sessao.split("T")[0] === dateStr && s.completo
      );

      return {
        label: daysOfWeek[i][0], // D, S, T, etc.
        isToday: i === currentDay,
        hasSession,
      };
    });
  };

  const streakDays = getWeeklyStreak();

  return (
    <div className="min-h-screen bg-black p-4 max-w-lg mx-auto">
      <header className="mb-6 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">🦇</h1>
            <p className="text-zinc-400">Seus treinos da semana</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-amber-500 hover:bg-amber-600 text-black p-2 rounded-full transition-colors"
            title="Novo treino"
          >
            <Plus className="size-5" />
          </button>
        </div>
      </header>

      {/* Weekly Streak Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500/20 p-2 rounded-full">
            <Flame className="size-5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Sua Semana</p>
            <p className="text-xs text-zinc-400">Streak de treinos</p>
          </div>
        </div>
        <div className="flex gap-1">
          {streakDays.map((day, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center justify-center w-8 h-10 rounded-lg border ${
                day.hasSession
                  ? "bg-amber-500/20 border-amber-500/50"
                  : day.isToday
                  ? "bg-zinc-800 border-zinc-600"
                  : "bg-zinc-800 border-zinc-800"
              }`}
            >
              <span
                className={`text-[10px] font-medium ${
                  day.hasSession ? "text-amber-500" : "text-zinc-500"
                }`}
              >
                {day.label}
              </span>
              <div
                className={`size-2 rounded-full mt-1 ${
                  day.hasSession ? "bg-amber-500" : "bg-zinc-700"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Create Workout Form */}
      {showCreateForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-white mb-3">Novo Treino</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Nome do Treino *</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Peito e Tríceps"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Dia da Semana</label>
              <select
                value={form.dia_semana}
                onChange={(e) => setForm({ ...form, dia_semana: parseInt(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
              >
                {daysOfWeekFull.map((day, index) => (
                  <option key={index} value={index}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Observações</label>
              <input
                type="text"
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                placeholder="Opcional"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
              >
                <X className="size-4" /> Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2.5 rounded-lg transition-colors text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Carregando treinos..." />
      ) : error ? (
        <div className="text-center py-12 text-red-400">
          <p className="mb-1">Erro ao carregar treinos</p>
          <p className="text-zinc-500 text-sm">{error}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {treinos.map((workout) => {
            const isDone = getWorkoutStatus(workout.id);
            const isToday = workout.dia_semana === currentDayOfWeek;

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
                          {workout.nome}
                        </h2>
                      </div>
                      <p className="text-sm text-zinc-400">
                        {daysOfWeek[workout.dia_semana]}
                        {isToday && (
                          <span className="ml-2 text-amber-500 font-medium">
                            • Hoje
                          </span>
                        )}
                      </p>
                      {workout.observacoes && (
                        <p className="text-xs text-zinc-500 mt-1">{workout.observacoes}</p>
                      )}
                    </div>

                    {isDone && (
                      <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-sm font-medium">
                        <CheckCircle2 className="size-4" />
                        <span>Feito</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleDelete(workout.id, workout.nome)}
                      className="text-zinc-500 hover:text-red-500 transition-colors ml-2"
                      title="Excluir treino"
                    >
                      <Trash2 className="size-4" />
                    </button>
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
      )}

      {!loading && !error && treinos.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          <Dumbbell className="size-12 mx-auto mb-3 opacity-50" />
          <p className="mb-2">Nenhum treino cadastrado</p>
          <p className="text-sm">Clique no + para criar seu primeiro treino</p>
        </div>
      )}
    </div>
  );
}