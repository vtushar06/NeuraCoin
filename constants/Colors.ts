export const Colors = {
  primary: "#6366F1",
  secondary: "#8B5CF6",
  accent: "#06D6A0",
  background: "#0F0F23",
  card: "#1A1A2E",
  border: "#16213E",
  text: "#FFFFFF",
  textSecondary: "#A0AEC0",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
};

export const Gradients = {
  primary: ["#6366F1", "#8B5CF6"] as const,
  success: ["#10B981", "#06D6A0"] as const,
  warning: ["#F59E0B", "#FCD34D"] as const,
  card: ["#1A1A2E", "#16213E"] as const,
} as const;
