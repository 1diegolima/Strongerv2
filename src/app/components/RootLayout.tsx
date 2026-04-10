import { Outlet, useLocation } from "react-router";
import { BottomNav } from "./BottomNav";

export function RootLayout() {
  const location = useLocation();
  
  // Hide bottom nav on execute page for better focus
  const hideNav = location.pathname.startsWith('/execute');

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
