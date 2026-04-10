import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { getTreinoById, getExercicios, addExercicioAoTreino, removeExercicioDoTreino, updateExercicioDoTreino, reorderExerciciosAPI, TreinoAPI, ExercicioAPI } from "../services/treinos.service";
import { ArrowLeft, Play, Dumbbell, Plus, X, Check, Loader2, Trash2, Edit2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { PageLoading } from "../components/LoadingSpinner";

export function WorkoutDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<TreinoAPI | null>(null);
  const [availableExercicios, setAvailableExercicios] = useState<ExercicioAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [localExercicios, setLocalExercicios] = useState<any[]>([]);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingExercicioId, setEditingExercicioId] = useState<number | null>(null);
  const [formConfig, setFormConfig] = useState({
    exercicioId: "",
    series: "3",
    minReps: "8",
    maxReps: "12",
    targetLoad: "10",
    restTime: "60",
  });

  const fetchWorkout = async () => {
    if (!id) return;
    try {
      const [wData, exercisesData] = await Promise.all([
        getTreinoById(id),
        getExercicios(),
      ]);
      setWorkout(wData);
      setAvailableExercicios(exercisesData);
      if (wData && wData.exercicios) {
        setLocalExercicios([...wData.exercicios].sort((a, b) => a.ordem - b.ordem));
      }
    } catch (err) {
      setWorkout(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkout();
  }, [id]);

  const handleNumChange = (field: string, val: string) => {
    // Evitar leading zeros (ex: "020" -> "20") mas preserva "0" ou decimais "0.5"
    let sanitized = val;
    if (sanitized.length > 1 && sanitized.startsWith('0') && !sanitized.startsWith('0.')) {
      sanitized = sanitized.replace(/^0+/, '');
    }
    setFormConfig(prev => ({ ...prev, [field]: sanitized }));
  };

  const handleAddOrUpdateExercicio = async () => {
    if (!formConfig.exercicioId) {
      toast.error("Selecione um exercício");
      return;
    }
    setAdding(true);
    try {
      const seriesPlanejadas = Array.from({ length: Number(formConfig.series) || 1 }).map(() => ({
        minReps: Number(formConfig.minReps) || 0,
        maxReps: Number(formConfig.maxReps) || 0,
        targetLoad: Number(formConfig.targetLoad) || 0,
        restTime: Number(formConfig.restTime) || 0,
      }));

      if (editingExercicioId) {
         await updateExercicioDoTreino(id as string, editingExercicioId, seriesPlanejadas, Number(formConfig.exercicioId));
         toast.success("Exercício atualizado! 💪");
      } else {
         await addExercicioAoTreino(id as string, Number(formConfig.exercicioId), seriesPlanejadas);
         toast.success("Exercício adicionado! 💪");
      }
      setShowAddForm(false);
      setEditingExercicioId(null);
      setFormConfig({ exercicioId: "", series: "3", minReps: "8", maxReps: "12", targetLoad: "10", restTime: "60" });
      fetchWorkout(); // reload
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar exercício");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveExercicio = async (treinoExercicioId: number, nome: string) => {
    if (confirm(`Remover "${nome}" deste treino?`)) {
      try {
        await removeExercicioDoTreino(id as string, treinoExercicioId);
        toast.success("Exercício removido do treino");
        fetchWorkout();
      } catch (err: any) {
        toast.error(err.message || "Erro ao remover exercício");
      }
    }
  };

  const openAddForm = () => {
    setEditingExercicioId(null);
    setFormConfig({ exercicioId: "", series: "3", minReps: "8", maxReps: "12", targetLoad: "10", restTime: "60" });
    setShowAddForm(true);
  };

  const openEditForm = (ex: any) => {
    setEditingExercicioId(ex.id);
    const seriesLength = (ex.seriesPlanejadas || []).length;
    const firstSet = (ex.seriesPlanejadas || [])[0] || {};
    setFormConfig({
      exercicioId: String(ex.exercicioId),
      series: String(seriesLength > 0 ? seriesLength : 3),
      minReps: String(firstSet.minReps ?? 8),
      maxReps: String(firstSet.maxReps ?? 12),
      targetLoad: String(firstSet.targetLoad ?? 10),
      restTime: String(firstSet.restTime ?? 60),
    });
    setShowAddForm(true);
    // Role para o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleDragStart = (e: any, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
    // Pequeno truque para não esconder do DOM imediatamente, mas permitir que a "ghost image" seja gerada
    setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }, 0);
  };

  const handleDragEnter = (e: any, index: number) => {
    e.preventDefault(); 
    if (draggedIdx === null || draggedIdx === index) return;

    const newItems = [...localExercicios];
    const draggedItem = newItems.splice(draggedIdx, 1)[0];
    newItems.splice(index, 0, draggedItem);

    setDraggedIdx(index);
    setLocalExercicios(newItems);
  };

  const handleDragOver = (e: any) => {
    e.preventDefault(); // Apenas permite o drop, sem re-renderizar
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const handleDrop = async (e: any) => {
    e.preventDefault();
    if (draggedIdx === null) return;
    setDraggedIdx(null);
    try {
      const items = localExercicios.map((ex, idx) => ({ id: ex.id, ordem: idx + 1 }));
      await reorderExerciciosAPI(id as string, items);
      toast.success("Ordem salva com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao salvar ordem");
      fetchWorkout(); // reverte localmente se der erro
    }
  };

  if (loading) return <PageLoading message="Carregando treino..." />;

  if (!workout) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400">
        Treino não encontrado
      </div>
    );
  }

  const exercicios = workout.exercicios || [];

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
            <h1 className="text-xl font-semibold text-white">{workout.nome}</h1>
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

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Exercícios ({exercicios.length})
          </h2>
          <button
            onClick={openAddForm}
            className="text-amber-500 hover:text-amber-400 transition-colors bg-amber-500/10 p-1.5 rounded-full"
            title="Adicionar Exercício"
          >
            <Plus className="size-5" />
          </button>
        </div>

        {showAddForm && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
            <h3 className="text-md font-semibold text-white mb-3">
               {editingExercicioId ? "Editar Exercício" : "Novo Exercício"}
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Buscar Exercício *</label>
                <input
                  type="text"
                  list="exercicios-list"
                  placeholder="Digite para buscar..."
                  onChange={(e) => {
                    const match = availableExercicios.find(ex => ex.nome === e.target.value);
                    setFormConfig({ ...formConfig, exercicioId: match ? String(match.id) : "" });
                  }}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                />
                <datalist id="exercicios-list">
                  {availableExercicios.map(ex => (
                    <option key={ex.id} value={ex.nome}>
                      {ex.grupo_muscular}
                    </option>
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Séries</label>
                  <input
                    type="number"
                    value={formConfig.series}
                    onChange={(e) => handleNumChange('series', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Descanso (s)</label>
                  <input
                    type="number"
                    value={formConfig.restTime}
                    onChange={(e) => handleNumChange('restTime', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Min Reps</label>
                  <input
                    type="number"
                    value={formConfig.minReps}
                    onChange={(e) => handleNumChange('minReps', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Max Reps</label>
                  <input
                    type="number"
                    value={formConfig.maxReps}
                    onChange={(e) => handleNumChange('maxReps', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Carga (kg)</label>
                  <input
                    type="number"
                    value={formConfig.targetLoad}
                    onChange={(e) => handleNumChange('targetLoad', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <X className="size-4" /> Cancelar
                </button>
                <button
                  onClick={handleAddOrUpdateExercicio}
                  disabled={adding}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg transition-colors text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {adding ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {localExercicios.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <Dumbbell className="size-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum exercício cadastrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {localExercicios.map((workoutExercise, index) => (
                <div
                  key={workoutExercise.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDrop}
                  className={`bg-zinc-900 border border-zinc-800 rounded-lg p-4 transition-transform ${draggedIdx === index ? 'opacity-50 scale-95' : ''}`}
                >
                  <div className="flex items-start gap-2 mb-3">
                    <div className="text-zinc-600 hover:text-white cursor-grab active:cursor-grabbing mt-1" title="Arraste para reordenar">
                      <GripVertical className="size-5" />
                    </div>
                    <div className="bg-amber-500/10 text-amber-500 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">
                        {workoutExercise.exercicioNome}
                      </h3>
                      <p className="text-sm text-zinc-400">
                        {(workoutExercise.seriesPlanejadas || []).length} séries planejadas
                      </p>
                      {workoutExercise.grupoMuscular && (
                        <span className="text-xs text-zinc-500">
                          {workoutExercise.grupoMuscular}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditForm(workoutExercise)}
                        className="text-zinc-500 hover:text-amber-500 transition-colors p-1"
                        title="Editar Séries"
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveExercicio(workoutExercise.id, workoutExercise.exercicioNome)}
                        className="text-zinc-500 hover:text-red-500 transition-colors p-1"
                        title="Remover Exercício"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {(workoutExercise.seriesPlanejadas || []).map((set, setIndex) => (
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
        )}
      </div>
    </div>
  );
}