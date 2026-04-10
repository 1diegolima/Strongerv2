import { useState } from "react";
import { useNavigate } from "react-router";
import { usePesos } from "../hooks/usePesos";
import { savePerfil } from "../services/perfil.service";
import { ChevronRight, ChevronLeft, ArrowRight, Loader2, Dumbbell } from "lucide-react";
import { toast } from "sonner";
import { createTreino } from "../services/treinos.service";

const OBJETIVO_OPTIONS = [
  "Hipertrofia",
  "Emagrecimento",
  "Força",
  "Resistência",
  "Condicionamento",
  "Manutenção",
];

const DIAS_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const { addPeso } = usePesos();

  const [formData, setFormData] = useState({
    nome: "",
    dataNascimento: "",
    sexo: "M" as "M" | "F",
    alturaCm: "",
    pesoAtual: "",
    objetivo: "Hipertrofia",
    treinoNome: "",
    treinoDia: "1", // Segunda
  });

  const nextStep = () => {
    if (step === 1) {
      if (!formData.nome.trim()) return toast.error("Informe seu nome para continuar");
      setStep(2);
    } else if (step === 2) {
      if (!formData.alturaCm || !formData.pesoAtual) return toast.error("Preencha peso e altura");
      setStep(3);
    }
  };

  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const handleFinish = async () => {
    if (!formData.treinoNome.trim()) return toast.error("Dê um nome para o seu primeiro treino");

    setLoading(true);
    try {
      // 1. Salvar/Atualizar Perfil (upsert — funciona mesmo se o perfil não existir)
      await savePerfil({
        nome: formData.nome,
        data_nascimento: formData.dataNascimento || undefined,
        altura_cm: parseInt(formData.alturaCm),
        sexo: formData.sexo,
        objetivo: formData.objetivo,
        peso_atual: parseFloat(formData.pesoAtual),
      });

      // 2. Registrar Peso Inicial no histórico
      await addPeso({
        peso_kg: parseFloat(formData.pesoAtual),
        observacao: "Peso Inicial",
      });

      // 3. Criar o Primeiro Treino
      const novoTreino = await createTreino({
        nome: formData.treinoNome,
        dia_semana: parseInt(formData.treinoDia),
      });

      toast.success("Tudo pronto! Bem-vindo ao Stronger 💪");

      // Redirecionar direto para adicionar exercícios no novo treino
      setTimeout(() => {
        window.location.href = `/workout/${novoTreino.id}`;
      }, 500);

    } catch (err: any) {
      toast.error(err.message || "Erro ao configurar aplicativo");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col p-6 items-center justify-center relative">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-amber-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Dumbbell className="text-black size-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Stronger</h1>
          <p className="text-zinc-400 text-sm">Vamos configurar seu perfil para começar.</p>
        </div>

        {/* Steps Progress */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className={`h-1.5 w-10 rounded-full ${step >= 1 ? 'bg-amber-500' : 'bg-zinc-800'}`} />
          <div className={`h-1.5 w-10 rounded-full ${step >= 2 ? 'bg-amber-500' : 'bg-zinc-800'}`} />
          <div className={`h-1.5 w-10 rounded-full ${step >= 3 ? 'bg-amber-500' : 'bg-zinc-800'}`} />
        </div>

        {/* Form Body */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6 shadow-xl">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-semibold text-white mb-2">Dados Básicos</h2>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Como devemos te chamar?</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Data de Nascimento (opcional)</label>
                <input
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Sexo biológico</label>
                <div className="flex gap-3">
                  <label className={`flex-1 border rounded-lg p-3 text-center cursor-pointer transition-colors ${formData.sexo === 'M' ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                    <input type="radio" value="M" checked={formData.sexo === 'M'} onChange={() => setFormData({...formData, sexo: 'M'})} className="hidden" />
                    Masculino
                  </label>
                  <label className={`flex-1 border rounded-lg p-3 text-center cursor-pointer transition-colors ${formData.sexo === 'F' ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                    <input type="radio" value="F" checked={formData.sexo === 'F'} onChange={() => setFormData({...formData, sexo: 'F'})} className="hidden" />
                    Feminino
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-semibold text-white mb-2">Composição Física</h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Altura (cm)</label>
                  <input
                    type="number"
                    placeholder="175"
                    value={formData.alturaCm}
                    onChange={(e) => setFormData({ ...formData, alturaCm: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 text-center text-lg font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    placeholder="70.5"
                    step="0.1"
                    value={formData.pesoAtual}
                    onChange={(e) => setFormData({ ...formData, pesoAtual: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 text-center text-lg font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Qual o seu foco principal?</label>
                <div className="grid grid-cols-2 gap-2">
                  {OBJETIVO_OPTIONS.map(obj => (
                    <button
                      key={obj}
                      onClick={() => setFormData({ ...formData, objetivo: obj })}
                      className={`py-2 px-1 text-xs rounded border transition-colors ${formData.objetivo === obj ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
                    >
                      {obj}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-semibold text-white mb-2">O Primeiro Treino</h2>
              <p className="text-zinc-400 text-sm mb-4">Para concluir, vamos criar a prancheta do seu primeiro dia de treino. Depois você poderá mapear os exercícios individualmente.</p>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Nome da Ficha</label>
                <input
                  type="text"
                  placeholder="Ex: Treino A - Peito, Ombro, Tríceps"
                  value={formData.treinoNome}
                  onChange={(e) => setFormData({ ...formData, treinoNome: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Dia da Semana Preferencial</label>
                <select
                  value={formData.treinoDia}
                  onChange={(e) => setFormData({ ...formData, treinoDia: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                >
                  {DIAS_SEMANA.map((dia, idx) => (
                    <option key={idx} value={String(idx)}>{dia}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={prevStep}
              disabled={loading}
              className="bg-zinc-800 hover:bg-zinc-700 text-white p-3.5 rounded-xl transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="size-5" />
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={nextStep}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-black py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              Próximo <ChevronRight className="size-5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-black py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
            >
              {loading ? <Loader2 className="size-5 animate-spin" /> : "Criar Perfil"}
              {!loading && <ArrowRight className="size-5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
