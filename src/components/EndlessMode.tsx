import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
} from 'lucide-react';
import { generateEndlessPuzzle } from '../data/puzzles';
import { EndlessCategory, EndlessPuzzle } from '../types/game';
import { soundFX } from '../utils/sound';

interface EndlessModeProps {
  totalSolved: number;
  bestStreak: number;
  onRecordSolve: (currentStreak: number) => void;
}

const CATEGORIES: { id: EndlessCategory; label: string }[] = [
  { id: 'ARITHMETIC', label: 'Aritmética EN/ES' },
  { id: 'A1Z26', label: 'Soma A1Z26' },
  { id: 'CAESAR', label: 'Cifra de César' },
];

export function EndlessMode({
  totalSolved,
  bestStreak,
  onRecordSolve,
}: EndlessModeProps) {
  const [category, setCategory] = useState<EndlessCategory>('ARITHMETIC');
  const [challenge, setChallenge] = useState<EndlessPuzzle>(() =>
    generateEndlessPuzzle('ARITHMETIC')
  );
  const [inputCode, setInputCode] = useState('');
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [solvedCurrent, setSolvedCurrent] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(
    null
  );

  const loadNewChallenge = (nextCat: EndlessCategory) => {
    soundFX.playClick();
    setCategory(nextCat);
    setChallenge(generateEndlessPuzzle(nextCat));
    setInputCode('');
    setShowHint(false);
    setSolvedCurrent(false);
    setFeedback(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (solvedCurrent) return;

    if (inputCode.length < 4) {
      soundFX.playError();
      setFeedback({
        type: 'error',
        message: 'Digite os 4 dígitos da resposta.',
      });
      return;
    }

    if (inputCode === challenge.answer) {
      soundFX.playSuccess();
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setSolvedCurrent(true);
      setFeedback({
        type: 'success',
        message: challenge.solutionExplanation,
      });
      onRecordSolve(nextStreak);
    } else {
      soundFX.playError();
      setStreak(0);
      setFeedback({
        type: 'error',
        message: 'Código incorreto. A sequência atual foi zerada — tente novamente ou peça a dica.',
      });
    }
  };

  return (
    <section
      aria-label="Modo Infinito de Treino"
      className="bg-[#121D31] border border-slate-700/70 rounded-xl p-6 md:p-8 flex flex-col gap-6"
    >
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/70 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono font-semibold text-amber-400">Modo Infinito</span>
            <span aria-hidden="true">·</span>
            <span>Gerador Bilíngue</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-50 font-display mt-1">
            Treino de Cifras Numéricas
          </h1>
        </div>

        <div className="flex items-center gap-5 text-xs text-slate-300 tabular-nums">
          <div>
            <div className="text-slate-400">Sequência</div>
            <div className="font-mono text-lg font-bold text-amber-400">{streak}</div>
          </div>
          <div className="h-8 w-px bg-slate-700/70" aria-hidden="true" />
          <div>
            <div className="text-slate-400">Recorde</div>
            <div className="font-mono text-lg font-bold text-slate-100">{bestStreak}</div>
          </div>
          <div className="h-8 w-px bg-slate-700/70" aria-hidden="true" />
          <div>
            <div className="text-slate-400">Total</div>
            <div className="font-mono text-lg font-bold text-emerald-400">{totalSolved}</div>
          </div>
        </div>
      </div>

      {/* Category Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#0B1320] rounded-lg border border-slate-800">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => loadNewChallenge(cat.id)}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                category === cat.id
                  ? 'bg-[#1E2D47] text-amber-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => loadNewChallenge(category)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Novo Enigma</span>
        </button>
      </div>

      {/* Generated Cipher Card */}
      <div className="bg-[#F8FAFC] text-[#0F172A] rounded-lg p-5 md:p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-display">{challenge.title}</h2>
          <p className="text-sm text-slate-600 mt-1">{challenge.briefing}</p>
        </div>

        <div className="flex flex-col gap-3">
          {challenge.expressions.map((expr, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5 border-b border-slate-200 last:border-b-0 last:pb-0"
            >
              <div>
                <div className="text-xs font-semibold text-slate-700">
                  {expr.label} · {expr.language}
                </div>
                {expr.detail && <div className="text-xs text-slate-500">{expr.detail}</div>}
              </div>
              <div className="font-mono text-base font-bold text-[#0F172A] bg-slate-100 px-3.5 py-2 rounded-md border border-slate-200 tabular-nums">
                {expr.code}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs md:text-sm font-medium text-slate-700 pt-2 border-t border-slate-200">
          {challenge.instruction}
        </p>
      </div>

      {/* Input & Actions */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#0B1320] border border-slate-800 rounded-xl p-4"
      >
        <input
          type="text"
          inputMode="numeric"
          maxLength={4}
          disabled={solvedCurrent}
          value={inputCode}
          onChange={(e) => {
            setFeedback(null);
            setInputCode(e.target.value.replace(/[^0-9]/g, ''));
          }}
          placeholder="0000"
          aria-label="Digite o código de 4 dígitos"
          className="sm:w-44 px-4 py-3 bg-[#121D31] border border-slate-700 rounded-lg font-mono text-xl font-bold tracking-[0.3em] text-center text-slate-100 focus:outline-none focus:border-amber-400 tabular-nums"
        />

        <div className="flex items-center gap-2.5 flex-1 justify-end">
          {!solvedCurrent ? (
            <>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setShowHint((v) => !v);
                }}
                className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                <span>{showHint ? 'Ocultar Dica' : 'Ver Dica'}</span>
              </button>
              <button
                type="submit"
                className="px-6 py-3 text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Verificar Código
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => loadNewChallenge(category)}
              className="px-6 py-3 text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Gerar Próximo
            </button>
          )}
        </div>
      </form>

      {showHint && !solvedCurrent && (
        <div className="bg-[#0B1320] border border-slate-800 rounded-lg px-4 py-3 text-xs md:text-sm text-amber-200">
          <strong className="text-amber-400 mr-2">Dica:</strong>
          {challenge.hint}
        </div>
      )}

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
    </section>
  );
}
