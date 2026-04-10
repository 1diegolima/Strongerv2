import { useEffect, useState } from "react";
import { storage, WorkoutSession, WeightEntry, Exercise } from "../utils/storage";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Weight, Activity, Calendar } from "lucide-react";
import { format } from "date-fns";

export function AnalyticsPage() {
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>("");

  useEffect(() => {
    storage.init();
    setWeightHistory(storage.getWeightHistory());
    setSessions(storage.getSessions());
    const exs = storage.getExercises();
    setExercises(exs);
    if (exs.length > 0) {
      setSelectedExercise(exs[0].id);
    }
  }, []);

  // Weight chart data
  const weightData = weightHistory.map((entry) => ({
    date: format(new Date(entry.date + "T00:00:00"), "dd/MM"),
    peso: entry.weight,
  }));

  // Weekly frequency data
  const getWeeklyFrequency = () => {
    const weeks: { [key: string]: number } = {};
    sessions.forEach((session) => {
      const date = new Date(session.date + "T00:00:00");
      const weekKey = format(date, "dd/MM");
      weeks[weekKey] = (weeks[weekKey] || 0) + 1;
    });

    return Object.entries(weeks)
      .map(([date, count]) => ({ data: date, treinos: count }))
      .slice(-7);
  };

  const frequencyData = getWeeklyFrequency();

  // Load progression for selected exercise
  const getLoadProgression = (exerciseId: string) => {
    const progressionData: { [key: string]: number[] } = {};

    sessions.forEach((session) => {
      const exerciseData = session.exercises.find(
        (ex) => ex.exerciseId === exerciseId
      );
      if (exerciseData) {
        const validSets = exerciseData.sets.filter((s) => s.isValid);
        if (validSets.length > 0) {
          const maxLoad = Math.max(...validSets.map((s) => s.load));
          const date = format(new Date(session.date + "T00:00:00"), "dd/MM");
          if (!progressionData[date]) {
            progressionData[date] = [];
          }
          progressionData[date].push(maxLoad);
        }
      }
    });

    return Object.entries(progressionData).map(([date, loads]) => ({
      data: date,
      carga: Math.max(...loads),
    }));
  };

  const loadData = selectedExercise ? getLoadProgression(selectedExercise) : [];

  const selectedExerciseName =
    exercises.find((e) => e.id === selectedExercise)?.name || "";

  // Stats
  const currentWeight = weightHistory[weightHistory.length - 1]?.weight || 0;
  const previousWeight = weightHistory[weightHistory.length - 2]?.weight || currentWeight;
  const weightDiff = currentWeight - previousWeight;
  const totalWorkouts = sessions.length;
  const thisWeekWorkouts = sessions.filter((s) => {
    const date = new Date(s.date);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo;
  }).length;

  return (
    <div className="min-h-screen bg-black p-4 max-w-lg mx-auto">
      <header className="mb-6 pt-2">
        <h1 className="text-3xl font-bold text-white mb-1">Análise</h1>
        <p className="text-zinc-400">Acompanhe sua evolução</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2 text-zinc-400">
            <Weight className="size-4" />
            <span className="text-xs">Peso Atual</span>
          </div>
          <div className="text-2xl font-bold text-white">{currentWeight}kg</div>
          <div
            className={`text-xs mt-1 ${
              weightDiff < 0 ? "text-amber-500" : "text-orange-500"
            }`}
          >
            {weightDiff > 0 ? "+" : ""}
            {weightDiff.toFixed(1)}kg
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2 text-zinc-400">
            <Activity className="size-4" />
            <span className="text-xs">Esta Semana</span>
          </div>
          <div className="text-2xl font-bold text-white">{thisWeekWorkouts}</div>
          <div className="text-xs text-zinc-400 mt-1">treinos</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2 text-zinc-400">
            <Calendar className="size-4" />
            <span className="text-xs">Total</span>
          </div>
          <div className="text-2xl font-bold text-white">{totalWorkouts}</div>
          <div className="text-xs text-zinc-400 mt-1">treinos</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2 text-zinc-400">
            <TrendingUp className="size-4" />
            <span className="text-xs">Consistência</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {totalWorkouts > 0 ? Math.round((thisWeekWorkouts / 7) * 100) : 0}%
          </div>
          <div className="text-xs text-zinc-400 mt-1">semanal</div>
        </div>
      </div>

      {/* Weight Chart */}
      {weightData.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Weight className="size-5 text-amber-500" />
            Evolução de Peso
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weightData}>
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} domain={["dataMin - 1", "dataMax + 1"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#a1a1aa" }}
              />
              <Area
                type="monotone"
                dataKey="peso"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#weightGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Frequency Chart */}
      {frequencyData.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="size-5 text-amber-500" />
            Frequência de Treino
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={frequencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="data" stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#a1a1aa" }}
              />
              <Bar dataKey="treinos" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Load Progression Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="size-5 text-amber-500" />
          Progressão de Carga
        </h3>

        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white mb-4 focus:outline-none focus:border-amber-500"
        >
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>

        {loadData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={loadData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="data" stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#a1a1aa" }}
              />
              <Line
                type="monotone"
                dataKey="carga"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: "#f59e0b", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-zinc-400">
            <p className="text-sm">Nenhum dado disponível para este exercício</p>
          </div>
        )}
      </div>
    </div>
  );
}