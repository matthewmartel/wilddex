export interface SightingActionState {
  status: "idle" | "error" | "success";
  message: string | null;
}
