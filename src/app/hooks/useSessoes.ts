import { useState, useEffect, useCallback } from 'react';
import { getSessoes, createSessao, SessaoAPI, SessaoInput } from '../services/sessoes.service';

interface UseSessoesState {
  sessoes: SessaoAPI[];
  loading: boolean;
  error: string | null;
}

export function useSessoes() {
  const [state, setState] = useState<UseSessoesState>({
    sessoes: [],
    loading: true,
    error: null,
  });

  const fetchSessoes = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getSessoes();
      setState({ sessoes: data, loading: false, error: null });
    } catch (err: any) {
      setState({ sessoes: [], loading: false, error: err.message });
    }
  }, []);

  useEffect(() => {
    fetchSessoes();
  }, [fetchSessoes]);

  const handleCreate = async (data: SessaoInput) => {
    const nova = await createSessao(data);
    setState((prev) => ({ ...prev, sessoes: [nova, ...prev.sessoes] }));
    return nova;
  };

  return {
    ...state,
    refetch: fetchSessoes,
    createSessao: handleCreate,
  };
}
