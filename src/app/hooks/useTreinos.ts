import { useState, useEffect, useCallback } from 'react';
import {
  getTreinos,
  getTreinoById,
  createTreino,
  updateTreino,
  deleteTreino,
  getExercicios,
  TreinoAPI,
  TreinoInput,
  ExercicioAPI,
} from '../services/treinos.service';

interface UseTreinosState {
  treinos: TreinoAPI[];
  exercicios: ExercicioAPI[];
  loading: boolean;
  error: string | null;
}

export function useTreinos() {
  const [state, setState] = useState<UseTreinosState>({
    treinos: [],
    exercicios: [],
    loading: true,
    error: null,
  });

  const fetchAll = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [treinosData, exerciciosData] = await Promise.all([
        getTreinos(),
        getExercicios(),
      ]);
      setState({ treinos: treinosData, exercicios: exerciciosData, loading: false, error: null });
    } catch (err: any) {
      setState((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleCreate = async (data: TreinoInput) => {
    const novo = await createTreino(data);
    setState((prev) => ({ ...prev, treinos: [...prev.treinos, novo] }));
    return novo;
  };

  const handleUpdate = async (id: number, data: TreinoInput) => {
    const updated = await updateTreino(id, data);
    setState((prev) => ({
      ...prev,
      treinos: prev.treinos.map((t) => (t.id === id ? updated : t)),
    }));
    return updated;
  };

  const handleDelete = async (id: number) => {
    await deleteTreino(id);
    setState((prev) => ({ ...prev, treinos: prev.treinos.filter((t) => t.id !== id) }));
  };

  const fetchById = async (id: string | number) => {
    return getTreinoById(id);
  };

  return {
    ...state,
    refetch: fetchAll,
    createTreino: handleCreate,
    updateTreino: handleUpdate,
    deleteTreino: handleDelete,
    getTreinoById: fetchById,
  };
}
