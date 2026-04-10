import { useState, useEffect, useCallback } from 'react';
import { getPesos, addPeso, deletePeso, PesoAPI, PesoInput } from '../services/pesos.service';

interface UsePesosState {
  pesos: PesoAPI[];
  loading: boolean;
  error: string | null;
}

export function usePesos() {
  const [state, setState] = useState<UsePesosState>({
    pesos: [],
    loading: true,
    error: null,
  });

  const fetchPesos = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getPesos();
      setState({ pesos: data, loading: false, error: null });
    } catch (err: any) {
      setState({ pesos: [], loading: false, error: err.message });
    }
  }, []);

  useEffect(() => {
    fetchPesos();
  }, [fetchPesos]);

  const handleAdd = async (data: PesoInput) => {
    const novo = await addPeso(data);
    setState((prev) => ({ ...prev, pesos: [...prev.pesos, novo] }));
    return novo;
  };

  const handleDelete = async (id: number) => {
    await deletePeso(id);
    setState((prev) => ({ ...prev, pesos: prev.pesos.filter((p) => p.id !== id) }));
  };

  return {
    ...state,
    refetch: fetchPesos,
    addPeso: handleAdd,
    deletePeso: handleDelete,
    // Helpers
    pesoAtual: state.pesos.length > 0 ? parseFloat(state.pesos[state.pesos.length - 1].peso_kg) : 0,
    pesoAnterior: state.pesos.length > 1 ? parseFloat(state.pesos[state.pesos.length - 2].peso_kg) : 0,
  };
}
