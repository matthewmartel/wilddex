import type { SightingActionState } from "@/lib/sightings/types";

export const initialSightingActionState: SightingActionState = {
  status: "idle",
  message: null,
};
