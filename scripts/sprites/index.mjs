import { sprites as northAmerica1 } from "./data/north-america-1.mjs";
import { sprites as northAmerica2 } from "./data/north-america-2.mjs";
import { sprites as northAmerica3 } from "./data/north-america-3.mjs";

export const sprites = [
  ...northAmerica1,
  ...northAmerica2,
  ...northAmerica3,
].sort((a, b) => a.dex - b.dex);
