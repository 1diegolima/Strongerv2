import { useEffect, useState } from "react";
import { storage, Profile, WeightEntry, Goal, ProgressPhoto } from "../utils/storage";
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
} from "lucide-react";
import { format } from "date-fns";

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoalWeight, setNewGoalWeight] = useState("");

  useEffect(() => {
    storage.init();
    setProfile(storage.getProfile());
    setGoals(storage.getGoals());
    setPhotos(storage.getPhotos());
    setWeightHistory(storage.getWeightHistory());
  }, []);

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

  const handleAddWeight = () => {
    if (newWeight) {
      storage.addWeightEntry(parseFloat(newWeight));
      setWeightHistory(storage.getWeightHistory());
      setProfile(storage.getProfile());
      setNewWeight("");
      setShowWeightForm(false);
    }
  };

  const handleAddGoal = () => {
    if (newGoalWeight) {
      storage.addGoal({
        type: "weight",
        target: parseFloat(newGoalWeight),
      });
      setGoals(storage.getGoals());
      setNewGoalWeight("");
      setShowGoalForm(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400">
        Carregando...
      </div>
    );
  }

  const currentWeight = profile.currentWeight || 0;
  const imc = currentWeight ? parseFloat(calculateIMC(currentWeight, profile.height)) : 0;
  const imcCategory = getIMCCategory(imc);
  const age = calculateAge(profile.birthDate);
  const weightGoal = goals.find((g) => g.type === "weight");
  const weightDiff = weightGoal ? currentWeight - weightGoal.target : 0;

  return (
    <div className="min-h-screen bg-black p-4 max-w-lg mx-auto pb-6">
      <header className="mb-6 pt-2">
        <h1 className="text-3xl font-bold text-white mb-1">Perfil</h1>
        <p className="text-zinc-400">Seus dados e progresso</p>
      </header>

      {/* Profile Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-full w-16 h-16 flex items-center justify-center">
            <User className="size-8 text-amber-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">{profile.name}</h2>
            <p className="text-sm text-zinc-400">{age} anos • {profile.sex === "M" ? "Masculino" : "Feminino"}</p>
          </div>
          <button className="text-zinc-400 hover:text-white transition-colors">
            <Edit2 className="size-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1 text-zinc-400">
              <Ruler className="size-4" />
              <span className="text-xs">Altura</span>
            </div>
            <div className="text-lg font-semibold text-white">{profile.height} cm</div>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1 text-zinc-400">
              <Target className="size-4" />
              <span className="text-xs">Objetivo</span>
            </div>
            <div className="text-lg font-semibold text-white truncate">{profile.goal}</div>
          </div>
        </div>
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
            <div className="flex gap-2">
              <button
                onClick={() => setShowWeightForm(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddWeight}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Adicionar
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-sm text-zinc-400 mb-1">Peso Atual</p>
            <p className="text-2xl font-bold text-white">{currentWeight} kg</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400 mb-1">IMC</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-white">{imc}</p>
              <span className={`text-xs font-medium ${imcCategory.color}`}>
                {imcCategory.label}
              </span>
            </div>
          </div>
        </div>

        {weightHistory.length > 1 && (
          <div className="space-y-1.5">
            <p className="text-xs text-zinc-400 mb-2">Histórico Recente</p>
            {weightHistory.slice(-5).reverse().map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between text-sm bg-zinc-800/30 rounded px-3 py-1.5"
              >
                <span className="text-zinc-400">
                  {format(new Date(entry.date + "T00:00:00"), "dd/MM/yyyy")}
                </span>
                <span className="text-white font-medium">{entry.weight} kg</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Goals Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="size-5 text-emerald-500" />
            Metas
          </h3>
          <button
            onClick={() => setShowGoalForm(!showGoalForm)}
            className="text-emerald-500 hover:text-emerald-400 transition-colors"
          >
            <Plus className="size-5" />
          </button>
        </div>

        {showGoalForm && (
          <div className="bg-zinc-800/50 rounded-lg p-3 mb-4">
            <input
              type="number"
              step="0.1"
              value={newGoalWeight}
              onChange={(e) => setNewGoalWeight(e.target.value)}
              placeholder="Meta de peso (kg)"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white mb-2 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowGoalForm(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddGoal}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Adicionar
              </button>
            </div>
          </div>
        )}

        {weightGoal && (
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">Meta de Peso</span>
              <span className="text-lg font-semibold text-amber-500">
                {weightGoal.target} kg
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingDown className="size-4 text-zinc-400" />
              <span className="text-zinc-400">
                Faltam{" "}
                <span className={weightDiff > 0 ? "text-orange-500" : "text-amber-500"}>
                  {Math.abs(weightDiff).toFixed(1)} kg
                </span>
              </span>
            </div>
            <div className="mt-3 w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all"
                style={{
                  width: `${Math.min(100, Math.max(0, ((weightGoal.target / currentWeight) * 100)))}%`,
                }}
              />
            </div>
          </div>
        )}

        {goals.length === 0 && !showGoalForm && (
          <p className="text-sm text-zinc-400 text-center py-4">
            Nenhuma meta definida
          </p>
        )}
      </div>

      {/* Photos Card */}
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

        {photos.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            <Camera className="size-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma foto adicionada</p>
            <p className="text-xs mt-1">Registre sua evolução física</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="aspect-square bg-zinc-800 rounded-lg overflow-hidden"
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.date}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}