import { usePesos } from "../hooks/usePesos";
import { useSessoes } from "../hooks/useSessoes";
import { useTreinos } from "../hooks/useTreinos";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Weight, Activity, Calendar, Dumbbell } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { LoadingSpinner } from "../components/LoadingSpinner";

export function AnalyticsPage() {
  const { pesos, loading: loadingPesos, pesoAtual, pesoAnterior } = usePesos();
  const { sessoes, loading: loadingSessoes } = useSessoes();
  const { treinos } = useTreinos();
  const [selectedTreinoId, setSelectedTreinoId] = useState<string>("");

  const loading = loadingPesos || loadingSessoes;

  // Weight chart data
  const weightData = pesos.map((entry) => ({
    date: format(new Date(entry.data_registro.split("T")[0] + "T00:00:00"), "dd/MM"),
    peso: parseFloat(entry.peso_kg),
  }));

  // Weekly frequency data
  const getWeeklyFrequency = () => {
    const weeks: { [key: string]: number } = {};
    sessoes.forEach((session) => {
      const dateStr = session.data_sessao.split("T")[0];
      const date = new Date(dateStr + "T00:00:00");
      const weekKey = format(date, "dd/MM");
      weeks[weekKey] = (weeks[weekKey] || 0) + 1;
    });
    return Object.entries(weeks)
      .map(([data, treinos]) => ({ data, treinos }))
      .slice(-7);
  };

  const frequencyData = getWeeklyFrequency();

  // Load progression for selected Treino
  const getTreinoEvolution = (treinoId: string) => {
    const treino = treinos.find(t => String(t.id) === treinoId);
    if (!treino || !treino.exercicios) return [];

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return treino.exercicios.map((ex) => {
      const history = sessoes.map(session => {
        const exerciciosExec = session.exercicios_executados || [];
        const exExec = exerciciosExec.find((e: any) => String(e.exerciseId || e.exercicio_id) === String(ex.exercicioId));
        if (exExec) {
          const validSets = (exExec.sets || []).filter((s: any) => s.isValid);
          if (validSets.length > 0) {
             const maxLoad = Math.max(...validSets.map((s: any) => s.load));
             return { date: new Date(session.data_sessao), load: maxLoad };
          }
        }
        return null;
      }).filter(Boolean) as {date: Date, load: number}[];

      if (history.length === 0) {
        return { id: ex.id, nome: ex.exercicioNome, currentLoad: 0, oldLoad: 0, percentage: 0, hasData: false };
      }

      history.sort((a, b) => a.date.getTime() - b.date.getTime());

      const currentLoad = history[history.length - 1].load;
      const last30Days = history.filter(h => h.date >= thirtyDaysAgo);
      
      let oldLoad = currentLoad;
      if (last30Days.length > 1) {
         oldLoad = last30Days[0].load; 
      } else if (history.length > 1) {
         oldLoad = history[history.length - 2].load; 
      }

      const percentage = oldLoad > 0 ? ((currentLoad - oldLoad) / oldLoad) * 100 : 0;

      return {
        id: ex.id,
        nome: ex.exercicioNome,
        currentLoad,
        oldLoad,
        percentage,
        hasData: true
      };
    });
  };

  const evolutionData = selectedTreinoId ? getTreinoEvolution(selectedTreinoId) : [];

  // Stats
  const weightDiff = pesoAtual - pesoAnterior;
  const totalWorkouts = sessoes.length;
  const thisWeekWorkouts = sessoes.filter((s) => {
    const dateStr = s.data_sessao.split("T")[0];
    const date = new Date(dateStr);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo;
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="lg" message="Carregando análises..." />
      </div>
    );
  }

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
          <div className="text-2xl font-bold text-white">
            {pesoAtual ? `${pesoAtual}kg` : "—"}
          </div>
          {pesoAtual && pesoAnterior ? (
            <div
              className={`text-xs mt-1 ${
                weightDiff < 0 ? "text-amber-500" : "text-orange-500"
              }`}
            >
              {weightDiff > 0 ? "+" : ""}
              {weightDiff.toFixed(1)}kg
            </div>
          ) : null}
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
          Progressão de Carga (Mensal)
        </h3>

        <select
          value={selectedTreinoId}
          onChange={(e) => setSelectedTreinoId(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white mb-4 focus:outline-none focus:border-amber-500"
        >
          <option value="">Selecione um treino</option>
          {treinos.map((t) => (
            <option key={t.id} value={String(t.id)}>
              {t.nome}
            </option>
          ))}
        </select>

        {evolutionData.length > 0 ? (
          <div className="space-y-3">
             {evolutionData.map((ev) => (
                <div key={ev.id} className="bg-zinc-800/50 rounded-lg p-3 flex items-center justify-between">
                   <div className="flex-1 flex max-w-[50%]">
                      <p className="text-white font-medium text-sm truncate pr-2" title={ev.nome}>{ev.nome}</p>
                   </div>
                   {ev.hasData ? (
                     <div className="flex items-center gap-3">
                       <span className="text-base font-bold text-amber-500 min-w-[3rem] text-right">{ev.currentLoad}kg</span>
                       <div className={`px-2 py-1 rounded text-xs font-semibold w-14 text-center
                         ${ev.percentage > 0 ? 'bg-emerald-500/10 text-emerald-500' : 
                           ev.percentage < 0 ? 'bg-red-500/10 text-red-500' : 'bg-zinc-700 text-zinc-400'}`}>
                         {ev.percentage > 0 ? '+' : ''}{ev.percentage > 0 || ev.percentage < 0 ? ev.percentage.toFixed(0) : '0'}%
                       </div>
                     </div>
                   ) : (
                     <span className="text-xs text-zinc-500">Sem histórico</span>
                   )}
                </div>
             ))}
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-400">
            <p className="text-sm">
              {selectedTreinoId
                ? "Este treino não possui exercícios."
                : "Selecione um treino para ver a evolução das cargas."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}