import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Delete,
  KeyRound,
  Lightbulb,
  LockOpen,
} from 'lucide-react';
import { PuzzleLevel } from '../types/game';
import { soundFX } from '../utils/sound';

interface PuzzleBoardProps {
  puzzle: PuzzleLevel;
  isSolved: boolean;
  revealedHintCount: number;
  hasNextPuzzle: boolean;
  onRevealHint: (puzzleId: string, nextCount: number) => void;
  onSolved: (puzzle: PuzzleLevel) => void;
  onNextPuzzle: () => void;
  onGoToVaults: () => void;
}

export function PuzzleBoard({
  puzzle,
  isSolved,
  revealedHintCount,
  hasNextPuzzle,
  onRevealHint,
  onSolved,
  onNextPuzzle,
  onGoToVaults,
}: PuzzleBoardProps) {
  const [digits, setDigits] = useState<string>(isSolved ? puzzle.answer : '');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(
    null
  );

  // Sync input when switching puzzles
  useEffect(() => {
    setDigits(isSolved ? puzzle.answer : '');
    setFeedback(null);
  }, [puzzle.id, isSolved, puzzle.answer]);

  const handleAppendDigit = (d: string) => {
    if (isSolved) return;
    setFeedback(null);
    setDigits((prev) => {
      if (prev.length >= 4) return prev;
      soundFX.playClick();
      return prev + d;
    });
  };

  const handleBackspace = () => {
    if (isSolved) return;
    setFeedback(null);
    setDigits((prev) => {
      if (!prev.length) return prev;
      soundFX.playClear();
      return prev.slice(0, -1);
    });
  };

  const handleClear = () => {
    if (isSolved) return;
    setFeedback(null);
    soundFX.playClear();
    setDigits('');
  };

  const handleSubmit = () => {
    if (isSolved) return;
    if (digits.length < 4) {
      soundFX.playError();
      setFeedback({
        type: 'error',
        message: 'Preencha todos os 4 dígitos antes de verificar a combinação.',
      });
      return;
    }

    if (digits === puzzle.answer) {
      if (puzzle.isSecret) {
        soundFX.playVaultUnlock();
      } else {
        soundFX.playSuccess();
      }
      setFeedback({
        type: 'success',
        message: puzzle.isSecret
          ? 'Cofre secreto destravado com sucesso.'
          : `Código correto! Você obteve o dígito mestre ${puzzle.masterDigit}.`,
      });
      onSolved(puzzle);
    } else {
      soundFX.playError();
      setFeedback({
        type: 'error',
        message: 'Combinação incorreta. Confira os cálculos na Mesa de Decifração.',
      });
    }
  };

  // Physical keyboard support for digits 0-9, Backspace, Enter
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleAppendDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const handleNextHint = () => {
    if (revealedHintCount >= 3) return;
    soundFX.playClick();
    onRevealHint(puzzle.id, revealedHintCount + 1);
  };

  const visibleHints = puzzle.hints.slice(0, revealedHintCount);

  return (
    <section
      aria-label={`Enigma ${puzzle.numberLabel}: ${puzzle.title}`}
      className="bg-[#121D31] border border-slate-700/70 rounded-xl p-6 md:p-8 flex flex-col gap-6"
    >
      {/* Metadata & Title */}
      <div className="flex flex-col gap-2 border-b border-slate-700/70 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-amber-400 tabular-nums">
              {puzzle.isSecret ? `Arquivo Secreto ${puzzle.numberLabel}` : `Nível ${puzzle.numberLabel}`}
            </span>
            <span aria-hidden="true">·</span>
            <span>{puzzle.mechanic}</span>
            <span aria-hidden="true">·</span>
            <span>{puzzle.languages}</span>
          </div>
          {isSolved && (
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Decifrado</span>
            </div>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-50 font-display">
          {puzzle.title}
        </h1>
        <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
          {puzzle.briefing}
        </p>
      </div>

      {/* Cipher Expressions Sheet (High-contrast archival paper surface) */}
      <div className="bg-[#F8FAFC] text-[#0F172A] rounded-lg p-5 md:p-6 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <span className="text-xs font-semibold text-slate-600">
            Registro Criptográfico
          </span>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            Senha de 4 dígitos
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {puzzle.expressions.map((expr, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5 border-b border-slate-200/80 last:border-b-0 last:pb-0"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{expr.label}</span>
                  <span aria-hidden="true">·</span>
                  <span>{expr.language}</span>
                </div>
                {expr.detail && (
                  <span className="text-xs text-slate-500 mt-0.5">{expr.detail}</span>
                )}
              </div>

              <div className="font-mono text-base md:text-lg font-bold tracking-wide text-[#0F172A] bg-slate-100 px-3.5 py-2 rounded-md border border-slate-200 tabular-nums">
                {expr.code}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs md:text-sm font-medium text-slate-700 pt-2 border-t border-slate-200">
          {puzzle.instruction}
        </p>
      </div>

      {/* Mechanical 4-Digit Combination Dial & Keypad */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0B1320] border border-slate-800 rounded-xl p-5">
          {/* Paired Digit Slots */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Left Pair */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2">
                {[0, 1].map((slotIdx) => {
                  const char = digits[slotIdx] ?? '';
                  const isActive = !isSolved && digits.length === slotIdx;
                  return (
                    <div
                      key={slotIdx}
                      className={`w-12 h-14 md:w-14 md:h-16 rounded-lg border flex items-center justify-center font-mono text-2xl md:text-3xl font-bold tabular-nums transition-colors ${
                        isSolved
                          ? 'bg-emerald-950/50 border-emerald-500/70 text-emerald-300'
                          : isActive
                          ? 'bg-[#19263E] border-amber-400 text-amber-300'
                          : char
                          ? 'bg-[#162033] border-slate-600 text-slate-100'
                          : 'bg-[#111929] border-slate-800 text-slate-600'
                      }`}
                    >
                      {char || '•'}
                    </div>
                  );
                })}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {puzzle.slotLabels[0]}
              </span>
            </div>

            <span className="text-slate-600 font-mono text-xl pb-5" aria-hidden="true">
              —
            </span>

            {/* Right Pair */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2">
                {[2, 3].map((slotIdx) => {
                  const char = digits[slotIdx] ?? '';
                  const isActive = !isSolved && digits.length === slotIdx;
                  return (
                    <div
                      key={slotIdx}
                      className={`w-12 h-14 md:w-14 md:h-16 rounded-lg border flex items-center justify-center font-mono text-2xl md:text-3xl font-bold tabular-nums transition-colors ${
                        isSolved
                          ? 'bg-emerald-950/50 border-emerald-500/70 text-emerald-300'
                          : isActive
                          ? 'bg-[#19263E] border-amber-400 text-amber-300'
                          : char
                          ? 'bg-[#162033] border-slate-600 text-slate-100'
                          : 'bg-[#111929] border-slate-800 text-slate-600'
                      }`}
                    >
                      {char || '•'}
                    </div>
                  );
                })}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {puzzle.slotLabels[1]}
              </span>
            </div>
          </div>

          {/* Primary Verification Action */}
          {!isSolved ? (
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleClear}
                disabled={!digits.length}
                className="px-4 py-3 text-sm font-medium rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 sm:flex-initial px-6 py-3 text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300"
              >
                Verificar Código
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {hasNextPuzzle ? (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    onNextPuzzle();
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Próximo Enigma</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    onGoToVaults();
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <LockOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Ver Cofres Secretos</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Non-hue-only Validation Banner */}
        {feedback && (
          <div
            role="status"
            aria-live="polite"
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border text-sm ${
              feedback.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-700/70 text-emerald-200'
                : 'bg-rose-950/40 border-rose-700/70 text-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Tactile Numeric Keypad (when unsolved) */}
        {!isSolved && (
          <div className="grid grid-cols-6 sm:grid-cols-11 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleAppendDigit(num)}
                className="min-h-[44px] rounded-lg bg-[#19263E] hover:bg-[#243656] active:scale-95 border border-slate-700/70 font-mono text-base font-semibold text-slate-100 tabular-nums transition-transform cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              aria-label="Apagar último dígito"
              onClick={handleBackspace}
              className="col-span-2 sm:col-span-1 min-h-[44px] rounded-lg bg-[#162033] hover:bg-slate-800 border border-slate-700/70 flex items-center justify-center text-slate-300 transition-colors cursor-pointer"
            >
              <Delete className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Solved Explanation & Master Digit Reward */}
      {isSolved && (
        <div className="bg-[#0B1320] border border-emerald-800/60 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-emerald-300">
              Resolução Passo a Passo
            </h3>
            {puzzle.masterDigit !== undefined && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-300">
                <KeyRound className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className="tabular-nums">
                  Dígito Mestre coletado: {puzzle.masterDigit}
                </span>
              </div>
            )}
          </div>
          <ul className="flex flex-col gap-1.5 text-sm text-slate-300 list-disc list-inside">
            {puzzle.solutionSteps.map((step, i) => (
              <li key={i} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 3-Tier Progressive Hint System */}
      {!isSolved && (
        <div className="border-t border-slate-700/70 pt-5 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
              <span>
                Dicas reveladas: <strong className="text-slate-200 tabular-nums">{revealedHintCount}/3</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={handleNextHint}
              disabled={revealedHintCount >= 3}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {revealedHintCount >= 3 ? 'Todas as dicas abertas' : `Pedir Dica ${revealedHintCount + 1}`}
            </button>
          </div>

          {visibleHints.length > 0 && (
            <div className="flex flex-col gap-2">
              {visibleHints.map((hint) => (
                <div
                  key={hint.tier}
                  className="bg-[#0B1320] border border-slate-800 rounded-lg px-4 py-3 text-xs md:text-sm text-slate-300"
                >
                  <span className="font-semibold text-amber-400 mr-2">
                    Dica {hint.tier} · {hint.title}:
                  </span>
                  <span>{hint.content}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
