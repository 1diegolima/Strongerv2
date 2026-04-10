// Mock data management using localStorage

export interface Profile {
  id: string;
  name: string;
  birthDate: string;
  height: number; // cm
  sex: "M" | "F";
  goal: string;
  currentWeight?: number;
}

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
}

export interface PlannedSet {
  minReps: number;
  maxReps: number;
  targetLoad: number;
  restTime: number; // seconds
}

export interface WorkoutExercise {
  exerciseId: string;
  order: number;
  sets: PlannedSet[];
}

export interface Workout {
  id: string;
  name: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  exercises: WorkoutExercise[];
}

export interface ExecutedSet {
  reps: number;
  load: number;
  rir: number;
  isValid: boolean;
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  date: string;
  exercises: {
    exerciseId: string;
    sets: ExecutedSet[];
  }[];
  completed: boolean;
}

export interface Goal {
  id: string;
  type: "weight" | "load";
  target: number;
  exerciseId?: string;
  deadline?: string;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  imageUrl: string;
  notes?: string;
}

// Initialize default data
function initializeData() {
  if (!localStorage.getItem("strongerapp_profile")) {
    const defaultProfile: Profile = {
      id: "1",
      name: "Usuário",
      birthDate: "1990-01-01",
      height: 175,
      sex: "M",
      goal: "Hipertrofia",
      currentWeight: 75,
    };
    localStorage.setItem("strongerapp_profile", JSON.stringify(defaultProfile));
  }

  if (!localStorage.getItem("strongerapp_exercises")) {
    const defaultExercises: Exercise[] = [
      { id: "1", name: "Supino Reto", muscleGroup: "Peito" },
      { id: "2", name: "Supino Inclinado", muscleGroup: "Peito" },
      { id: "3", name: "Crucifixo", muscleGroup: "Peito" },
      { id: "4", name: "Puxada Frontal", muscleGroup: "Costas" },
      { id: "5", name: "Remada Curvada", muscleGroup: "Costas" },
      { id: "6", name: "Remada Sentada", muscleGroup: "Costas" },
      { id: "7", name: "Agachamento", muscleGroup: "Pernas" },
      { id: "8", name: "Leg Press", muscleGroup: "Pernas" },
      { id: "9", name: "Cadeira Extensora", muscleGroup: "Pernas" },
      { id: "10", name: "Rosca Direta", muscleGroup: "Bíceps" },
      { id: "11", name: "Rosca Martelo", muscleGroup: "Bíceps" },
      { id: "12", name: "Tríceps Testa", muscleGroup: "Tríceps" },
      { id: "13", name: "Desenvolvimento", muscleGroup: "Ombros" },
      { id: "14", name: "Elevação Lateral", muscleGroup: "Ombros" },
    ];
    localStorage.setItem("strongerapp_exercises", JSON.stringify(defaultExercises));
  }

  if (!localStorage.getItem("strongerapp_workouts")) {
    const defaultWorkouts: Workout[] = [
      {
        id: "1",
        name: "Peito",
        dayOfWeek: 1, // Monday
        exercises: [
          {
            exerciseId: "1",
            order: 1,
            sets: [
              { minReps: 8, maxReps: 10, targetLoad: 60, restTime: 90 },
              { minReps: 8, maxReps: 10, targetLoad: 60, restTime: 90 },
              { minReps: 8, maxReps: 10, targetLoad: 60, restTime: 90 },
            ],
          },
          {
            exerciseId: "2",
            order: 2,
            sets: [
              { minReps: 8, maxReps: 12, targetLoad: 50, restTime: 75 },
              { minReps: 8, maxReps: 12, targetLoad: 50, restTime: 75 },
              { minReps: 8, maxReps: 12, targetLoad: 50, restTime: 75 },
            ],
          },
          {
            exerciseId: "3",
            order: 3,
            sets: [
              { minReps: 10, maxReps: 15, targetLoad: 20, restTime: 60 },
              { minReps: 10, maxReps: 15, targetLoad: 20, restTime: 60 },
            ],
          },
        ],
      },
      {
        id: "2",
        name: "Costas",
        dayOfWeek: 2, // Tuesday
        exercises: [
          {
            exerciseId: "4",
            order: 1,
            sets: [
              { minReps: 8, maxReps: 10, targetLoad: 70, restTime: 90 },
              { minReps: 8, maxReps: 10, targetLoad: 70, restTime: 90 },
              { minReps: 8, maxReps: 10, targetLoad: 70, restTime: 90 },
            ],
          },
          {
            exerciseId: "5",
            order: 2,
            sets: [
              { minReps: 8, maxReps: 12, targetLoad: 50, restTime: 75 },
              { minReps: 8, maxReps: 12, targetLoad: 50, restTime: 75 },
            ],
          },
        ],
      },
      {
        id: "3",
        name: "Pernas",
        dayOfWeek: 3, // Wednesday
        exercises: [
          {
            exerciseId: "7",
            order: 1,
            sets: [
              { minReps: 8, maxReps: 12, targetLoad: 80, restTime: 120 },
              { minReps: 8, maxReps: 12, targetLoad: 80, restTime: 120 },
              { minReps: 8, maxReps: 12, targetLoad: 80, restTime: 120 },
            ],
          },
          {
            exerciseId: "8",
            order: 2,
            sets: [
              { minReps: 10, maxReps: 15, targetLoad: 120, restTime: 90 },
              { minReps: 10, maxReps: 15, targetLoad: 120, restTime: 90 },
            ],
          },
        ],
      },
      {
        id: "4",
        name: "Braços",
        dayOfWeek: 5, // Friday
        exercises: [
          {
            exerciseId: "10",
            order: 1,
            sets: [
              { minReps: 8, maxReps: 12, targetLoad: 15, restTime: 60 },
              { minReps: 8, maxReps: 12, targetLoad: 15, restTime: 60 },
              { minReps: 8, maxReps: 12, targetLoad: 15, restTime: 60 },
            ],
          },
          {
            exerciseId: "12",
            order: 2,
            sets: [
              { minReps: 8, maxReps: 12, targetLoad: 25, restTime: 60 },
              { minReps: 8, maxReps: 12, targetLoad: 25, restTime: 60 },
            ],
          },
        ],
      },
      {
        id: "5",
        name: "Ombros",
        dayOfWeek: 6, // Saturday
        exercises: [
          {
            exerciseId: "13",
            order: 1,
            sets: [
              { minReps: 8, maxReps: 10, targetLoad: 40, restTime: 75 },
              { minReps: 8, maxReps: 10, targetLoad: 40, restTime: 75 },
              { minReps: 8, maxReps: 10, targetLoad: 40, restTime: 75 },
            ],
          },
          {
            exerciseId: "14",
            order: 2,
            sets: [
              { minReps: 10, maxReps: 15, targetLoad: 10, restTime: 60 },
              { minReps: 10, maxReps: 15, targetLoad: 10, restTime: 60 },
            ],
          },
        ],
      },
    ];
    localStorage.setItem("strongerapp_workouts", JSON.stringify(defaultWorkouts));
  }

  if (!localStorage.getItem("strongerapp_weight_history")) {
    const weightHistory: WeightEntry[] = [
      { id: "1", date: "2026-03-10", weight: 76.5 },
      { id: "2", date: "2026-03-17", weight: 76.0 },
      { id: "3", date: "2026-03-24", weight: 75.8 },
      { id: "4", date: "2026-03-31", weight: 75.5 },
      { id: "5", date: "2026-04-07", weight: 75.0 },
    ];
    localStorage.setItem("strongerapp_weight_history", JSON.stringify(weightHistory));
  }

  if (!localStorage.getItem("strongerapp_sessions")) {
    localStorage.setItem("strongerapp_sessions", JSON.stringify([]));
  }

  if (!localStorage.getItem("strongerapp_goals")) {
    const goals: Goal[] = [
      { id: "1", type: "weight", target: 72 },
      { id: "2", type: "load", target: 80, exerciseId: "1" },
    ];
    localStorage.setItem("strongerapp_goals", JSON.stringify(goals));
  }

  if (!localStorage.getItem("strongerapp_photos")) {
    localStorage.setItem("strongerapp_photos", JSON.stringify([]));
  }
}

// Storage helpers
export const storage = {
  init: initializeData,

  getProfile: (): Profile => {
    const data = localStorage.getItem("strongerapp_profile");
    return data ? JSON.parse(data) : null;
  },

  updateProfile: (profile: Profile) => {
    localStorage.setItem("strongerapp_profile", JSON.stringify(profile));
  },

  getWeightHistory: (): WeightEntry[] => {
    const data = localStorage.getItem("strongerapp_weight_history");
    return data ? JSON.parse(data) : [];
  },

  addWeightEntry: (weight: number) => {
    const history = storage.getWeightHistory();
    const newEntry: WeightEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      weight,
    };
    history.push(newEntry);
    localStorage.setItem("strongerapp_weight_history", JSON.stringify(history));
    
    // Update current weight in profile
    const profile = storage.getProfile();
    if (profile) {
      profile.currentWeight = weight;
      storage.updateProfile(profile);
    }
  },

  getExercises: (): Exercise[] => {
    const data = localStorage.getItem("strongerapp_exercises");
    return data ? JSON.parse(data) : [];
  },

  getWorkouts: (): Workout[] => {
    const data = localStorage.getItem("strongerapp_workouts");
    return data ? JSON.parse(data) : [];
  },

  getWorkout: (id: string): Workout | undefined => {
    const workouts = storage.getWorkouts();
    return workouts.find((w) => w.id === id);
  },

  getSessions: (): WorkoutSession[] => {
    const data = localStorage.getItem("strongerapp_sessions");
    return data ? JSON.parse(data) : [];
  },

  addSession: (session: WorkoutSession) => {
    const sessions = storage.getSessions();
    sessions.push(session);
    localStorage.setItem("strongerapp_sessions", JSON.stringify(sessions));
  },

  getGoals: (): Goal[] => {
    const data = localStorage.getItem("strongerapp_goals");
    return data ? JSON.parse(data) : [];
  },

  addGoal: (goal: Omit<Goal, "id">) => {
    const goals = storage.getGoals();
    const newGoal: Goal = { ...goal, id: Date.now().toString() };
    goals.push(newGoal);
    localStorage.setItem("strongerapp_goals", JSON.stringify(goals));
  },

  getPhotos: (): ProgressPhoto[] => {
    const data = localStorage.getItem("strongerapp_photos");
    return data ? JSON.parse(data) : [];
  },

  addPhoto: (photo: Omit<ProgressPhoto, "id">) => {
    const photos = storage.getPhotos();
    const newPhoto: ProgressPhoto = { ...photo, id: Date.now().toString() };
    photos.push(newPhoto);
    localStorage.setItem("strongerapp_photos", JSON.stringify(photos));
  },
};
