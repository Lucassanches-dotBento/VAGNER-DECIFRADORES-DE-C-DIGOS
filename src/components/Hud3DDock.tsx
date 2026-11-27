import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Eraser,
  Infinity as InfinityIcon,
  KeyRound,
  Lightbulb,
  Lock,
  LockOpen,
  Minus,
  Music,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  SkipBack,
  SkipForward,
  Unlock,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  ALL_PUZZLES,
  BILINGUAL_NUMBERS,
  caesarShift as applyCaesarShift,
  MASTER_KEY_CODE,
  SECRET_PUZZLES,
  STANDARD_PUZZLES,
} from '../data/puzzles';
import {
  CameraPreset,
  DockTab,
  EndlessCategory,
  EndlessPuzzle,
  GameMode,
  PuzzleLevel,
  SavedProgress,
} from '../types/game';
import { MPB_TRACKS } from '../utils/mpbPlayer';
import { soundFX } from '../utils/sound';

interface Hud3DDockProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  activeTab: DockTab;
  onTabChange: (tab: DockTab) => void;
  cameraPreset: CameraPreset;
  onCameraPresetChange: (preset: CameraPreset) => void;
  gameMode: GameMode;
  onGameModeChange: (mode: GameMode) => void;
  activePuzzle: PuzzleLevel;
  onSelectPuzzleId: (id: string) => void;
  endlessCategory: EndlessCategory;
  endlessPuzzle: EndlessPuzzle;
  endlessStreak: number;
  endlessSolved: boolean;
  endlessShowHint: boolean;
  onSelectEndlessCategory: (cat: EndlessCategory) => void;
  onNewEndlessPuzzle: () => void;
  onToggleEndlessHint: () => void;
  progress: SavedProgress;
  digits: [number, number, number, number];
  onDialStep: (slotIndex: number, delta: 1 | -1) => void;
  onClearDigits: () => void;
  onSubmitCode: () => void;
  feedbackMsg: { type: 'success' | 'error'; text: string } | null;
  onRevealHint: (puzzleId: string, nextCount: number) => void;
  onNextPuzzle: () => void;
  caesarShiftValue: number;
  onCaesarShiftChange: (nextShift: number) => void;
  onUnlockOmegaWithMasterKey: () => void;
  isMusicPlaying: boolean;
  currentChord: string;
  onToggleMusic: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onSelectTrack: (idx: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleSound: () => void;
  onResetProgress: () => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const CAMERA_BUTTONS: { id: CameraPreset; label: string }[] = [
  { id: 'DESK', label: 'Mesa 3D' },
  { id: 'RIDDLE', label: 'Placa' },
  { id: 'CAESAR', label: 'Roda César' },
  { id: 'VAULTS', label: 'Cofres 3D' },
  { id: 'OVERVIEW', label: 'Geral' },
];

export function Hud3DDock({
  collapsed,
  onToggleCollapsed,
  activeTab,
  onTabChange,
  cameraPreset,
  onCameraPresetChange,
  gameMode,
  onGameModeChange,
  activePuzzle,
  onSelectPuzzleId,
  endlessCategory,
  endlessPuzzle,
  endlessStreak,
  endlessSolved,
  endlessShowHint,
  onSelectEndlessCategory,
  onNewEndlessPuzzle,
  onToggleEndlessHint,
  progress,
  digits,
  onDialStep,
  onClearDigits,
  onSubmitCode,
  feedbackMsg,
  onRevealHint,
  onNextPuzzle,
  caesarShiftValue,
  onCaesarShiftChange,
  onUnlockOmegaWithMasterKey,
  isMusicPlaying,
  currentChord,
  onToggleMusic,
  onPrevTrack,
  onNextTrack,
  onSelectTrack,
  onVolumeChange,
  onToggleSound,
  onResetProgress,
}: Hud3DDockProps) {
  const [workbenchTool, setWorkbenchTool] = useState<'CAESAR' | 'A1Z26' | 'DICT'>('CAESAR');
  const [caesarInput, setCaesarInput] = useState('FLQFR WHQ');
  const [a1z26Word, setA1z26Word] = useState('SIX');
  const [dictQuery, setDictQuery] = useState('');
  const [masterKeyInput, setMasterKeyInput] = useState('');
  const [masterKeyError, setMasterKeyError] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const isCampaignSolved = progress.solvedIds.includes(activePuzzle.id);
  const revealedHintCount = progress.hintsUsedByLevel[activePuzzle.id] ?? 0;
  const currentStdIdx = STANDARD_PUZZLES.findIndex((p) => p.id === activePuzzle.id);
  const hasNextStandard = !activePuzzle.isSecret && currentStdIdx < STANDARD_PUZZLES.length - 1;

  const caesarResult = useMemo(
    () => applyCaesarShift(caesarInput, caesarShiftValue),
    [caesarInput, caesarShiftValue]
  );

  const a1z26Letters = useMemo(() => {
    return a1z26Word
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .split('')
      .map((ch) => ({ letter: ch, value: ch.charCodeAt(0) - 64 }));
  }, [a1z26Word]);

  const a1z26Total = useMemo(
    () => a1z26Letters.reduce((acc, item) => acc + item.value, 0),
    [a1z26Letters]
  );

  const filteredDict = useMemo(() => {
    const q = dictQuery.trim().toLowerCase();
    if (!q) return BILINGUAL_NUMBERS;
    return BILINGUAL_NUMBERS.filter(
      (n) =>
        String(n.value).includes(q) ||
        n.en.toLowerCase().includes(q) ||
        n.es.toLowerCase().includes(q)
    );
  }, [dictQuery]);

  const solvedStandardCount = STANDARD_PUZZLES.filter((p) =>
    progress.solvedIds.includes(p.id)
  ).length;
  const solvedSecretCount = SECRET_PUZZLES.filter((p) =>
    progress.solvedIds.includes(p.id)
  ).length;

  const currentTrack = MPB_TRACKS[progress.currentTrackIndex] ?? MPB_TRACKS[0];

  const handleMasterKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterKeyInput.trim() === MASTER_KEY_CODE) {
      soundFX.playVaultUnlock();
      setMasterKeyError('');
      onUnlockOmegaWithMasterKey();
    } else {
      soundFX.playError();
      setMasterKeyError('Chave Mestra incorreta. Confira os Dígitos Mestres dos níveis 01 a 06.');
    }
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-20 w-[min(980px,96vw)] flex flex-col items-center pointer-events-none">
      {/* Top Edge Rail: Camera Presets + Collapse Toggle */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 mb-2 px-3 py-1.5 rounded-t-xl rounded-b-lg bg-[#0B1320]/95 border border-slate-700/80 shadow-lg">
        <div className="flex items-center gap-1 pr-2 border-r border-slate-800">
          <Camera className="w-3.5 h-3.5 text-amber-400 mr-1 shrink-0" aria-hidden="true" />
          {CAMERA_BUTTONS.map((cam) => (
            <button
              key={cam.id}
              type="button"
              onClick={() => {
                soundFX.playClick();
                onCameraPresetChange(cam.id);
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                cameraPreset === cam.id
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {cam.label}
            </button>
          ))}
        </div>

        {/* Quick MPB Toggle */}
        <button
          type="button"
          data-mpb-play-toggle="true"
          onClick={onToggleMusic}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium border border-slate-700/80 bg-[#121D31] text-slate-200 hover:border-amber-400/60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isMusicPlaying ? (
            <Pause className="w-3 h-3 text-amber-400 shrink-0" aria-hidden="true" />
          ) : (
            <Play className="w-3 h-3 text-amber-400 shrink-0" aria-hidden="true" />
          )}
          <span className="max-w-[140px] truncate">{currentTrack.title}</span>
        </button>

        {/* Collapse / Expand Drawer */}
        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            onToggleCollapsed();
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-[#121D31] border border-slate-700 text-amber-300 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {collapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Mostrar Painel (H)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Ocultar Painel (H)</span>
            </>
          )}
        </button>
      </div>

      {/* Collapsible Main Control & Puzzle Dock */}
      {!collapsed && (
        <section
          aria-label="Painel de Decifração 3D"
          className="pointer-events-auto w-full bg-[#0B1320]/95 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[54vh] md:max-h-[46vh]"
        >
          {/* Dock Tabs + Progress Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#121D31] border-b border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(
                [
                  { id: 'PUZZLE', label: 'Enigma & Trava 3D' },
                  { id: 'WORKBENCH', label: 'Bancada (César / A1Z26)' },
                  { id: 'VAULTS', label: `Cofres (${solvedSecretCount}/3)` },
                  { id: 'MUSIC', label: 'Vitrola MPB' },
                ] as { id: DockTab; label: string }[]
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    onTabChange(t.id);
                    if (t.id === 'VAULTS') onCameraPresetChange('VAULTS');
                    if (t.id === 'WORKBENCH' && workbenchTool === 'CAESAR') {
                      onCameraPresetChange('CAESAR');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === t.id
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 tabular-nums">
              <span>
                Campanha <strong className="text-slate-100 font-mono">{solvedStandardCount}/6</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Cofres <strong className="text-amber-300 font-mono">{solvedSecretCount}/3</strong>
              </span>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="p-4 overflow-y-auto flex flex-col gap-4">
            {/* ============================================================== */}
            {/* TAB 1: PUZZLE & 3D DIAL CONTROLS                               */}
            {/* ============================================================== */}
            {activeTab === 'PUZZLE' && (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_310px] gap-4 items-start">
                {/* Left: Active Riddle Text + Expressions + Hints */}
                <div className="flex flex-col gap-3">
                  {/* Mode Switch + Level Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-[#121D31] border border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          onGameModeChange('CAMPAIGN');
                        }}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                          gameMode === 'CAMPAIGN'
                            ? 'bg-amber-500 text-slate-950'
                            : 'text-slate-300 hover:text-slate-100'
                        }`}
                      >
                        Campanha
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          onGameModeChange('ENDLESS');
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                          gameMode === 'ENDLESS'
                            ? 'bg-amber-500 text-slate-950'
                            : 'text-slate-300 hover:text-slate-100'
                        }`}
                      >
                        <InfinityIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>Infinito</span>
                      </button>
                    </div>

                    {gameMode === 'CAMPAIGN' ? (
                      <div className="flex flex-wrap items-center gap-1">
                        {ALL_PUZZLES.map((lv) => {
                          const solved = progress.solvedIds.includes(lv.id);
                          const active = activePuzzle.id === lv.id;
                          const unlockedSecret =
                            !lv.isSecret ||
                            ((!lv.requiredLevels ||
                              lv.requiredLevels.every((r) => progress.solvedIds.includes(r))) &&
                              (!lv.requiresMasterKey || progress.omegaUnlockedWithMasterKey));

                          if (!unlockedSecret && !solved) return null;

                          return (
                            <button
                              key={lv.id}
                              type="button"
                              onClick={() => {
                                soundFX.playClick();
                                onSelectPuzzleId(lv.id);
                              }}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                active
                                  ? 'bg-amber-500 text-slate-950'
                                  : solved
                                  ? 'bg-[#121D31] border border-emerald-700/60 text-emerald-300 hover:bg-slate-800'
                                  : 'bg-[#121D31] border border-slate-700 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <span>{lv.numberLabel}</span>
                              {solved && !active && <Check className="w-3 h-3" aria-hidden="true" />}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(
                          [
                            { id: 'ARITHMETIC', label: 'Aritmética' },
                            { id: 'A1Z26', label: 'A1Z26' },
                            { id: 'CAESAR', label: 'César' },
                          ] as { id: EndlessCategory; label: string }[]
                        ).map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => onSelectEndlessCategory(cat.id)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                              endlessCategory === cat.id
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-[#121D31] border border-slate-700 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                        <span className="text-xs font-mono text-amber-300 pl-1 tabular-nums">
                          Seq. {endlessStreak}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Active Briefing + Expressions */}
                  {gameMode === 'CAMPAIGN' ? (
                    <>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h2 className="font-display text-lg font-bold text-slate-50">
                          {activePuzzle.numberLabel}. {activePuzzle.title}
                        </h2>
                        <span className="text-xs text-amber-300 font-mono">
                          {activePuzzle.mechanic} · {activePuzzle.languages}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {activePuzzle.briefing}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activePuzzle.expressions.map((expr) => (
                          <div
                            key={expr.label + expr.code}
                            className="bg-[#121D31] border border-slate-800 rounded-lg px-3 py-2 flex flex-col gap-0.5"
                          >
                            <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                              <span>{expr.label}</span>
                              <span className="font-mono text-amber-400">{expr.language}</span>
                            </div>
                            <div className="font-mono text-sm font-bold text-amber-200 tracking-wide">
                              {expr.code}
                            </div>
                            {expr.detail && (
                              <span className="text-[11px] text-slate-400">{expr.detail}</span>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <span className="text-xs text-slate-300">{activePuzzle.instruction}</span>
                        {revealedHintCount < 3 && !isCampaignSolved && (
                          <button
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              onRevealHint(activePuzzle.id, revealedHintCount + 1);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-[#121D31] hover:bg-slate-800 text-xs text-amber-300 font-medium whitespace-nowrap cursor-pointer"
                          >
                            <Lightbulb className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>Ver Pista ({revealedHintCount}/3)</span>
                          </button>
                        )}
                      </div>

                      {revealedHintCount > 0 && (
                        <div className="flex flex-col gap-1.5">
                          {activePuzzle.hints.slice(0, revealedHintCount).map((h) => (
                            <div
                              key={h.tier}
                              className="px-3 py-2 rounded-lg bg-[#121D31] border border-amber-500/30 text-xs text-slate-200"
                            >
                              <strong className="text-amber-300">
                                Pista {h.tier} ({h.title}):{' '}
                              </strong>
                              {h.content}
                            </div>
                          ))}
                        </div>
                      )}

                      {isCampaignSolved && (
                        <div className="px-3 py-2.5 rounded-lg bg-emerald-950/35 border border-emerald-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex flex-col gap-0.5 text-emerald-200">
                            <strong>
                              Selo decifrado ({activePuzzle.answer})
                              {activePuzzle.masterDigit
                                ? ` · Dígito Mestre: ${activePuzzle.masterDigit}`
                                : ''}
                            </strong>
                            <span className="text-emerald-300/90">
                              {activePuzzle.solutionSteps.join(' ')}
                            </span>
                          </div>
                          {hasNextStandard && (
                            <button
                              type="button"
                              onClick={onNextPuzzle}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <span>Próximo Nível</span>
                              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h2 className="font-display text-lg font-bold text-slate-50">
                          {endlessPuzzle.title}
                        </h2>
                        <button
                          type="button"
                          onClick={onNewEndlessPuzzle}
                          className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-700 bg-[#121D31] hover:bg-slate-800 text-xs text-slate-200 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" aria-hidden="true" />
                          <span>Novo Enigma</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-300">{endlessPuzzle.briefing}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {endlessPuzzle.expressions.map((expr) => (
                          <div
                            key={expr.label + expr.code}
                            className="bg-[#121D31] border border-slate-800 rounded-lg px-3 py-2 flex flex-col gap-0.5"
                          >
                            <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                              <span>{expr.label}</span>
                              <span className="font-mono text-amber-400">{expr.language}</span>
                            </div>
                            <div className="font-mono text-sm font-bold text-amber-200">
                              {expr.code}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-slate-300">{endlessPuzzle.instruction}</span>
                        {!endlessSolved && (
                          <button
                            type="button"
                            onClick={onToggleEndlessHint}
                            className="flex items-center gap-1 px-3 py-1 rounded border border-slate-700 bg-[#121D31] text-xs text-amber-300 cursor-pointer"
                          >
                            <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{endlessShowHint ? 'Ocultar Pista' : 'Ver Pista'}</span>
                          </button>
                        )}
                      </div>

                      {endlessShowHint && !endlessSolved && (
                        <div className="px-3 py-2 rounded-lg bg-[#121D31] border border-amber-500/30 text-xs text-amber-200">
                          {endlessPuzzle.hint}
                        </div>
                      )}

                      {endlessSolved && (
                        <div className="px-3 py-2.5 rounded-lg bg-emerald-950/35 border border-emerald-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <span className="text-emerald-200">
                            {endlessPuzzle.solutionExplanation}
                          </span>
                          <button
                            type="button"
                            onClick={onNewEndlessPuzzle}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold whitespace-nowrap cursor-pointer"
                          >
                            <span>Próximo Desafio</span>
                            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Right: 4-Digit 3D Brass Dial Controller */}
                <div className="bg-[#121D31] border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-200">Trava 3D de Latão</span>
                    <span className="font-mono">Clique nos anéis 3D ou use 0–9</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {digits.map((d, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center bg-[#0B1320] border border-slate-700/80 rounded-lg p-1.5"
                      >
                        <button
                          type="button"
                          onClick={() => onDialStep(idx, 1)}
                          aria-label={`Avançar dígito ${idx + 1}`}
                          className="w-full py-1 flex items-center justify-center text-amber-300 hover:bg-slate-800 rounded cursor-pointer"
                        >
                          <ChevronUp className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <span className="font-mono text-xl font-bold text-amber-300 tabular-nums py-0.5">
                          {d}
                        </span>
                        <button
                          type="button"
                          onClick={() => onDialStep(idx, -1)}
                          aria-label={`Voltar dígito ${idx + 1}`}
                          className="w-full py-1 flex items-center justify-center text-slate-400 hover:bg-slate-800 rounded cursor-pointer"
                        >
                          <ChevronDown className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <button
                      type="button"
                      onClick={onSubmitCode}
                      className="py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <Unlock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>Decifrar Código</span>
                    </button>
                    <button
                      type="button"
                      onClick={onClearDigits}
                      aria-label="Zerar código"
                      className="px-3 py-2.5 rounded-lg border border-slate-700 bg-[#0B1320] hover:bg-slate-800 text-slate-300 flex items-center justify-center cursor-pointer"
                    >
                      <Eraser className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  {feedbackMsg && (
                    <div
                      role="status"
                      className={`px-3 py-2 rounded-lg text-xs border ${
                        feedbackMsg.type === 'success'
                          ? 'bg-emerald-950/40 border-emerald-700/70 text-emerald-200'
                          : 'bg-rose-950/40 border-rose-700/70 text-rose-200'
                      }`}
                    >
                      {feedbackMsg.text}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: BANCADA (3D CAESAR WHEEL + A1Z26 + EN/ES DICTIONARY)    */}
            {/* ============================================================== */}
            {activeTab === 'WORKBENCH' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(
                    [
                      { id: 'CAESAR', label: 'Roda de César 3D' },
                      { id: 'A1Z26', label: 'Tabela A1Z26' },
                      { id: 'DICT', label: 'Números EN / ES' },
                    ] as const
                  ).map((tool) => (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setWorkbenchTool(tool.id);
                        if (tool.id === 'CAESAR') onCameraPresetChange('CAESAR');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                        workbenchTool === tool.id
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-[#121D31] border border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {tool.label}
                    </button>
                  ))}
                </div>

                {workbenchTool === 'CAESAR' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-[#121D31] border border-slate-800 rounded-xl p-4">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="hud-caesar-input" className="text-xs text-slate-300 font-medium">
                        Texto cifrado para testar na Roda de César 3D:
                      </label>
                      <input
                        id="hud-caesar-input"
                        type="text"
                        value={caesarInput}
                        onChange={(e) => setCaesarInput(e.target.value.toUpperCase())}
                        placeholder="Ex: FLQFR"
                        className="px-3 py-2 rounded-lg bg-[#0B1320] border border-slate-700 font-mono text-sm text-amber-200 focus:outline-none focus:border-amber-400"
                      />
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => onCaesarShiftChange(Math.max(-13, caesarShiftValue - 1))}
                          className="p-2 rounded-lg border border-slate-700 bg-[#0B1320] hover:bg-slate-800 text-slate-200 cursor-pointer"
                          aria-label="Diminuir deslocamento"
                        >
                          <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <div className="flex-1 text-center font-mono text-sm font-bold text-amber-300 tabular-nums">
                          Deslocamento: {caesarShiftValue > 0 ? `+${caesarShiftValue}` : caesarShiftValue}
                        </div>
                        <button
                          type="button"
                          onClick={() => onCaesarShiftChange(Math.min(13, caesarShiftValue + 1))}
                          className="p-2 rounded-lg border border-slate-700 bg-[#0B1320] hover:bg-slate-800 text-slate-200 cursor-pointer"
                          aria-label="Aumentar deslocamento"
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#0B1320] border border-slate-800 rounded-lg p-3.5 flex flex-col gap-1">
                      <span className="text-[11px] text-slate-400">Resultado decifrado:</span>
                      <div className="font-mono text-xl font-bold text-emerald-300 tracking-wider break-all">
                        {caesarResult || '—'}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        O disco interno de latão na mesa 3D gira em tempo real com esse deslocamento.
                      </span>
                    </div>
                  </div>
                )}

                {workbenchTool === 'A1Z26' && (
                  <div className="bg-[#121D31] border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <input
                        type="text"
                        aria-label="Palavra para cálculo A1Z26"
                        value={a1z26Word}
                        onChange={(e) => setA1z26Word(e.target.value.toUpperCase())}
                        placeholder="Digite ou clique nas letras..."
                        className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-[#0B1320] border border-slate-700 font-mono text-sm text-amber-200 focus:outline-none focus:border-amber-400"
                      />
                      <div className="font-mono text-sm font-bold text-emerald-300 tabular-nums">
                        Soma Total: {a1z26Total}
                      </div>
                      <button
                        type="button"
                        onClick={() => setA1z26Word('')}
                        className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
                      >
                        Limpar
                      </button>
                    </div>

                    <div className="grid grid-cols-7 sm:grid-cols-13 gap-1">
                      {ALPHABET.map((ch, i) => (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            setA1z26Word((prev) => prev + ch);
                          }}
                          className="py-1.5 rounded bg-[#0B1320] border border-slate-800 hover:border-amber-400 text-center cursor-pointer"
                        >
                          <div className="font-mono text-xs font-bold text-slate-100">{ch}</div>
                          <div className="font-mono text-[10px] text-amber-400 tabular-nums">
                            {i + 1}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {workbenchTool === 'DICT' && (
                  <div className="bg-[#121D31] border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                    <input
                      type="text"
                      aria-label="Buscar número em Inglês ou Espanhol"
                      value={dictQuery}
                      onChange={(e) => setDictQuery(e.target.value)}
                      placeholder="Filtrar número (ex: 14, FOUR, CATORCE)..."
                      className="px-3 py-2 rounded-lg bg-[#0B1320] border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto">
                      {filteredDict.map((entry) => (
                        <div
                          key={entry.value}
                          className="px-2.5 py-1.5 rounded bg-[#0B1320] border border-slate-800 text-xs flex items-center justify-between gap-2"
                        >
                          <span className="font-mono font-bold text-amber-300 tabular-nums">
                            {entry.value}
                          </span>
                          <span className="font-mono text-[11px] text-slate-300 truncate">
                            {entry.en} / {entry.es}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: SECRET VAULTS & MASTER KEY                              */}
            {/* ============================================================== */}
            {activeTab === 'VAULTS' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {SECRET_PUZZLES.map((vault) => {
                  const solved = progress.solvedIds.includes(vault.id);
                  const reqsMet =
                    !vault.requiredLevels ||
                    vault.requiredLevels.every((r) => progress.solvedIds.includes(r));
                  const unlocked =
                    solved || (reqsMet && (!vault.requiresMasterKey || progress.omegaUnlockedWithMasterKey));

                  return (
                    <div
                      key={vault.id}
                      className="bg-[#121D31] border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-amber-400">
                            {vault.numberLabel}
                          </span>
                          <span className={solved ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                            {solved ? 'Aberto' : unlocked ? 'Disponível' : 'Bloqueado'}
                          </span>
                        </div>
                        <h3 className="font-display text-base font-bold text-slate-100">
                          {vault.title}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {vault.requiresMasterKey
                            ? 'Requer os 6 níveis da Campanha + Chave Mestra de 6 dígitos.'
                            : `Requer concluir os níveis ${vault.requiredLevels?.map((r) => r.replace('lv-', '')).join(', ')}.`}
                        </p>
                      </div>

                      {vault.requiresMasterKey && reqsMet && !progress.omegaUnlockedWithMasterKey ? (
                        <form onSubmit={handleMasterKeySubmit} className="flex flex-col gap-2">
                          <div className="flex items-center gap-1 text-[11px] font-mono text-amber-300">
                            <KeyRound className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>
                              Chave:{' '}
                              {STANDARD_PUZZLES.map((s) =>
                                progress.solvedIds.includes(s.id) ? s.masterDigit : '?'
                              ).join('')}
                            </span>
                          </div>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              value={masterKeyInput}
                              onChange={(e) => setMasterKeyInput(e.target.value.replace(/\D/g, ''))}
                              placeholder="6 dígitos"
                              className="flex-1 px-2.5 py-1.5 rounded bg-[#0B1320] border border-slate-700 font-mono text-xs text-amber-200"
                            />
                            <button
                              type="submit"
                              className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs cursor-pointer"
                            >
                              Destravar
                            </button>
                          </div>
                          {masterKeyError && (
                            <span className="text-[11px] text-rose-300">{masterKeyError}</span>
                          )}
                        </form>
                      ) : (
                        <button
                          type="button"
                          disabled={!unlocked}
                          onClick={() => {
                            soundFX.playClick();
                            onSelectPuzzleId(vault.id);
                            onGameModeChange('CAMPAIGN');
                            onTabChange('PUZZLE');
                            onCameraPresetChange('RIDDLE');
                          }}
                          className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                            unlocked
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                              : 'bg-slate-800/70 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {unlocked ? (
                            <>
                              <LockOpen className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              <span>{solved ? 'Revisitar Cofre' : 'Abrir Enigma do Cofre'}</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              <span>Bloqueado</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 4: MPB VITROLA + SOUND + PROGRESS RESET                    */}
            {/* ============================================================== */}
            {activeTab === 'MUSIC' && (
              <div className="flex flex-col gap-3">
                <div className="bg-[#121D31] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={onPrevTrack}
                      aria-label="Faixa MPB anterior"
                      className="w-9 h-9 rounded-lg border border-slate-700 bg-[#0B1320] hover:bg-slate-800 text-slate-200 flex items-center justify-center cursor-pointer"
                    >
                      <SkipBack className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      data-mpb-play-toggle="true"
                      onClick={onToggleMusic}
                      className="h-9 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      {isMusicPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Pausar MPB</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Tocar MPB</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={onNextTrack}
                      aria-label="Próxima faixa MPB"
                      className="w-9 h-9 rounded-lg border border-slate-700 bg-[#0B1320] hover:bg-slate-800 text-slate-200 flex items-center justify-center cursor-pointer"
                    >
                      <SkipForward className="w-4 h-4" aria-hidden="true" />
                    </button>

                    <div className="flex flex-col pl-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-100">
                        <Music className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                        <span>{currentTrack.title}</span>
                        {isMusicPlaying && currentChord && (
                          <span className="font-mono text-amber-300">· {currentChord}</span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{currentTrack.style}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      aria-label="Selecionar faixa MPB"
                      value={progress.currentTrackIndex}
                      onChange={(e) => onSelectTrack(Number(e.target.value))}
                      className="px-3 py-1.5 rounded-lg bg-[#0B1320] border border-slate-700 text-xs text-slate-200 cursor-pointer"
                    >
                      {MPB_TRACKS.map((t, i) => (
                        <option key={t.id} value={i}>
                          {i + 1}. {t.title}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-2 bg-[#0B1320] border border-slate-800 rounded-lg px-2.5 py-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={Math.round(progress.musicVolume * 100)}
                        aria-label="Volume MPB"
                        onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
                        className="w-20 accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <button
                    type="button"
                    onClick={onToggleSound}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-[#121D31] text-slate-200 hover:bg-slate-800 cursor-pointer"
                  >
                    {progress.soundEnabled ? (
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    )}
                    <span>Efeitos Sonoros: {progress.soundEnabled ? 'Ativos' : 'Mudos'}</span>
                  </button>

                  {!confirmReset ? (
                    <button
                      type="button"
                      onClick={() => setConfirmReset(true)}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-rose-300 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Reiniciar Progresso</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-rose-300">Zerar progresso?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmReset(false);
                          onResetProgress();
                        }}
                        className="px-2.5 py-1 rounded bg-rose-600 text-white font-semibold cursor-pointer"
                      >
                        Confirmar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmReset(false)}
                        className="px-2.5 py-1 rounded border border-slate-700 text-slate-300 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
