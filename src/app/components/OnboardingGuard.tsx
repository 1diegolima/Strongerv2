import { ReactNode } from "react";
import { Navigate } from "react-router";
import { usePerfil } from "../hooks/usePerfil";
import { useTreinos } from "../hooks/useTreinos";
import { LoadingSpinner } from "./LoadingSpinner";

export function OnboardingGuard({ children }: { children: ReactNode }) {
  const { perfil, loading: loadingPerfil } = usePerfil();
  const { treinos, loading: loadingTreinos } = useTreinos();

  if (loadingPerfil || loadingTreinos) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="lg" message="Carregando seus dados..." />
      </div>
    );
  }

  const isProfileIncomplete = !perfil || !perfil.nome || !perfil.peso_atual;
  const hasNoWorkouts = !treinos || treinos.length === 0;

  if (isProfileIncomplete || hasNoWorkouts) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
