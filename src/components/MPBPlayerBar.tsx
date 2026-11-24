import { Music, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { MPB_TRACKS } from '../utils/mpbPlayer';

interface MPBPlayerBarProps {
  isPlaying: boolean;
  musicEnabled: boolean;
  trackIndex: number;
  currentChord: string;
  volume: number;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onSelectTrack: (index: number) => void;
  onVolumeChange: (vol: number) => void;
}

export function MPBPlayerBar({
  isPlaying,
  musicEnabled,
  trackIndex,
  currentChord,
  volume,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  onSelectTrack,
  onVolumeChange,
}: MPBPlayerBarProps) {
  const track = MPB_TRACKS[trackIndex] ?? MPB_TRACKS[0];

  return (
    <section
      aria-label="Trilha Sonora MPB"
      className="bg-[#121D31] border border-slate-700/70 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4"
    >
      {/* Left: Transport Controls + Track Metadata */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onPrevTrack}
            aria-label="Faixa MPB anterior"
            className="w-9 h-9 rounded-lg border border-slate-700/80 bg-[#0B1320] hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <SkipBack className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            data-mpb-play-toggle="true"
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pausar música MPB' : 'Tocar música MPB'}
            className="h-9 px-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Pausar MPB</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Tocar MPB</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onNextTrack}
            aria-label="Próxima faixa MPB"
            className="w-9 h-9 rounded-lg border border-slate-700/80 bg-[#0B1320] hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <SkipForward className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-100 font-semibold truncate">
            <Music className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
            <span className="truncate">{track.title}</span>
            {isPlaying && currentChord && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="font-mono text-amber-300 tabular-nums shrink-0">
                  {currentChord}
                </span>
              </>
            )}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {isPlaying
              ? `Tocando agora · ${track.style}`
              : musicEnabled
              ? `Pronto para tocar · ${track.style} (clique para ouvir)`
              : `Pausado · ${track.style}`}
          </div>
        </div>
      </div>

      {/* Right: Track Selector + Volume */}
      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <label htmlFor="mpb-track-select" className="sr-only">
          Selecionar faixa de MPB
        </label>
        <select
          id="mpb-track-select"
          value={trackIndex}
          onChange={(e) => onSelectTrack(Number(e.target.value))}
          className="px-3 py-1.5 bg-[#0B1320] border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
        >
          {MPB_TRACKS.map((t, idx) => (
            <option key={t.id} value={idx}>
              {idx + 1}. {t.title} ({t.style})
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 bg-[#0B1320] border border-slate-800 rounded-lg px-2.5 py-1.5">
          {volume === 0 ? (
            <VolumeX className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
          )}
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            aria-label="Volume da música MPB"
            onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
            className="w-20 accent-amber-500 cursor-pointer"
          />
          <span className="font-mono text-[11px] text-slate-400 w-8 text-right tabular-nums">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </section>
  );
}
