export type AppView =
  | 'CHAMBER'
  | 'RULES'
  | 'LOGIN'
  | 'REGISTER'
  | 'ADMIN';

export type CameraPreset = 'DESK' | 'RIDDLE' | 'CAESAR' | 'VAULTS' | 'OVERVIEW';

export type DockTab = 'PUZZLE' | 'WORKBENCH' | 'VAULTS' | 'MUSIC';

export type GameMode = 'CAMPAIGN' | 'ENDLESS';

export type CipherLanguage = 'EN' | 'ES' | 'EN / ES';

export interface CipherExpression {
  label: string;
  language: CipherLanguage;
  code: string;
  detail?: string;
}

export interface PuzzleHint {
  tier: 1 | 2 | 3;
  title: string;
  content: string;
}

export interface PuzzleLevel {
  id: string;
  numberLabel: string;
  isSecret: boolean;
  title: string;
  mechanic: string;
  languages: string;
  briefing: string;
  expressions: CipherExpression[];
  instruction: string;
  answer: string;
  slotLabels: [string, string];
  masterDigit?: string;
  requiredLevels?: string[];
  requiresMasterKey?: boolean;
  hints: [PuzzleHint, PuzzleHint, PuzzleHint];
  solutionSteps: string[];
}

export type EndlessCategory = 'ARITHMETIC' | 'A1Z26' | 'CAESAR';

export interface EndlessPuzzle {
  id: string;
  category: EndlessCategory;
  title: string;
  briefing: string;
  expressions: CipherExpression[];
  instruction: string;
  answer: string;
  slotLabels: [string, string];
  hint: string;
  solutionExplanation: string;
}

export interface SavedProgress {
  solvedIds: string[];
  hintsUsedByLevel: Record<string, number>;
  omegaUnlockedWithMasterKey: boolean;
  endlessSolvedCount: number;
  endlessBestStreak: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  musicVolume: number;
  currentTrackIndex: number;
}
