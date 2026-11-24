import { useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, KeyRound, Lock, LockOpen } from 'lucide-react';
import { MASTER_KEY_CODE, SECRET_PUZZLES, STANDARD_PUZZLES } from '../data/puzzles';
import { PuzzleLevel } from '../types/game';
import { soundFX } from '../utils/sound';

interface VaultArchiveProps {
  solvedIds: string[];
  omegaUnlockedWithMasterKey: boolean;
  onUnlockOmega: () => void;
  onSelectSecretPuzzle: (puzzle: PuzzleLevel) => void;
}

export function VaultArchive({
  solvedIds,
  omegaUnlockedWithMasterKey,
  onUnlockOmega,
  onSelectSecretPuzzle,
}: VaultArchiveProps) {
  const [masterInput, setMasterInput] = useState('');
  const [masterError, setMasterError] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  const solvedStandardCount = STANDARD_PUZZLES.filter((p) => solvedIds.includes(p.id)).length;
  const allStandardSolved = solvedStandardCount === STANDARD_PUZZLES.length;

  const handleVerifyMasterKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allStandardSolved) return;
    if (masterInput.trim() === MASTER_KEY_CODE) {
      soundFX.playVaultUnlock();
      setMasterError(null);
      onUnlockOmega();
    } else {
      soundFX.playError();
      setMasterError('Sequência incorreta. Confira os 6 Dígitos Mestres coletados acima.');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header Split with Secret Vault Emblem */}
      <section className="bg-[#121D31] border border-slate-700/70 rounded-xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6 items-center">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono font-semibold text-amber-400">Cofres Secretos</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{solvedStandardCount}/6 Chaves Coletadas</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-50 font-display">
            Câmara de Desbloqueio Secreto
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
            Cada enigma resolvido na campanha principal libera um Dígito Mestre. Acumule chaves para destravar os três cofres ocultos e decifrar as transmissões bilíngues avançadas.
          </p>

          {/* Master Key 6-Digit Ledger */}
          <div className="pt-2">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
              <span>Chave Mestra Acumulada (Níveis 01 a 06)</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {STANDARD_PUZZLES.map((lv) => {
                const unlocked = solvedIds.includes(lv.id);
                return (
                  <div
                    key={lv.id}
                    className={`w-12 h-14 rounded-lg border flex flex-col items-center justify-center tabular-nums ${
                      unlocked
                        ? 'bg-[#0B1320] border-amber-500/60 text-amber-300'
                        : 'bg-[#0B1320]/60 border-slate-800 text-slate-600'
                    }`}
                  >
                    <span className="font-mono text-lg font-bold leading-none">
                      {unlocked ? lv.masterDigit : '?'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      N{lv.numberLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Visual Emblem */}
        <div className="w-full max-w-[240px] mx-auto aspect-square rounded-xl overflow-hidden border border-slate-700/70 bg-[#0B1320] flex items-center justify-center">
          {!imgFailed ? (
            <img
              src="/src/assets/images/secret_vault_emblem_1795517745599.jpg"
              alt="Mostrador mecânico de latão do cofre secreto"
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center gap-2 text-amber-400/80">
              <Lock className="w-10 h-10" aria-hidden="true" />
              <span className="text-xs font-mono text-slate-400">Cofre Secreto</span>
            </div>
          )}
        </div>
      </section>

      {/* 3 Secret Vault Cards */}
      <section aria-label="Lista de Cofres Secretos" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SECRET_PUZZLES.map((vault) => {
          const reqs = vault.requiredLevels ?? [];
          const metCount = reqs.filter((id) => solvedIds.includes(id)).length;
          const prereqsMet = metCount === reqs.length;
          const isVaultSolved = solvedIds.includes(vault.id);
          const isAccessible = vault.requiresMasterKey
            ? prereqsMet && omegaUnlockedWithMasterKey
            : prereqsMet;

          return (
            <article
              key={vault.id}
              className="bg-[#121D31] border border-slate-700/70 rounded-xl p-6 flex flex-col justify-between gap-5"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                  <span className="font-mono font-semibold text-amber-400">
                    Arquivo {vault.numberLabel}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    {isVaultSolved ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                        <span className="text-emerald-400">Concluído</span>
                      </>
                    ) : isAccessible ? (
                      <>
                        <LockOpen className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
                        <span className="text-amber-300">Desbloqueado</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                        <span className="text-slate-400">Bloqueado</span>
                      </>
                    )}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-100 font-display">
                  {vault.title}
                </h2>
                <p className="text-xs text-slate-400">
                  {vault.mechanic} · {vault.languages}
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {isAccessible
                    ? vault.briefing
                    : vault.requiresMasterKey
                    ? 'Resolva todos os 6 níveis da campanha e insira a Chave Mestra de 6 dígitos para abrir este arquivo.'
                    : `Requer a conclusão dos níveis ${reqs
                        .map((id) => id.replace('lv-', ''))
                        .join(', ')} (${metCount}/${reqs.length} concluídos).`}
                </p>
              </div>

              {/* Omega Master Key Dial Form */}
              {vault.requiresMasterKey && prereqsMet && !omegaUnlockedWithMasterKey ? (
                <form onSubmit={handleVerifyMasterKey} className="flex flex-col gap-2.5 pt-2 border-t border-slate-800">
                  <label
                    htmlFor="master-key-input"
                    className="text-xs font-medium text-amber-300"
                  >
                    Digite a Chave Mestra de 6 dígitos
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="master-key-input"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={masterInput}
                      onChange={(e) => {
                        setMasterError(null);
                        setMasterInput(e.target.value.replace(/[^0-9]/g, ''));
                      }}
                      placeholder="••••••"
                      className="flex-1 min-w-0 px-3 py-2.5 bg-[#0B1320] border border-slate-700 rounded-lg font-mono text-base tracking-[0.25em] text-center text-slate-100 focus:outline-none focus:border-amber-400 tabular-nums"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Destravar
                    </button>
                  </div>
                  {masterError && (
                    <div className="flex items-start gap-1.5 text-xs text-rose-300">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{masterError}</span>
                    </div>
                  )}
                </form>
              ) : (
                <div className="pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    disabled={!isAccessible}
                    onClick={() => {
                      soundFX.playClick();
                      onSelectSecretPuzzle(vault);
                    }}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      isAccessible
                        ? isVaultSolved
                          ? 'bg-[#19263E] hover:bg-[#233454] text-emerald-300 border border-emerald-700/50'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        : 'bg-[#0B1320] text-slate-500 border border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    <span>
                      {!isAccessible
                        ? `Faltam ${reqs.length - metCount} chaves`
                        : isVaultSolved
                        ? 'Rever Enigma'
                        : 'Abrir Enigma Secreto'}
                    </span>
                    {isAccessible && <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
