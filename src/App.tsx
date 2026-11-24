import { useEffect, useState } from 'react';
import {
  Check,
  LockOpen,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { DecoderWorkbench } from './components/DecoderWorkbench';
import { EndlessMode } from './components/EndlessMode';
import { MPBPlayerBar } from './components/MPBPlayerBar';
import { PuzzleBoard } from './components/PuzzleBoard';
import { RulesView } from './components/RulesView';
import { TitleHero } from './components/TitleHero';
import { VaultArchive } from './components/VaultArchive';
import { ALL_PUZZLES, SECRET_PUZZLES, STANDARD_PUZZLES } from './data/puzzles';
import { AppView, PuzzleLevel, SavedProgress } from './types/game';
import { mpbPlayer } from './utils/mpbPlayer';
import { soundFX } from './utils/sound';

const STORAGE_KEY = 'arquivo_cifra_progress_v1';

const DEFAULT_PROGRESS: SavedProgress = {
  solvedIds: [],
  hintsUsedByLevel: {},
  omegaUnlockedWithMasterKey: false,
  endlessSolvedCount: 0,
  endlessBestStreak: 0,
  soundEnabled: true,
  musicEnabled: true,
  musicVolume: 0.55,
  currentTrackIndex: 0,
};

function loadInitialProgress(): SavedProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<SavedProgress>;
    return {
      solvedIds: Array.isArray(parsed.solvedIds) ? parsed.solvedIds : [],
      hintsUsedByLevel:
        parsed.hintsUsedByLevel && typeof parsed.hintsUsedByLevel === 'object'
          ? parsed.hintsUsedByLevel
          : {},
      omegaUnlockedWithMasterKey: Boolean(parsed.omegaUnlockedWithMasterKey),
      endlessSolvedCount: Number(parsed.endlessSolvedCount) || 0,
      endlessBestStreak: Number(parsed.endlessBestStreak) || 0,
      soundEnabled: parsed.soundEnabled !== undefined ? Boolean(parsed.soundEnabled) : true,
      musicEnabled: parsed.musicEnabled !== undefined ? Boolean(parsed.musicEnabled) : true,
      musicVolume: typeof parsed.musicVolume === 'number' ? parsed.musicVolume : 0.55,
      currentTrackIndex: typeof parsed.currentTrackIndex === 'number' ? parsed.currentTrackIndex : 0,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export default function App() {
  const [progress, setProgress] = useState<SavedProgress>(loadInitialProgress);
  const [view, setView] = useState<AppView>('TITLE');
  const [activePuzzleId, setActivePuzzleId] = useState<string>(() => {
    const saved = loadInitialProgress();
    const firstUnsolved = STANDARD_PUZZLES.find((p) => !saved.solvedIds.includes(p.id));
    return firstUnsolved ? firstUnsolved.id : STANDARD_PUZZLES[0].id;
  });
  const [confirmReset, setConfirmReset] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentChord, setCurrentChord] = useState('');

  // Sync audio state & localStorage
  useEffect(() => {
    soundFX.setEnabled(progress.soundEnabled);
    mpbPlayer.setVolume(progress.musicVolume);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota issues
    }
  }, [progress]);

  // Subscribe to MPB player state & initialize saved track
  useEffect(() => {
    mpbPlayer.setTrack(progress.currentTrackIndex, false);
    mpbPlayer.subscribe(() => {
      setIsMusicPlaying(mpbPlayer.getIsPlaying());
      setCurrentChord(mpbPlayer.getCurrentChordName());
    });
  }, []);

  // Auto-start MPB on the first user gesture if musicEnabled is true
  useEffect(() => {
    if (!progress.musicEnabled || isMusicPlaying) return;

    const unlockAndPlay = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-mpb-play-toggle]')) {
        return;
      }
      if (!mpbPlayer.getIsPlaying()) {
        mpbPlayer.start();
      }
      window.removeEventListener('pointerdown', unlockAndPlay);
      window.removeEventListener('keydown', unlockAndPlay);
    };

    window.addEventListener('pointerdown', unlockAndPlay);
    window.addEventListener('keydown', unlockAndPlay);
    return () => {
      window.removeEventListener('pointerdown', unlockAndPlay);
      window.removeEventListener('keydown', unlockAndPlay);
    };
  }, [progress.musicEnabled, isMusicPlaying]);

  const activePuzzle: PuzzleLevel =
    ALL_PUZZLES.find((p) => p.id === activePuzzleId) ?? STANDARD_PUZZLES[0];

  const solvedStandardCount = STANDARD_PUZZLES.filter((p) =>
    progress.solvedIds.includes(p.id)
  ).length;
  const solvedSecretCount = SECRET_PUZZLES.filter((p) =>
    progress.solvedIds.includes(p.id)
  ).length;
  const allCompleted = solvedStandardCount === 6 && solvedSecretCount === 3;

  const handleOpenCampaign = () => {
    soundFX.playClick();
    if (activePuzzle.isSecret) {
      const firstUnsolved = STANDARD_PUZZLES.find((p) => !progress.solvedIds.includes(p.id));
      setActivePuzzleId(firstUnsolved ? firstUnsolved.id : STANDARD_PUZZLES[0].id);
    }
    setView('CAMPAIGN');
  };

  const handleRevealHint = (puzzleId: string, nextCount: number) => {
    setProgress((prev) => ({
      ...prev,
      hintsUsedByLevel: {
        ...prev.hintsUsedByLevel,
        [puzzleId]: Math.max(prev.hintsUsedByLevel[puzzleId] ?? 0, nextCount),
      },
    }));
  };

  const handlePuzzleSolved = (puzzle: PuzzleLevel) => {
    setProgress((prev) => {
      if (prev.solvedIds.includes(puzzle.id)) return prev;
      return {
        ...prev,
        solvedIds: [...prev.solvedIds, puzzle.id],
      };
    });
  };

  const handleNextPuzzle = () => {
    if (!activePuzzle.isSecret) {
      const idx = STANDARD_PUZZLES.findIndex((p) => p.id === activePuzzle.id);
      if (idx >= 0 && idx < STANDARD_PUZZLES.length - 1) {
        setActivePuzzleId(STANDARD_PUZZLES[idx + 1].id);
        return;
      }
      setView('VAULTS');
    } else {
      setView('VAULTS');
    }
  };

  const handleSelectSecretPuzzle = (puzzle: PuzzleLevel) => {
    setActivePuzzleId(puzzle.id);
    setView('CAMPAIGN');
  };

  const handleUnlockOmega = () => {
    setProgress((prev) => ({
      ...prev,
      omegaUnlockedWithMasterKey: true,
    }));
  };

  const handleRecordEndlessSolve = (currentStreak: number) => {
    setProgress((prev) => ({
      ...prev,
      endlessSolvedCount: prev.endlessSolvedCount + 1,
      endlessBestStreak: Math.max(prev.endlessBestStreak, currentStreak),
    }));
  };

  const handleToggleSound = () => {
    setProgress((prev) => {
      const next = !prev.soundEnabled;
      soundFX.setEnabled(next);
      if (next) soundFX.playClick();
      return { ...prev, soundEnabled: next };
    });
  };

  const handleResetProgress = () => {
    soundFX.playClear();
    setProgress((prev) => ({
      ...DEFAULT_PROGRESS,
      soundEnabled: prev.soundEnabled,
      musicEnabled: prev.musicEnabled,
      musicVolume: prev.musicVolume,
      currentTrackIndex: prev.currentTrackIndex,
    }));
    setActivePuzzleId(STANDARD_PUZZLES[0].id);
    setConfirmReset(false);
    setView('TITLE');
  };

  const handleToggleMusic = () => {
    const nowPlaying = mpbPlayer.toggle();
    setIsMusicPlaying(nowPlaying);
    setProgress((prev) => ({ ...prev, musicEnabled: nowPlaying }));
  };

  const handlePrevTrack = () => {
    mpbPlayer.prevTrack();
    const nextIdx = mpbPlayer.getTrackIndex();
    if (!mpbPlayer.getIsPlaying()) {
      mpbPlayer.start();
    }
    setProgress((prev) => ({ ...prev, currentTrackIndex: nextIdx, musicEnabled: true }));
  };

  const handleNextTrack = () => {
    mpbPlayer.nextTrack();
    const nextIdx = mpbPlayer.getTrackIndex();
    if (!mpbPlayer.getIsPlaying()) {
      mpbPlayer.start();
    }
    setProgress((prev) => ({ ...prev, currentTrackIndex: nextIdx, musicEnabled: true }));
  };

  const handleSelectTrack = (index: number) => {
    mpbPlayer.setTrack(index, true);
    setProgress((prev) => ({ ...prev, currentTrackIndex: index, musicEnabled: true }));
  };

  const handleVolumeChange = (vol: number) => {
    mpbPlayer.setVolume(vol);
    setProgress((prev) => ({ ...prev, musicVolume: vol }));
  };

  const currentIdx = STANDARD_PUZZLES.findIndex((p) => p.id === activePuzzle.id);
  const hasNextPuzzle = !activePuzzle.isSecret && currentIdx < STANDARD_PUZZLES.length - 1;

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1320] text-[#F1F5F9]">
      {/* Strict 3-Zone Top Bar */}
      <header className="border-b border-slate-800/90 bg-[#0B1320]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setView('TITLE');
            }}
            className="font-display text-xl font-bold tracking-tight text-slate-50 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Arquivo Cifra
          </button>

          {/* Zone 2: Clean Single-Line Nav Links */}
          <nav
            aria-label="Navegação principal"
            className="hidden md:flex items-center gap-6 text-sm font-medium"
          >
            <button
              type="button"
              onClick={handleOpenCampaign}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                view === 'CAMPAIGN'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-300 hover:text-slate-50'
              }`}
            >
              Campanha
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setView('VAULTS');
              }}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                view === 'VAULTS'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-300 hover:text-slate-50'
              }`}
            >
              Cofres Secretos
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setView('ENDLESS');
              }}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                view === 'ENDLESS'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-300 hover:text-slate-50'
              }`}
            >
              Modo Infinito
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setView('RULES');
              }}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                view === 'RULES'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-300 hover:text-slate-50'
              }`}
            >
              Regras
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={handleOpenCampaign}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {solvedStandardCount > 0 ? 'Continuar' : 'Jogar Agora'}
            </button>
          </div>
        </div>

        {/* Mobile Secondary Navigation Row */}
        <nav
          aria-label="Navegação móvel"
          className="flex md:hidden items-center justify-between gap-4 px-4 pb-3 border-t border-slate-800/50 pt-2.5 overflow-x-auto text-xs font-medium"
        >
          <button
            type="button"
            onClick={handleOpenCampaign}
            className={`whitespace-nowrap shrink-0 ${
              view === 'CAMPAIGN' ? 'text-amber-300 font-semibold' : 'text-slate-300'
            }`}
          >
            Campanha
          </button>
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setView('VAULTS');
            }}
            className={`whitespace-nowrap shrink-0 ${
              view === 'VAULTS' ? 'text-amber-300 font-semibold' : 'text-slate-300'
            }`}
          >
            Cofres Secretos
          </button>
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setView('ENDLESS');
            }}
            className={`whitespace-nowrap shrink-0 ${
              view === 'ENDLESS' ? 'text-amber-300 font-semibold' : 'text-slate-300'
            }`}
          >
            Modo Infinito
          </button>
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setView('RULES');
            }}
            className={`whitespace-nowrap shrink-0 ${
              view === 'RULES' ? 'text-amber-300 font-semibold' : 'text-slate-300'
            }`}
          >
            Regras
          </button>
        </nav>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8 md:py-10 flex flex-col gap-6">
        {/* MPB Soundtrack Bar */}
        <MPBPlayerBar
          isPlaying={isMusicPlaying}
          musicEnabled={progress.musicEnabled}
          trackIndex={progress.currentTrackIndex}
          currentChord={currentChord}
          volume={progress.musicVolume}
          onTogglePlay={handleToggleMusic}
          onPrevTrack={handlePrevTrack}
          onNextTrack={handleNextTrack}
          onSelectTrack={handleSelectTrack}
          onVolumeChange={handleVolumeChange}
        />

        {/* Global Workspace Progress & Sound Toolbar (visible during play views) */}
        {view !== 'TITLE' && (
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 tabular-nums">
              <span>
                Campanha: <strong className="text-slate-100 font-mono">{solvedStandardCount}/6</strong>
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>
                Cofres Secretos: <strong className="text-amber-300 font-mono">{solvedSecretCount}/3</strong>
              </span>
              {allCompleted && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-emerald-400 font-semibold">Arquivo 100% Decifrado</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleSound}
                aria-label={progress.soundEnabled ? 'Silenciar efeitos sonoros' : 'Ativar efeitos sonoros'}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700/80 text-slate-300 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {progress.soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                )}
                <span>{progress.soundEnabled ? 'Som Ativo' : 'Som Mudo'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Views */}
        {view === 'TITLE' && (
          <TitleHero
            solvedStandardCount={solvedStandardCount}
            solvedSecretCount={solvedSecretCount}
            onStartCampaign={handleOpenCampaign}
            onOpenVaults={() => setView('VAULTS')}
          />
        )}

        {view === 'CAMPAIGN' && (
          <div className="flex flex-col gap-6">
            {/* Level Selector Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {STANDARD_PUZZLES.map((lv) => {
                  const isSolved = progress.solvedIds.includes(lv.id);
                  const isActive = activePuzzle.id === lv.id;
                  return (
                    <button
                      key={lv.id}
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setActivePuzzleId(lv.id);
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-amber-500 text-slate-950'
                          : isSolved
                          ? 'bg-[#121D31] border border-emerald-700/60 text-emerald-300 hover:bg-[#182640]'
                          : 'bg-[#121D31] border border-slate-700/70 text-slate-300 hover:bg-[#182640]'
                      }`}
                    >
                      <span className="tabular-nums">{lv.numberLabel}</span>
                      {isSolved && !isActive && (
                        <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}

                {activePuzzle.isSecret && (
                  <button
                    type="button"
                    onClick={() => setView('VAULTS')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold bg-amber-500/20 border border-amber-400/60 text-amber-200 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <LockOpen className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Secreto {activePuzzle.numberLabel}</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setView('VAULTS');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-700/80 text-xs font-medium text-amber-300 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LockOpen className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Cofres Secretos ({solvedSecretCount}/3)</span>
              </button>
            </div>

            {/* 2-Column Playable Workspace: Puzzle Board + Decoder Workbench */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
              <PuzzleBoard
                puzzle={activePuzzle}
                isSolved={progress.solvedIds.includes(activePuzzle.id)}
                revealedHintCount={progress.hintsUsedByLevel[activePuzzle.id] ?? 0}
                hasNextPuzzle={hasNextPuzzle}
                onRevealHint={handleRevealHint}
                onSolved={handlePuzzleSolved}
                onNextPuzzle={handleNextPuzzle}
                onGoToVaults={() => setView('VAULTS')}
              />
              <DecoderWorkbench />
            </div>
          </div>
        )}

        {view === 'VAULTS' && (
          <VaultArchive
            solvedIds={progress.solvedIds}
            omegaUnlockedWithMasterKey={progress.omegaUnlockedWithMasterKey}
            onUnlockOmega={handleUnlockOmega}
            onSelectSecretPuzzle={handleSelectSecretPuzzle}
          />
        )}

        {view === 'ENDLESS' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            <EndlessMode
              totalSolved={progress.endlessSolvedCount}
              bestStreak={progress.endlessBestStreak}
              onRecordSolve={handleRecordEndlessSolve}
            />
            <DecoderWorkbench />
          </div>
        )}

        {view === 'RULES' && <RulesView onPlayNow={handleOpenCampaign} />}
      </main>

      {/* Clean Quiet Footer with Real Reset Action */}
      <footer className="border-t border-slate-800/80 bg-[#0B1320] mt-auto">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <span>Arquivo Cifra · Lógica em Inglês, Espanhol e Números</span>

          <div className="flex items-center gap-3">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reiniciar Progresso</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-rose-300">Zerar todo o progresso?</span>
                <button
                  type="button"
                  onClick={handleResetProgress}
                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium cursor-pointer whitespace-nowrap"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1 rounded border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer whitespace-nowrap"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
