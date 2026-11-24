import { useState } from 'react';
import { ArrowRight, KeyRound, LockOpen, ShieldCheck } from 'lucide-react';
import { soundFX } from '../utils/sound';

interface TitleHeroProps {
  solvedStandardCount: number;
  solvedSecretCount: number;
  onStartCampaign: () => void;
  onOpenVaults: () => void;
}

export function TitleHero({
  solvedStandardCount,
  solvedSecretCount,
  onStartCampaign,
  onOpenVaults,
}: TitleHeroProps) {
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  return (
    <div className="flex flex-col gap-10">
      {/* 2-Column Balanced Hero Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 bg-[#121D31] border border-slate-700/70 rounded-xl p-7 md:p-10 flex flex-col justify-between gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-mono font-semibold text-amber-400">Criptografia Bilíngue</span>
              <span aria-hidden="true">·</span>
              <span>Inglês &amp; Espanhol</span>
              <span aria-hidden="true">·</span>
              <span>Enigmas Numéricos</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-50 font-display leading-[1.15] max-w-2xl">
              Decifre códigos em dois idiomas para abrir os cofres secretos.
            </h1>

            <p className="text-base text-slate-300 leading-relaxed max-w-xl">
              Traduza números escritos em Inglês e Espanhol, calcule somas alfabéticas (A1Z26) e gire a Roda de César na Mesa de Decifração. Cada enigma resolvido revela um Dígito Mestre rumo aos arquivos secretos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onStartCampaign();
              }}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300"
            >
              <span>{solvedStandardCount > 0 ? 'Continuar Campanha' : 'Iniciar Campanha'}</span>
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onOpenVaults();
              }}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LockOpen className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
              <span>Cofres Secretos</span>
            </button>
          </div>
        </div>

        {/* Hero Photography Frame */}
        <div className="lg:col-span-5 rounded-xl overflow-hidden border border-slate-700/70 bg-[#121D31] min-h-[260px]">
          {!heroImgFailed ? (
            <img
              src="/src/assets/images/cipher_desk_hero_1795517745061.jpg"
              alt="Mesa de criptografia com disco cifrador de latão, cilindro numérico e fichas de arquivo"
              referrerPolicy="no-referrer"
              onError={() => setHeroImgFailed(true)}
              className="w-full h-full object-cover lg:h-full"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center gap-3 bg-[#0B1320]">
              <KeyRound className="w-12 h-12 text-amber-400" aria-hidden="true" />
              <p className="font-display text-lg text-slate-200">Arquivo Cifra</p>
            </div>
          )}
        </div>
      </section>

      {/* Full-Width 3-Column Feature & Progress Strip */}
      <section
        aria-label="Como funciona a progressão"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-[#121D31] border border-slate-700/70 rounded-xl p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono font-semibold text-amber-400">01. Campanha</span>
            <span className="font-mono tabular-nums text-slate-200">
              {solvedStandardCount}/6 Resolvidos
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 font-display mt-1">
            Enigmas Bilíngues
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Resolva seis desafios que cruzam números em Inglês e Espanhol com contagem de letras, sequências e cifragem alfabética.
          </p>
        </div>

        <div className="bg-[#121D31] border border-slate-700/70 rounded-xl p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono font-semibold text-amber-400">02. Chaves Mestras</span>
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-slate-100 font-display mt-1">
            Mesa de Decifração
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Use a calculadora A1Z26 interativa, a Roda de César e o glossário EN/ES integrados ao lado de cada enigma.
          </p>
        </div>

        <div className="bg-[#121D31] border border-slate-700/70 rounded-xl p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono font-semibold text-amber-400">03. Cofres Secretos</span>
            <span className="font-mono tabular-nums text-slate-200">
              {solvedSecretCount}/3 Abertos
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 font-display mt-1">
            Níveis Ocultos
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Desbloqueie os Cofres Alfa, Beta e Ômega reunindo os Dígitos Mestres obtidos em cada fase superada.
          </p>
        </div>
      </section>
    </div>
  );
}
