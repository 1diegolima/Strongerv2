import { Link } from "react-router";
import { Home } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-zinc-400 mb-6">Página não encontrada</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-6 py-3 rounded-lg transition-colors"
        >
          <Home className="size-5" />
          Voltar para Home
        </Link>
      </div>
    </div>
  );
}