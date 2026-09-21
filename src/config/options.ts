export type DoorPosition = "front" | "left" | "right";
export type DoorSizeMode = "recommended" | "custom";
export type EngravingMode = "none" | "yes";
export type FloorType = "standard" | "removable";
export type CushionType = "none" | "add";
export type TopType = "standard" | "storage";

export interface OptionChoice {
  doorPosition: DoorPosition;
  doorSizeMode: DoorSizeMode;
  doorCustomWidth: number;
  doorCustomHeight: number;
  engraving: EngravingMode;
  engravingText: string;
  floor: FloorType;
  cushion: CushionType;
  top: TopType;
}

export const OPTION_PRICES = {
  doorPosition: { front: 0, left: 5000, right: 5000 },
  doorSizeMode: { recommended: 0, custom: 5000 },
  engraving: { none: 0, yes: 15000 },
  floor: { standard: 0, removable: 15000 },
  cushion: { none: 0, add: 25000 },
  top: { standard: 0, storage: 30000 },
} as const;

export const DEFAULT_OPTIONS: OptionChoice = {
  doorPosition: "front",
  doorSizeMode: "recommended",
  doorCustomWidth: 300,
  doorCustomHeight: 400,
  engraving: "none",
  engravingText: "",
  floor: "standard",
  cushion: "none",
  top: "standard",
};
