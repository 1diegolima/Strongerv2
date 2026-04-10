import { useState } from "react";
import { usePerfil } from "../hooks/usePerfil";
import { usePesos } from "../hooks/usePesos";
import {
  User,
  Calendar,
  Ruler,
  Weight,
  Target,
  Camera,
  Plus,
  TrendingDown,
  Edit2,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { LoadingSpinner } from "../components/LoadingSpinner";

const OBJETIVO_OPTIONS = [
  "Hipertrofia",
  "Emagrecimento",
  "Força",
  "Resistência",
  "Condicionamento",
  "Manutenção",
];

export function ProfilePage() {
  const { perfil, loading: loadingPerfil, error: erroperfil, updatePerfil } = usePerfil();
  const { pesos, loading: loadingPesos, addPeso, pesoAtual } = usePesos();

  const [showWeightForm, setShowWeightForm] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [weightObs, setWeightObs] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    nome: "",
    data_nascimento: "",
    altura_cm: "",
    sexo: "M" as "M" | "F",
    objetivo: "",
  });

  const calculateIMC = (weight: number, height: number) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getIMCCategory = (imc: number) => {
    if (imc < 18.5) return { label: "Abaixo do peso", color: "text-blue-500" };
    if (imc < 25) return { label: "Peso normal", color: "text-emerald-500" };
    if (imc < 30) return { label: "Sobrepeso", color: "text-yellow-500" };
    return { label: "Obesidade", color: "text-red-500" };
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const safeFormatDate = (dateStr: any) => {
    if (!dateStr) return "—";
    try {
      // Handles both ISO strings and standard timestamps
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return format(d, "dd/MM/yyyy");
    } catch {
      return String(dateStr);
    }
  };

  const handleAddWeight = async () => {
    if (!newWeight || isNaN(parseFloat(newWeight))) {
      toast.error("Digite um peso válido");
      return;
    }
    setSavingWeight(true);
    try {
      await addPeso({ peso_kg: parseFloat(newWeight), observacao: weightObs || undefined });
      toast.success("Peso registrado com sucesso! 💪");
      setNewWeight("");
      setWeightObs("");
      setShowWeightForm(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao registrar peso");
    } finally {
      setSavingWeight(false);
    }
  };

  const handleStartEdit = () => {
    if (!perfil) return;
    setEditForm({
      nome: perfil.nome || "",
      data_nascimento: perfil.data_nascimento ? perfil.data_nascimento.split("T")[0] : "",
      altura_cm: perfil.altura_cm?.toString() || "",
      sexo: perfil.sexo || "M",
      objetivo: perfil.objetivo || "",
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!editForm.nome) {
      toast.error("O nome é obrigatório");
      return;
    }
    setSavingProfile(true);
    try {
      await updatePerfil(perfil!.id, {
        nome: editForm.nome,
        data_nascimento: editForm.data_nascimento || undefined,
        altura_cm: editForm.altura_cm ? parseInt(editForm.altura_cm) : undefined,
        sexo: editForm.sexo,
        objetivo: editForm.objetivo || undefined,
        peso_atual: pesoAtual || perfil?.peso_atual,
      });
      toast.success("Perfil atualizado com sucesso! ✅");
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar perfil");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loadingPerfil) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="lg" message="Carregando perfil..." />
      </div>
    );
  }

  if (erroperfil || !perfil) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-center p-4">
        <div>
          <p className="text-red-400 mb-2">Erro ao carregar perfil</p>
          <p className="text-zinc-500 text-sm">{erroperfil}</p>
          <p className="text-zinc-500 text-xs mt-2">Verifique se o servidor está rodando</p>
        </div>
      </div>
    );
  }

  const currentWeight = pesoAtual || parseFloat(String(perfil.peso_atual)) || 0;
  const imc = currentWeight && perfil.altura_cm
    ? parseFloat(calculateIMC(currentWeight, perfil.altura_cm))
    : 0;
  const imcCategory = getIMCCategory(imc);
  const age = perfil.data_nascimento ? calculateAge(perfil.data_nascimento) : null;

  return (
    <div className="min-h-screen bg-black p-4 max-w-lg mx-auto pb-6">
      <header className="mb-6 pt-2">
        <h1 className="text-3xl font-bold text-white mb-1">Perfil</h1>
        <p className="text-zinc-400">Seus dados e progresso</p>
      </header>

      {/* Profile Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
        {isEditing ? (
          /* Edit Form */
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white mb-3">Editar Perfil</h3>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Nome</label>
              <input
                type="text"
                value={editForm.nome}
                onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Nascimento</label>
                <input
                  type="date"
                  value={editForm.data_nascimento}
                  onChange={(e) => setEditForm({ ...editForm, data_nascimento: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Altura (cm)</label>
                <input
                  type="number"
                  value={editForm.altura_cm}
                  onChange={(e) => setEditForm({ ...editForm, altura_cm: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Sexo</label>
                <select
                  value={editForm.sexo}
                  onChange={(e) => setEditForm({ ...editForm, sexo: e.target.value as "M" | "F" })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Objetivo</label>
                <select
                  value={editForm.objetivo}
                  onChange={(e) => setEditForm({ ...editForm, objetivo: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  {OBJETIVO_OPTIONS.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
              >
                <X className="size-4" /> Cancelar
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg transition-colors text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {savingProfile ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                Salvar
              </button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-full w-16 h-16 flex items-center justify-center">
                <User className="size-8 text-amber-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white">{perfil.nome}</h2>
                <p className="text-sm text-zinc-400">
                  {age !== null ? `${age} anos` : ""}
                  {age !== null && perfil.sexo ? " • " : ""}
                  {perfil.sexo === "M" ? "Masculino" : perfil.sexo === "F" ? "Feminino" : ""}
                </p>
              </div>
              <button
                onClick={handleStartEdit}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <Edit2 className="size-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1 text-zinc-400">
                  <Ruler className="size-4" />
                  <span className="text-xs">Altura</span>
                </div>
                <div className="text-lg font-semibold text-white">
                  {perfil.altura_cm ? `${perfil.altura_cm} cm` : "—"}
                </div>
              </div>

              <div className="bg-zinc-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1 text-zinc-400">
                  <Target className="size-4" />
                  <span className="text-xs">Objetivo</span>
                </div>
                <div className="text-lg font-semibold text-white truncate">
                  {perfil.objetivo || "—"}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Weight & IMC Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Weight className="size-5 text-amber-500" />
            Peso e IMC
          </h3>
          <button
            onClick={() => setShowWeightForm(!showWeightForm)}
            className="text-amber-500 hover:text-amber-400 transition-colors"
          >
            <Plus className="size-5" />
          </button>
        </div>

        {showWeightForm && (
          <div className="bg-zinc-800/50 rounded-lg p-3 mb-4">
            <input
              type="number"
              step="0.1"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Peso (kg)"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white mb-2 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              value={weightObs}
              onChange={(e) => setWeightObs(e.target.value)}
              placeholder="Observação (opcional)"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white mb-2 focus:outline-none focus:border-amber-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowWeightForm(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddWeight}
                disabled={savingWeight}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg transition-colors text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {savingWeight ? <Loader2 className="size-4 animate-spin" /> : null}
                Adicionar
              </button>
            </div>
          </div>
        )}

        {loadingPesos ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-sm text-zinc-400 mb-1">Peso Atual</p>
                <p className="text-2xl font-bold text-white">
                  {currentWeight ? `${currentWeight} kg` : "—"}
                </p>
              </div>
              {imc > 0 && (
                <div>
                  <p className="text-sm text-zinc-400 mb-1">IMC</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-white">{imc}</p>
                    <span className={`text-xs font-medium ${imcCategory.color}`}>
                      {imcCategory.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {pesos.length > 1 && (
              <div className="space-y-1.5">
                <p className="text-xs text-zinc-400 mb-2">Histórico Recente</p>
                {[...pesos].reverse().slice(0, 5).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between text-sm bg-zinc-800/30 rounded px-3 py-1.5"
                  >
                    <span className="text-zinc-400">
                      {safeFormatDate(entry.data_registro)}
                    </span>
                    <span className="text-white font-medium">{parseFloat(entry.peso_kg)} kg</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Photos Card (visual placeholder) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Camera className="size-5 text-amber-500" />
            Fotos de Progresso
          </h3>
          <button className="text-amber-500 hover:text-amber-400 transition-colors">
            <Plus className="size-5" />
          </button>
        </div>

        <div className="text-center py-8 text-zinc-400">
          <Camera className="size-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhuma foto adicionada</p>
          <p className="text-xs mt-1">Registre sua evolução física</p>
        </div>
      </div>
    </div>
  );
}