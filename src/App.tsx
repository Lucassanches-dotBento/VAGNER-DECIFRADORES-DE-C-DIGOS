import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, reload, sendEmailVerification, signOut, User } from 'firebase/auth';
import {
  ArrowLeft,
  CloudCheck,
  LogOut,
  MailCheck,
  Megaphone,
  Shield,
  UserCheck,
} from 'lucide-react';
import { AdminPanel } from './components/AdminPanel';
import { AuthPages } from './components/AuthPages';
import { Hud3DDock } from './components/Hud3DDock';
import { RulesView } from './components/RulesView';
import { VaultScene3D } from './components/VaultScene3D';
import {
  ALL_PUZZLES,
  generateEndlessPuzzle,
  STANDARD_PUZZLES,
} from './data/puzzles';
import { auth } from './firebase';
import {
  AdminBannerData,
  BOOTSTRAPPED_ADMIN_EMAIL,
  checkIsUserAdmin,
  ensureUserProfileAndSyncProgress,
  fetchOfficialBanner,
  saveRemoteProgress,
} from './services/userProgressService';
import { RiddlePlaqueContent } from './three/textures';
import {
  AppView,
  CameraPreset,
  DockTab,
  EndlessCategory,
  EndlessPuzzle,
  GameMode,
  PuzzleLevel,
  SavedProgress,
} from './types/game';
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
  const [view, setView] = useState<AppView>('CHAMBER');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('DESK');
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [dockTab, setDockTab] = useState<DockTab>('PUZZLE');
  const [gameMode, setGameMode] = useState<GameMode>('CAMPAIGN');

  const [activePuzzleId, setActivePuzzleId] = useState<string>(() => {
    const saved = loadInitialProgress();
    const firstUnsolved = STANDARD_PUZZLES.find((p) => !saved.solvedIds.includes(p.id));
    return firstUnsolved ? firstUnsolved.id : STANDARD_PUZZLES[0].id;
  });

  // Endless mode state
  const [endlessCategory, setEndlessCategory] = useState<EndlessCategory>('ARITHMETIC');
  const [endlessPuzzle, setEndlessPuzzle] = useState<EndlessPuzzle>(() =>
    generateEndlessPuzzle('ARITHMETIC')
  );
  const [endlessStreak, setEndlessStreak] = useState(0);
  const [endlessSolved, setEndlessSolved] = useState(false);
  const [endlessShowHint, setEndlessShowHint] = useState(false);

  // 3D Lock Dial state (4 digits 0..9 + cursor for keyboard typing)
  const [digits, setDigits] = useState<[number, number, number, number]>([0, 0, 0, 0]);
  const [typingCursor, setTypingCursor] = useState(0);
  const [caesarShiftValue, setCaesarShiftValue] = useState(-3);
  const [lockFeedback, setLockFeedback] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [leverPulseKey, setLeverPulseKey] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // MPB Player state
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentChord, setCurrentChord] = useState('');

  // Auth, Firestore Cloud Sync & Admin state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [officialBanner, setOfficialBanner] = useState<AdminBannerData | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const progressRef = useRef(progress);
  progressRef.current = progress;
  const skipNextRemoteSaveRef = useRef(false);

  // Sync audio settings, localStorage & Firestore progress
  useEffect(() => {
    soundFX.setEnabled(progress.soundEnabled);
    mpbPlayer.setVolume(progress.musicVolume);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota issues
    }

    if (skipNextRemoteSaveRef.current) {
      skipNextRemoteSaveRef.current = false;
      return;
    }

    if (currentUser && currentUser.emailVerified && cloudSynced) {
      void saveRemoteProgress(currentUser, progress).catch(() => {
        setSyncNotice('Não foi possível sincronizar na nuvem agora. Seu progresso local foi mantido.');
      });
    }
  }, [progress, currentUser, cloudSynced]);

  // Fetch official announcement banner on load
  useEffect(() => {
    void fetchOfficialBanner()
      .then((banner) => {
        if (banner) setOfficialBanner(banner);
      })
      .catch(() => null);
  }, []);

  // Listen to Firebase Auth state & sync Firestore progress
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthReady(true);

      if (!user) {
        setCloudSynced(false);
        setIsAdmin(false);
        setSyncNotice(null);
        return;
      }

      if (user.emailVerified) {
        try {
          const [merged, adminStatus] = await Promise.all([
            ensureUserProfileAndSyncProgress(user, progressRef.current),
            checkIsUserAdmin(user).catch(() => false),
          ]);
          skipNextRemoteSaveRef.current = true;
          setProgress(merged);
          setIsAdmin(adminStatus);
          setCloudSynced(true);
          setSyncNotice(null);
        } catch {
          setCloudSynced(false);
          setIsAdmin(false);
          setSyncNotice('Erro ao sincronizar perfil na nuvem.');
        }
      } else {
        setCloudSynced(false);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to MPB player state & initialize saved track
  useEffect(() => {
    mpbPlayer.setTrack(progress.currentTrackIndex, false);
    mpbPlayer.subscribe(() => {
      setIsMusicPlaying(mpbPlayer.getIsPlaying());
      setCurrentChord(mpbPlayer.getCurrentChordName());
    });
  }, []);

  // Auto-start MPB on first user gesture when musicEnabled is true
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

  // Reset dial feedback when changing active puzzle
  useEffect(() => {
    setFeedbackMsg(null);
    setLockFeedback('IDLE');
    if (gameMode === 'CAMPAIGN' && progress.solvedIds.includes(activePuzzle.id)) {
      const ans = activePuzzle.answer.split('').map((n) => Number(n) || 0);
      setDigits([ans[0] ?? 0, ans[1] ?? 0, ans[2] ?? 0, ans[3] ?? 0]);
      setLockFeedback('SUCCESS');
    } else {
      setDigits([0, 0, 0, 0]);
      setTypingCursor(0);
    }
  }, [activePuzzle.id, gameMode]);

  const plaqueContent: RiddlePlaqueContent = useMemo(() => {
    if (gameMode === 'ENDLESS') {
      return {
        badge: `MODO INFINITO · SEQ ${endlessStreak}`,
        title: endlessPuzzle.title,
        mechanic: endlessPuzzle.category,
        expressions: endlessPuzzle.expressions,
        solved: endlessSolved,
      };
    }
    return {
      badge: activePuzzle.isSecret
        ? `COFRE ${activePuzzle.numberLabel}`
        : `NÍVEL ${activePuzzle.numberLabel} · ${activePuzzle.languages}`,
      title: activePuzzle.title,
      mechanic: activePuzzle.mechanic,
      expressions: activePuzzle.expressions,
      solved: progress.solvedIds.includes(activePuzzle.id),
    };
  }, [gameMode, activePuzzle, progress.solvedIds, endlessPuzzle, endlessSolved, endlessStreak]);

  const handleDialStep = useCallback((slotIndex: number, delta: 1 | -1) => {
    soundFX.playClick();
    setLockFeedback('IDLE');
    setFeedbackMsg(null);
    setDigits((prev) => {
      const next: [number, number, number, number] = [...prev] as [number, number, number, number];
      next[slotIndex] = (next[slotIndex] + delta + 10) % 10;
      return next;
    });
  }, []);

  const handleClearDigits = useCallback(() => {
    soundFX.playClear();
    setDigits([0, 0, 0, 0]);
    setTypingCursor(0);
    setLockFeedback('IDLE');
    setFeedbackMsg(null);
  }, []);

  const handleSubmitCode = useCallback(() => {
    const code = digits.join('');
    setLeverPulseKey((k) => k + 1);

    if (gameMode === 'ENDLESS') {
      if (code === endlessPuzzle.answer) {
        soundFX.playSuccess();
        setLockFeedback('SUCCESS');
        setEndlessSolved(true);
        const nextStreak = endlessStreak + 1;
        setEndlessStreak(nextStreak);
        setFeedbackMsg({
          type: 'success',
          text: `Correto! Sequência atual: ${nextStreak}.`,
        });
        setProgress((prev) => ({
          ...prev,
          endlessSolvedCount: prev.endlessSolvedCount + 1,
          endlessBestStreak: Math.max(prev.endlessBestStreak, nextStreak),
        }));
      } else {
        soundFX.playError();
        setLockFeedback('ERROR');
        setEndlessStreak(0);
        setFeedbackMsg({
          type: 'error',
          text: `Código ${code} incorreto. Sequência reiniciada.`,
        });
      }
      return;
    }

    if (code === activePuzzle.answer) {
      if (activePuzzle.isSecret) {
        soundFX.playVaultUnlock();
        setCameraPreset('VAULTS');
      } else {
        soundFX.playSuccess();
      }
      setLockFeedback('SUCCESS');
      setFeedbackMsg({
        type: 'success',
        text: activePuzzle.isSecret
          ? `${activePuzzle.title} aberto! Veja o cofre se abrindo na parede 3D.`
          : `Nível ${activePuzzle.numberLabel} decifrado com sucesso!`,
      });
      setProgress((prev) => {
        if (prev.solvedIds.includes(activePuzzle.id)) return prev;
        return {
          ...prev,
          solvedIds: [...prev.solvedIds, activePuzzle.id],
        };
      });
    } else {
      soundFX.playError();
      setLockFeedback('ERROR');
      setFeedbackMsg({
        type: 'error',
        text: `Combinação ${code} incorreta. Revise os termos em Inglês e Espanhol.`,
      });
    }
  }, [digits, gameMode, endlessPuzzle, endlessStreak, activePuzzle]);

  // Keyboard controls inside 3D Chamber (H to collapse/expand HUD, 0-9 to spin dials, Enter to pull lever)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (view !== 'CHAMBER') return;

      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setDockCollapsed((c) => !c);
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        const val = Number(e.key);
        soundFX.playClick();
        setLockFeedback('IDLE');
        setFeedbackMsg(null);
        setDigits((prev) => {
          const next: [number, number, number, number] = [...prev] as [
            number,
            number,
            number,
            number,
          ];
          next[typingCursor] = val;
          return next;
        });
        setTypingCursor((c) => (c + 1) % 4);
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        soundFX.playClear();
        const prevSlot = (typingCursor + 3) % 4;
        setDigits((prev) => {
          const next: [number, number, number, number] = [...prev] as [
            number,
            number,
            number,
            number,
          ];
          next[prevSlot] = 0;
          return next;
        });
        setTypingCursor(prevSlot);
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmitCode();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [view, typingCursor, handleSubmitCode]);

  const handleCaesarStep = useCallback((delta: 1 | -1) => {
    soundFX.playClick();
    setCaesarShiftValue((prev) => {
      const next = prev + delta;
      if (next > 13) return -13;
      if (next < -13) return 13;
      return next;
    });
  }, []);

  const handleSelectVaultFrom3D = useCallback(
    (vaultId: string) => {
      soundFX.playClick();
      const targetVault = ALL_PUZZLES.find((p) => p.id === vaultId);
      if (!targetVault) return;

      const reqsMet =
        !targetVault.requiredLevels ||
        targetVault.requiredLevels.every((r) => progressRef.current.solvedIds.includes(r));
      const unlocked =
        progressRef.current.solvedIds.includes(vaultId) ||
        (reqsMet &&
          (!targetVault.requiresMasterKey || progressRef.current.omegaUnlockedWithMasterKey));

      setDockCollapsed(false);
      if (unlocked) {
        setGameMode('CAMPAIGN');
        setActivePuzzleId(vaultId);
        setDockTab('PUZZLE');
      } else {
        setDockTab('VAULTS');
      }
    },
    []
  );

  const handleRevealHint = (puzzleId: string, nextCount: number) => {
    setProgress((prev) => ({
      ...prev,
      hintsUsedByLevel: {
        ...prev.hintsUsedByLevel,
        [puzzleId]: Math.max(prev.hintsUsedByLevel[puzzleId] ?? 0, nextCount),
      },
    }));
  };

  const handleNextPuzzle = () => {
    const idx = STANDARD_PUZZLES.findIndex((p) => p.id === activePuzzle.id);
    if (idx >= 0 && idx < STANDARD_PUZZLES.length - 1) {
      soundFX.playClick();
      setActivePuzzleId(STANDARD_PUZZLES[idx + 1].id);
    }
  };

  const handleSelectEndlessCategory = (cat: EndlessCategory) => {
    soundFX.playClick();
    setEndlessCategory(cat);
    setEndlessPuzzle(generateEndlessPuzzle(cat));
    setEndlessSolved(false);
    setEndlessShowHint(false);
    setDigits([0, 0, 0, 0]);
    setTypingCursor(0);
    setFeedbackMsg(null);
    setLockFeedback('IDLE');
  };

  const handleNewEndlessPuzzle = () => {
    soundFX.playClick();
    setEndlessPuzzle(generateEndlessPuzzle(endlessCategory));
    setEndlessSolved(false);
    setEndlessShowHint(false);
    setDigits([0, 0, 0, 0]);
    setTypingCursor(0);
    setFeedbackMsg(null);
    setLockFeedback('IDLE');
  };

  const handleToggleMusic = useCallback(() => {
    const nowPlaying = mpbPlayer.toggle();
    setIsMusicPlaying(nowPlaying);
    setProgress((prev) => ({ ...prev, musicEnabled: nowPlaying }));
  }, []);

  const handlePrevTrack = () => {
    mpbPlayer.prevTrack();
    const nextIdx = mpbPlayer.getTrackIndex();
    if (!mpbPlayer.getIsPlaying()) mpbPlayer.start();
    setProgress((prev) => ({ ...prev, currentTrackIndex: nextIdx, musicEnabled: true }));
  };

  const handleNextTrack = () => {
    mpbPlayer.nextTrack();
    const nextIdx = mpbPlayer.getTrackIndex();
    if (!mpbPlayer.getIsPlaying()) mpbPlayer.start();
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
    setDigits([0, 0, 0, 0]);
    setLockFeedback('IDLE');
    setFeedbackMsg(null);
  };

  const handleUnlockOmega = () => {
    setProgress((prev) => ({ ...prev, omegaUnlockedWithMasterKey: true }));
  };

  const handleUnlockAllForAdmin = () => {
    setProgress((prev) => ({
      ...prev,
      solvedIds: ALL_PUZZLES.map((p) => p.id),
      omegaUnlockedWithMasterKey: true,
    }));
  };

  const handleSignOut = async () => {
    soundFX.playClick();
    await signOut(auth);
    setCloudSynced(false);
    setIsAdmin(false);
    setSyncNotice(null);
    setView('CHAMBER');
  };

  const handleResendVerification = async () => {
    if (!currentUser) return;
    soundFX.playClick();
    try {
      await sendEmailVerification(currentUser);
      setSyncNotice('E-mail de confirmação reenviado! Verifique sua caixa de entrada.');
    } catch {
      setSyncNotice('Aguarde alguns instantes antes de reenviar o e-mail.');
    }
  };

  const handleCheckVerification = async () => {
    if (!currentUser) return;
    soundFX.playClick();
    try {
      await reload(currentUser);
      if (auth.currentUser?.emailVerified) {
        const [merged, adminStatus] = await Promise.all([
          ensureUserProfileAndSyncProgress(auth.currentUser, progressRef.current),
          checkIsUserAdmin(auth.currentUser).catch(() => false),
        ]);
        skipNextRemoteSaveRef.current = true;
        setCurrentUser({ ...auth.currentUser } as User);
        setProgress(merged);
        setIsAdmin(adminStatus);
        setCloudSynced(true);
        setSyncNotice('E-mail confirmado e progresso sincronizado!');
      } else {
        setSyncNotice('E-mail ainda não confirmado. Clique no link enviado para sua caixa de entrada.');
      }
    } catch {
      setSyncNotice('Não foi possível verificar o status agora.');
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden bg-[#0B1320] text-[#F1F5F9]">
      {/* Full-Viewport Interactive 3D Cryptographic Chamber */}
      <VaultScene3D
        digits={digits}
        caesarShift={caesarShiftValue}
        solvedIds={progress.solvedIds}
        isMusicPlaying={isMusicPlaying}
        cameraPreset={cameraPreset}
        plaqueContent={plaqueContent}
        lockFeedback={lockFeedback}
        leverPulseKey={leverPulseKey}
        onDialStep={handleDialStep}
        onSubmitCode={handleSubmitCode}
        onClearCode={handleClearDigits}
        onCaesarStep={handleCaesarStep}
        onToggleMusic={handleToggleMusic}
        onSelectVault={handleSelectVaultFrom3D}
        onCameraPresetChange={setCameraPreset}
      />

      {/* Strict 3-Zone Top Bar */}
      <header className="relative z-30 border-b border-slate-800/90 bg-[#0B1320]/95">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setView('CHAMBER');
              setCameraPreset('DESK');
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
              onClick={() => {
                soundFX.playClick();
                setView('CHAMBER');
                setGameMode('CAMPAIGN');
                setDockTab('PUZZLE');
                setDockCollapsed(false);
                setCameraPreset('DESK');
              }}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                view === 'CHAMBER' && gameMode === 'CAMPAIGN' && dockTab !== 'VAULTS'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-300 hover:text-slate-50'
              }`}
            >
              Câmara 3D
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setView('CHAMBER');
                setDockTab('VAULTS');
                setDockCollapsed(false);
                setCameraPreset('VAULTS');
              }}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                view === 'CHAMBER' && dockTab === 'VAULTS'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-300 hover:text-slate-50'
              }`}
            >
              Cofres 3D
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setView('CHAMBER');
                setGameMode('ENDLESS');
                setDockTab('PUZZLE');
                setDockCollapsed(false);
                setCameraPreset('DESK');
              }}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                view === 'CHAMBER' && gameMode === 'ENDLESS'
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
            {!currentUser && (
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setView('REGISTER');
                }}
                className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  view === 'REGISTER'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-300 hover:text-slate-50'
                }`}
              >
                Cadastro
              </button>
            )}
            {currentUser && isAdmin && (
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setView('ADMIN');
                }}
                className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  view === 'ADMIN'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-amber-300/90 hover:text-amber-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="shrink-0">
            {currentUser ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Sair</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setView('LOGIN');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Entrar
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav
          aria-label="Navegação móvel"
          className="flex md:hidden items-center justify-between gap-4 px-4 pb-2.5 pt-1.5 border-t border-slate-800/60 overflow-x-auto text-xs font-medium"
        >
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setView('CHAMBER');
              setGameMode('CAMPAIGN');
              setDockTab('PUZZLE');
            }}
            className={`whitespace-nowrap shrink-0 ${
              view === 'CHAMBER' && gameMode === 'CAMPAIGN' ? 'text-amber-300 font-semibold' : 'text-slate-300'
            }`}
          >
            Câmara 3D
          </button>
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setView('CHAMBER');
              setDockTab('VAULTS');
              setCameraPreset('VAULTS');
            }}
            className="whitespace-nowrap shrink-0 text-slate-300"
          >
            Cofres 3D
          </button>
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setView('CHAMBER');
              setGameMode('ENDLESS');
              setDockTab('PUZZLE');
            }}
            className="whitespace-nowrap shrink-0 text-slate-300"
          >
            Infinito
          </button>
          <button
            type="button"
            onClick={() => setView('RULES')}
            className="whitespace-nowrap shrink-0 text-slate-300"
          >
            Regras
          </button>
          {currentUser && isAdmin && (
            <button
              type="button"
              onClick={() => setView('ADMIN')}
              className="whitespace-nowrap shrink-0 text-amber-300 font-semibold"
            >
              Admin
            </button>
          )}
          {!currentUser && (
            <button
              type="button"
              onClick={() => setView('REGISTER')}
              className="whitespace-nowrap shrink-0 text-amber-300"
            >
              Cadastro
            </button>
          )}
        </nav>
      </header>

      {/* Non-occluding Top Account & Official Banner Strip in 3D Chamber */}
      {view === 'CHAMBER' && (
        <div className="relative z-20 max-w-[1280px] mx-auto px-4 sm:px-6 pt-3 flex flex-col gap-2 pointer-events-none">
          {authReady && (
            <div className="pointer-events-auto self-start flex flex-wrap items-center gap-2.5 px-3.5 py-2 rounded-lg bg-[#0B1320]/90 border border-slate-800 text-xs">
              {currentUser ? (
                currentUser.emailVerified ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                    <span className="text-slate-200 font-medium">
                      {currentUser.displayName || currentUser.email}
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <CloudCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>{cloudSynced ? 'Nuvem ativa' : 'Sincronizando'}</span>
                    </span>
                    {isAdmin && (
                      <>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <button
                          type="button"
                          onClick={() => setView('ADMIN')}
                          className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 font-semibold cursor-pointer"
                        >
                          <Shield className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span>
                            {currentUser.email === BOOTSTRAPPED_ADMIN_EMAIL
                              ? 'Lucas Admin'
                              : 'Painel Admin'}
                          </span>
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 text-amber-200">
                    <MailCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
                    <span>Confirme seu e-mail ({currentUser.email})</span>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      className="underline text-slate-200 cursor-pointer"
                    >
                      Reenviar
                    </button>
                    <button
                      type="button"
                      onClick={handleCheckVerification}
                      className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-semibold cursor-pointer"
                    >
                      Já confirmei
                    </button>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2 text-slate-300">
                  <span>Modo Visitante</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <button
                    type="button"
                    onClick={() => setView('LOGIN')}
                    className="text-amber-300 hover:underline font-medium cursor-pointer"
                  >
                    Entrar para salvar na nuvem
                  </button>
                </div>
              )}
            </div>
          )}

          {syncNotice && (
            <div
              role="status"
              className="pointer-events-auto self-start px-3.5 py-2 rounded-lg bg-[#0B1320]/95 border border-amber-500/40 text-xs text-amber-200 flex items-center gap-3"
            >
              <span>{syncNotice}</span>
              <button
                type="button"
                onClick={() => setSyncNotice(null)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          )}

          {officialBanner && officialBanner.active && (
            <div
              role="region"
              aria-label="Comunicado oficial do administrador"
              className="pointer-events-auto self-start max-w-xl px-3.5 py-2.5 rounded-lg bg-[#0B1320]/95 border border-amber-500/40 flex items-start gap-2.5 text-xs"
            >
              <Megaphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex flex-col gap-0.5">
                <strong className="text-amber-300">{officialBanner.title}</strong>
                <span className="text-slate-200">{officialBanner.message}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsible 3D Bottom Control & Puzzle Dock */}
      {view === 'CHAMBER' && (
        <Hud3DDock
          collapsed={dockCollapsed}
          onToggleCollapsed={() => setDockCollapsed((c) => !c)}
          activeTab={dockTab}
          onTabChange={setDockTab}
          cameraPreset={cameraPreset}
          onCameraPresetChange={setCameraPreset}
          gameMode={gameMode}
          onGameModeChange={setGameMode}
          activePuzzle={activePuzzle}
          onSelectPuzzleId={setActivePuzzleId}
          endlessCategory={endlessCategory}
          endlessPuzzle={endlessPuzzle}
          endlessStreak={endlessStreak}
          endlessSolved={endlessSolved}
          endlessShowHint={endlessShowHint}
          onSelectEndlessCategory={handleSelectEndlessCategory}
          onNewEndlessPuzzle={handleNewEndlessPuzzle}
          onToggleEndlessHint={() => setEndlessShowHint((h) => !h)}
          progress={progress}
          digits={digits}
          onDialStep={handleDialStep}
          onClearDigits={handleClearDigits}
          onSubmitCode={handleSubmitCode}
          feedbackMsg={feedbackMsg}
          onRevealHint={handleRevealHint}
          onNextPuzzle={handleNextPuzzle}
          caesarShiftValue={caesarShiftValue}
          onCaesarShiftChange={setCaesarShiftValue}
          onUnlockOmegaWithMasterKey={handleUnlockOmega}
          isMusicPlaying={isMusicPlaying}
          currentChord={currentChord}
          onToggleMusic={handleToggleMusic}
          onPrevTrack={handlePrevTrack}
          onNextTrack={handleNextTrack}
          onSelectTrack={handleSelectTrack}
          onVolumeChange={handleVolumeChange}
          onToggleSound={handleToggleSound}
          onResetProgress={handleResetProgress}
        />
      )}

      {/* Overlay Views (Rules, Login, Cadastro, Admin) */}
      {view !== 'CHAMBER' && (
        <div className="relative z-30 min-h-[calc(100vh-64px)] bg-[#0B1320]/92 px-4 sm:px-6 py-8">
          <div className="max-w-[1160px] mx-auto flex flex-col gap-6">
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setView('CHAMBER');
              }}
              className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 bg-[#121D31] hover:bg-slate-800 text-xs font-semibold text-amber-300 cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Voltar para Câmara 3D</span>
            </button>

            {view === 'RULES' && (
              <RulesView
                onPlayNow={() => {
                  setView('CHAMBER');
                  setCameraPreset('DESK');
                }}
              />
            )}

            {(view === 'LOGIN' || view === 'REGISTER') && (
              <AuthPages
                mode={view}
                onSwitchMode={(nextMode) => setView(nextMode)}
                onAuthSuccess={() => {
                  setView('CHAMBER');
                  setCameraPreset('DESK');
                }}
              />
            )}

            {view === 'ADMIN' && currentUser && isAdmin && (
              <AdminPanel
                currentUser={currentUser}
                onUnlockAllForAdmin={handleUnlockAllForAdmin}
                onBannerUpdated={(banner) => setOfficialBanner(banner)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
