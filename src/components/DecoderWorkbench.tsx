import { useState } from 'react';
import { BookOpen, Calculator, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { BILINGUAL_NUMBERS, a1z26Sum, caesarShift } from '../data/puzzles';
import { soundFX } from '../utils/sound';

type WorkbenchTab = 'A1Z26' | 'CAESAR' | 'GLOSSARY';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function DecoderWorkbench() {
  const [activeTab, setActiveTab] = useState<WorkbenchTab>('A1Z26');

  // A1Z26 calculator state
  const [wordBuffer, setWordBuffer] = useState('');

  // Caesar cipher workbench state
  const [caesarInput, setCaesarInput] = useState('FLQFR');
  const [caesarOffset, setCaesarOffset] = useState(-3);

  // Glossary filter
  const [glossaryQuery, setGlossaryQuery] = useState('');

  const handleAddLetter = (letter: string) => {
    soundFX.playClick();
    setWordBuffer((prev) => (prev.length < 18 ? prev + letter : prev));
  };

  const handleBackspace = () => {
    soundFX.playClear();
    setWordBuffer((prev) => prev.slice(0, -1));
  };

  const handleClearWord = () => {
    soundFX.playClear();
    setWordBuffer('');
  };

  const currentSum = a1z26Sum(wordBuffer);
  const caesarResult = caesarShift(caesarInput, caesarOffset);

  const filteredNumbers = BILINGUAL_NUMBERS.filter((entry) => {
    const q = glossaryQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      String(entry.value).includes(q) ||
      entry.en.toLowerCase().includes(q) ||
      entry.es.toLowerCase().includes(q)
    );
  });

  return (
    <aside
      aria-label="Mesa de Decifração"
      className="bg-[#121D31] border border-slate-700/70 rounded-xl p-5 flex flex-col gap-5"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-700/70 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 font-display">
            Mesa de Decifração
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ferramentas de apoio para testar letras e deslocamentos
          </p>
        </div>
      </div>

      {/* Interactive Segmented Tabs */}
      <div
        role="tablist"
        aria-label="Ferramentas de decifração"
        className="grid grid-cols-3 gap-1 p-1 bg-[#0B1320] rounded-lg border border-slate-800"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'A1Z26'}
          onClick={() => {
            soundFX.playClick();
            setActiveTab('A1Z26');
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'A1Z26'
              ? 'bg-[#1E2D47] text-amber-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>A1Z26</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'CAESAR'}
          onClick={() => {
            soundFX.playClick();
            setActiveTab('CAESAR');
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'CAESAR'
              ? 'bg-[#1E2D47] text-amber-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>César</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'GLOSSARY'}
          onClick={() => {
            soundFX.playClick();
            setActiveTab('GLOSSARY');
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'GLOSSARY'
              ? 'bg-[#1E2D47] text-amber-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>EN / ES</span>
        </button>
      </div>

      {/* Tab 1: A1Z26 Calculator */}
      {activeTab === 'A1Z26' && (
        <div className="flex flex-col gap-4">
          <div className="bg-[#0B1320] border border-slate-800 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Palavra selecionada</span>
              <span className="tabular-nums">{wordBuffer.length} letras</span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <div className="font-mono text-base font-semibold tracking-widest text-slate-100 min-h-[24px] break-all">
                {wordBuffer || <span className="text-slate-600 tracking-normal font-sans text-sm font-normal">Clique nas letras abaixo</span>}
              </div>
              <div className="text-right shrink-0">
                <div className="text-[11px] text-slate-400">Soma</div>
                <div className="font-mono text-xl font-bold text-amber-400 tabular-nums">
                  {currentSum}
                </div>
              </div>
            </div>
            {wordBuffer && (
              <div className="mt-2 pt-2 border-t border-slate-800/80 text-xs font-mono text-slate-400 tabular-nums">
                {wordBuffer
                  .split('')
                  .map((ch) => `${ch}(${ch.charCodeAt(0) - 64})`)
                  .join(' + ')}
              </div>
            )}
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {ALPHABET.map((letter, idx) => (
              <button
                key={letter}
                type="button"
                onClick={() => handleAddLetter(letter)}
                className="flex flex-col items-center justify-center py-1.5 min-h-[44px] rounded-md bg-[#19263E] hover:bg-[#233454] border border-slate-700/60 text-slate-100 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400"
              >
                <span className="font-mono text-xs font-bold leading-none">{letter}</span>
                <span className="font-mono text-[10px] text-slate-400 tabular-nums mt-1 leading-none">
                  {idx + 1}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBackspace}
              disabled={!wordBuffer}
              className="flex-1 py-2 px-3 text-xs font-medium rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
            >
              Apagar Letra
            </button>
            <button
              type="button"
              onClick={handleClearWord}
              disabled={!wordBuffer}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Limpar</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Caesar Wheel */}
      {activeTab === 'CAESAR' && (
        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="caesar-input"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Texto cifrado para testar
            </label>
            <input
              id="caesar-input"
              type="text"
              value={caesarInput}
              onChange={(e) => setCaesarInput(e.target.value.toUpperCase().replace(/[^A-Z\s]/g, ''))}
              placeholder="Ex: FLQFR"
              maxLength={24}
              className="w-full px-3 py-2.5 bg-[#0B1320] border border-slate-700 rounded-lg font-mono text-sm tracking-widest text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="bg-[#0B1320] border border-slate-800 rounded-lg p-3.5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Deslocamento aplicado</span>
              <span className="font-mono text-sm font-bold text-amber-400 tabular-nums">
                {caesarOffset > 0 ? `+${caesarOffset}` : caesarOffset}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Diminuir deslocamento"
                onClick={() => {
                  soundFX.playClick();
                  setCaesarOffset((v) => Math.max(-15, v - 1));
                }}
                className="w-10 h-10 flex items-center justify-center rounded-md bg-[#19263E] hover:bg-[#233454] border border-slate-700 font-mono text-sm text-slate-100 cursor-pointer shrink-0"
              >
                −1
              </button>
              <input
                type="range"
                min={-15}
                max={15}
                value={caesarOffset}
                aria-label="Ajustar deslocamento de César"
                onChange={(e) => setCaesarOffset(Number(e.target.value))}
                className="flex-1 accent-amber-500 cursor-pointer"
              />
              <button
                type="button"
                aria-label="Aumentar deslocamento"
                onClick={() => {
                  soundFX.playClick();
                  setCaesarOffset((v) => Math.min(15, v + 1));
                }}
                className="w-10 h-10 flex items-center justify-center rounded-md bg-[#19263E] hover:bg-[#233454] border border-slate-700 font-mono text-sm text-slate-100 cursor-pointer shrink-0"
              >
                +1
              </button>
            </div>
          </div>

          <div className="bg-[#0B1320] border border-slate-800 rounded-lg p-3.5">
            <div className="text-xs text-slate-400 mb-1">Resultado decodificado</div>
            <div className="font-mono text-lg font-bold tracking-widest text-emerald-400 min-h-[28px] break-all">
              {caesarResult || '—'}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Bilingual Glossary */}
      {activeTab === 'GLOSSARY' && (
        <div className="flex flex-col gap-3">
          <input
            type="search"
            value={glossaryQuery}
            onChange={(e) => setGlossaryQuery(e.target.value)}
            placeholder="Filtrar número, inglês ou espanhol..."
            aria-label="Filtrar glossário numérico"
            className="w-full px-3 py-2 bg-[#0B1320] border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />

          <div className="max-h-[340px] overflow-y-auto border border-slate-800 rounded-lg bg-[#0B1320] divide-y divide-slate-800/80">
            <div className="grid grid-cols-[52px_1fr_1fr] gap-2 px-3 py-2 text-[11px] font-semibold text-slate-400 bg-[#10192A] sticky top-0">
              <span>Núm.</span>
              <span>Inglês (EN)</span>
              <span>Espanhol (ES)</span>
            </div>
            {filteredNumbers.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-slate-500">
                Nenhum número encontrado para "{glossaryQuery}".
              </div>
            ) : (
              filteredNumbers.map((item) => (
                <div
                  key={item.value}
                  className="grid grid-cols-[52px_1fr_1fr] gap-2 px-3 py-2 text-xs items-center"
                >
                  <span className="font-mono font-semibold text-amber-400 tabular-nums">
                    {item.value}
                  </span>
                  <span className="font-mono text-slate-200">{item.en}</span>
                  <span className="font-mono text-slate-300">{item.es}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
