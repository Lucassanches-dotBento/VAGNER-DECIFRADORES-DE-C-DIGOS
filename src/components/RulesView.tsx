import { ArrowRight } from 'lucide-react';
import { soundFX } from '../utils/sound';

interface RulesViewProps {
  onPlayNow: () => void;
}

export function RulesView({ onPlayNow }: RulesViewProps) {
  return (
    <section
      aria-label="Manual de Criptografia"
      className="bg-[#121D31] border border-slate-700/70 rounded-xl p-6 md:p-8 flex flex-col gap-8 max-w-4xl mx-auto"
    >
      <div className="border-b border-slate-700/70 pb-5 flex flex-col gap-2">
        <span className="text-xs font-mono font-semibold text-amber-400">
          Manual de Regras · Guia Rápido
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-50 font-display">
          Como Decifrar os Códigos
        </h1>
        <p className="text-sm md:text-base text-slate-300 leading-relaxed">
          Todos os enigmas têm solução exata de 4 dígitos numéricos e combinam vocabulário numérico em Inglês (EN) e Espanhol (ES) com técnicas clássicas de criptografia.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0B1320] border border-slate-800 rounded-xl p-5 flex flex-col gap-2">
          <h2 className="text-base font-bold text-slate-100 font-display">
            01. Tradução &amp; Operações
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Termos como <span className="font-mono text-amber-300">NINE</span> (9) e{' '}
            <span className="font-mono text-amber-300">CATORCE</span> (14) representam números reais. Converta para dígitos antes de somar, subtrair ou multiplicar.
          </p>
        </div>

        <div className="bg-[#0B1320] border border-slate-800 rounded-xl p-5 flex flex-col gap-2">
          <h2 className="text-base font-bold text-slate-100 font-display">
            02. Índice Alfabético (A1Z26)
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Cada letra recebe sua posição no alfabeto padrão (<span className="font-mono text-amber-300">A=1, B=2 … Z=26</span>). Por exemplo, <span className="font-mono text-amber-300">ONE</span> vale 15 + 14 + 5 = 34.
          </p>
        </div>

        <div className="bg-[#0B1320] border border-slate-800 rounded-xl p-5 flex flex-col gap-2">
          <h2 className="text-base font-bold text-slate-100 font-display">
            03. Cifra de César
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Um deslocamento positivo (ex: <span className="font-mono text-amber-300">+3</span>) avança cada letra no alfabeto. Para decifrar, retroceda o mesmo valor (<span className="font-mono text-amber-300">−3</span>) na Roda de César.
          </p>
        </div>

        <div className="bg-[#0B1320] border border-slate-800 rounded-xl p-5 flex flex-col gap-2">
          <h2 className="text-base font-bold text-slate-100 font-display">
            04. Cofres Secretos &amp; Chave Mestra
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Resolva os Níveis 01–02 para abrir o Cofre Alfa, 01–04 para o Cofre Beta e todos os 6 níveis para montar a Chave Mestra de 6 dígitos do Cofre Ômega.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-slate-700/70">
        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            onPlayNow();
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors whitespace-nowrap cursor-pointer"
        >
          <span>Ir para os Enigmas</span>
          <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
