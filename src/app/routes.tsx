import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { WorkoutsPage } from "./pages/WorkoutsPage";
import { WorkoutDetailPage } from "./pages/WorkoutDetailPage";
import { ExecuteWorkoutPage } from "./pages/ExecuteWorkoutPage";
import { HistoryPage } from "./pages/HistoryPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { NotFound } from "./pages/NotFound";
import { OnboardingGuard } from "./components/OnboardingGuard";
import { OnboardingPage } from "./pages/OnboardingPage";

export const router = createBrowserRouter([
  {
    path: "/onboarding",
    Component: OnboardingPage,
  },
  {
    path: "/",
    element: (
      <OnboardingGuard>
        <RootLayout />
      </OnboardingGuard>
    ),
    children: [
      { index: true, Component: WorkoutsPage },
      { path: "workout/:id", Component: WorkoutDetailPage },
      { path: "execute/:id", Component: ExecuteWorkoutPage },
      { path: "history", Component: HistoryPage },
      { path: "profile", Component: ProfilePage },
      { path: "analytics", Component: AnalyticsPage },
      { path: "*", Component: NotFound },
    ],
  },
]);
