import { Link, useLocation } from "react-router";
import { Dumbbell, History, BarChart3, User } from "lucide-react";

export function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Dumbbell, label: "Treinos" },
    { path: "/history", icon: History, label: "Histórico" },
    { path: "/analytics", icon: BarChart3, label: "Análise" },
    { path: "/profile", icon: User, label: "Perfil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? "text-amber-500"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className="size-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}