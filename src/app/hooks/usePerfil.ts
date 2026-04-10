import { useState, useEffect, useCallback } from 'react';
import { getPerfil, savePerfil, updatePerfil, PerfilAPI, PerfilInput } from '../services/perfil.service';

interface UsePerfilState {
  perfil: PerfilAPI | null;
  loading: boolean;
  error: string | null;
}

export function usePerfil() {
  const [state, setState] = useState<UsePerfilState>({
    perfil: null,
    loading: true,
    error: null,
  });

  const fetchPerfil = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getPerfil();
      setState({ perfil: data, loading: false, error: null });
    } catch (err: any) {
      setState({ perfil: null, loading: false, error: err.message });
    }
  }, []);

  useEffect(() => {
    fetchPerfil();
  }, [fetchPerfil]);

  const handleSave = async (data: PerfilInput) => {
    try {
      const updated = await savePerfil(data);
      setState((prev) => ({ ...prev, perfil: updated }));
      return updated;
    } catch (err: any) {
      throw err;
    }
  };

  const handleUpdate = async (id: number, data: PerfilInput) => {
    try {
      const updated = await updatePerfil(id, data);
      setState((prev) => ({ ...prev, perfil: updated }));
      return updated;
    } catch (err: any) {
      throw err;
    }
  };

  return {
    ...state,
    refetch: fetchPerfil,
    savePerfil: handleSave,
    updatePerfil: handleUpdate,
  };
}
