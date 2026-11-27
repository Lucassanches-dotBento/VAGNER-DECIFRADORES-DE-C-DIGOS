import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Megaphone,
  RefreshCw,
  Shield,
  ShieldOff,
  Unlock,
  Users,
} from 'lucide-react';
import {
  AdminAgentRow,
  AdminBannerData,
  BOOTSTRAPPED_ADMIN_EMAIL,
  fetchAdminDashboardData,
  fetchOfficialBanner,
  grantAdminAccess,
  revokeAdminAccess,
  saveOfficialBanner,
} from '../services/userProgressService';
import { soundFX } from '../utils/sound';

interface AdminPanelProps {
  currentUser: User;
  onUnlockAllForAdmin: () => void;
  onBannerUpdated: (banner: AdminBannerData) => void;
}

export function AdminPanel({
  currentUser,
  onUnlockAllForAdmin,
  onBannerUpdated,
}: AdminPanelProps) {
  const [agents, setAgents] = useState<AdminAgentRow[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [bannerTitle, setBannerTitle] = useState('Comunicado do Lucas Admin');
  const [bannerMessage, setBannerMessage] = useState(
    'Dica oficial: observe sempre o idioma de cada palavra numérica antes de somar na tabela A1Z26.'
  );
  const [bannerActive, setBannerActive] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const loadData = async () => {
    setLoadingAgents(true);
    try {
      const [rows, existingBanner] = await Promise.all([
        fetchAdminDashboardData(),
        fetchOfficialBanner(),
      ]);
      setAgents(rows);
      if (existingBanner) {
        setBannerTitle(existingBanner.title);
        setBannerMessage(existingBanner.message);
        setBannerActive(existingBanner.active);
      }
    } catch {
      setStatusMsg({
        type: 'error',
        text: 'Não foi possível carregar os dados administrativos agora.',
      });
    } finally {
      setLoadingAgents(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBanner(true);
    setStatusMsg(null);
    try {
      const nextBanner: AdminBannerData = {
        title: bannerTitle.trim(),
        message: bannerMessage.trim(),
        active: bannerActive,
      };
      await saveOfficialBanner(currentUser, nextBanner);
      onBannerUpdated(nextBanner);
      soundFX.playSuccess();
      setStatusMsg({
        type: 'success',
        text: nextBanner.active
          ? 'Comunicado oficial publicado para todos os jogadores.'
          : 'Comunicado salvo e ocultado dos jogadores.',
      });
    } catch (err) {
      soundFX.playError();
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erro ao salvar comunicado.',
      });
    } finally {
      setSavingBanner(false);
    }
  };

  const handleToggleAdminRole = async (agent: AdminAgentRow) => {
    if (agent.email === BOOTSTRAPPED_ADMIN_EMAIL) return;
    setStatusMsg(null);
    try {
      if (agent.isAdmin) {
        await revokeAdminAccess(agent.uid);
        soundFX.playClear();
        setStatusMsg({
          type: 'success',
          text: `Permissão de administrador removida de ${agent.displayName}.`,
        });
      } else {
        await grantAdminAccess(currentUser, agent.uid, `${agent.displayName} (Admin)`);
        soundFX.playSuccess();
        setStatusMsg({
          type: 'success',
          text: `${agent.displayName} agora possui acesso administrativo.`,
        });
      }
      await loadData();
    } catch {
      soundFX.playError();
      setStatusMsg({
        type: 'error',
        text: 'Falha ao atualizar privilégios de administrador.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Admin Header */}
      <section className="bg-[#121D31] border border-slate-700/70 rounded-xl p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono font-semibold text-amber-400">Painel Administrativo</span>
            <span aria-hidden="true">·</span>
            <span>Lucas Admin</span>
            <span aria-hidden="true">·</span>
            <span>{currentUser.email}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-50 font-display">
            Central de Controle — Lucas Admin
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Gerencie comunicados oficiais exibidos aos jogadores, acompanhe o progresso das contas cadastradas e teste rapidamente todos os cofres secretos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            soundFX.playVaultUnlock();
            onUnlockAllForAdmin();
            setStatusMsg({
              type: 'success',
              text: 'Todos os 6 níveis e 3 cofres secretos foram liberados na sua conta de administrador.',
            });
          }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Unlock className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Liberar Todos os Cofres</span>
        </button>
      </section>

      {statusMsg && (
        <div
          role="status"
          className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border text-xs md:text-sm ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-700/70 text-emerald-200'
              : 'bg-rose-950/40 border-rose-700/70 text-rose-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Official Banner Publisher */}
        <section className="lg:col-span-5 bg-[#121D31] border border-slate-700/70 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-700/70 pb-3">
            <Megaphone className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <h2 className="text-lg font-bold text-slate-100 font-display">
              Comunicado aos Jogadores
            </h2>
          </div>

          <form onSubmit={handleSaveBanner} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="admin-banner-title"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Título do Aviso
              </label>
              <input
                id="admin-banner-title"
                type="text"
                required
                minLength={2}
                maxLength={80}
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0B1320] border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label
                htmlFor="admin-banner-message"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Mensagem ou Pista Oficial
              </label>
              <textarea
                id="admin-banner-message"
                required
                minLength={2}
                maxLength={300}
                rows={3}
                value={bannerMessage}
                onChange={(e) => setBannerMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0B1320] border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={bannerActive}
                onChange={(e) => setBannerActive(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <span>Exibir comunicado na campanha para todos os jogadores</span>
            </label>

            <button
              type="submit"
              disabled={savingBanner}
              className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              {savingBanner ? 'Salvando...' : 'Salvar Comunicado'}
            </button>
          </form>
        </section>

        {/* Registered Players & Admin Roles Table */}
        <section className="lg:col-span-7 bg-[#121D31] border border-slate-700/70 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 border-b border-slate-700/70 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
              <h2 className="text-lg font-bold text-slate-100 font-display">
                Agentes Cadastrados ({agents.length})
              </h2>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                void loadData();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Atualizar</span>
            </button>
          </div>

          {loadingAgents ? (
            <div className="py-10 text-center text-xs text-slate-400">
              Carregando agentes cadastrados...
            </div>
          ) : agents.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              Nenhum usuário sincronizado encontrado ainda.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-800 rounded-lg bg-[#0B1320]">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-slate-400 bg-[#10192A]">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Agente</th>
                    <th className="px-4 py-2.5 font-semibold">Enigmas</th>
                    <th className="px-4 py-2.5 font-semibold">Infinito</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Permissão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {agents.map((agent) => {
                    const isPrimaryAdmin = agent.email === BOOTSTRAPPED_ADMIN_EMAIL;
                    return (
                      <tr key={agent.uid}>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-100">{agent.displayName}</div>
                          <div className="text-[11px] text-slate-400">{agent.email}</div>
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums text-slate-200">
                          {agent.solvedCount}/9
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums text-slate-300">
                          {agent.endlessSolvedCount} (max {agent.endlessBestStreak})
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isPrimaryAdmin ? (
                            <span className="inline-flex items-center gap-1 text-amber-300 font-semibold">
                              <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Admin Principal</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleAdminRole(agent)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                agent.isAdmin
                                  ? 'border-rose-700/60 text-rose-300 hover:bg-rose-950/40'
                                  : 'border-slate-700 text-slate-200 hover:bg-slate-800'
                              }`}
                            >
                              {agent.isAdmin ? (
                                <>
                                  <ShieldOff className="w-3 h-3" aria-hidden="true" />
                                  <span>Remover Admin</span>
                                </>
                              ) : (
                                <>
                                  <Shield className="w-3 h-3 text-amber-400" aria-hidden="true" />
                                  <span>Tornar Admin</span>
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
