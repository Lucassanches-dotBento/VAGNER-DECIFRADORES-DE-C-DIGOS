import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockOpen,
  LogIn,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { soundFX } from '../utils/sound';

interface AuthPagesProps {
  mode: 'LOGIN' | 'REGISTER';
  onSwitchMode: (mode: 'LOGIN' | 'REGISTER') => void;
  onAuthSuccess: () => void;
}

function mapFirebaseAuthError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: string }).code)
      : '';

  switch (code) {
    case 'auth/operation-not-allowed':
      return 'O cadastro/login por e-mail e senha ainda não está ativado no Console do Firebase (Authentication > Sign-in method > E-mail/senha). Use o botão "Continuar com Google" abaixo ou ative o provedor no console.';
    case 'auth/email-already-in-use':
      return 'Este endereço de e-mail já está cadastrado. Tente fazer login na sua conta.';
    case 'auth/invalid-email':
      return 'O formato do e-mail informado não é válido.';
    case 'auth/weak-password':
      return 'A senha deve conter pelo menos 6 caracteres.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas seguidas. Aguarde alguns instantes antes de tentar novamente.';
    case 'auth/popup-closed-by-user':
      return 'A janela de login com o Google foi fechada antes de concluir.';
    case 'auth/network-request-failed':
      return 'Falha de conexão com a rede. Verifique sua internet e tente novamente.';
    default:
      return 'Não foi possível concluir a autenticação. Tente novamente.';
  }
}

export function AuthPages({ mode, onSwitchMode, onAuthSuccess }: AuthPagesProps) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const isRegister = mode === 'REGISTER';

  const resetMessages = () => {
    setErrorMsg(null);
    setInfoMsg(null);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const trimmedEmail = email.trim();
    const trimmedName = displayName.trim();

    if (isRegister) {
      if (trimmedName.length < 2 || trimmedName.length > 60) {
        soundFX.playError();
        setErrorMsg('Informe um nome entre 2 e 60 caracteres.');
        return;
      }
      if (password.length < 6) {
        soundFX.playError();
        setErrorMsg('A senha deve ter no mínimo 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        soundFX.playError();
        setErrorMsg('As senhas digitadas não conferem.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        await updateProfile(cred.user, { displayName: trimmedName });
        await sendEmailVerification(cred.user);
        soundFX.playSuccess();
        onAuthSuccess();
      } else {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
        soundFX.playSuccess();
        onAuthSuccess();
      }
    } catch (error) {
      soundFX.playError();
      setErrorMsg(mapFirebaseAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    resetMessages();
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      soundFX.playSuccess();
      onAuthSuccess();
    } catch (error) {
      soundFX.playError();
      setErrorMsg(mapFirebaseAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    resetMessages();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      soundFX.playError();
      setErrorMsg('Digite seu e-mail no campo acima para enviar o link de redefinição.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      soundFX.playSuccess();
      setInfoMsg('Enviamos um e-mail com instruções para redefinir sua senha.');
    } catch (error) {
      soundFX.playError();
      setErrorMsg(mapFirebaseAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      aria-label={isRegister ? 'Página de Cadastro' : 'Página de Login'}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
    >
      {/* Editorial Context Column */}
      <div className="lg:col-span-6 bg-[#121D31] border border-slate-700/70 rounded-xl p-7 md:p-10 flex flex-col justify-between gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono font-semibold text-amber-400">
              {isRegister ? 'Cadastro de Agente' : 'Acesso ao Arquivo'}
            </span>
            <span aria-hidden="true">·</span>
            <span>Progresso na Nuvem</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-50 font-display leading-tight">
            {isRegister
              ? 'Crie sua conta para guardar suas chaves e cofres.'
              : 'Entre para retomar seus enigmas de onde parou.'}
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-lg">
            {isRegister
              ? 'Com seu cadastro no Arquivo Cifra, todos os níveis concluídos, Dígitos Mestres, cofres secretos abertos e recordes do Modo Infinito ficam sincronizados com segurança.'
              : 'Acesse sua conta para sincronizar automaticamente sua campanha bilíngue, seus cofres secretos desbloqueados e suas preferências de áudio.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-700/70">
          <div className="flex flex-col gap-1.5">
            <KeyRound className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span className="text-xs font-semibold text-slate-100">Chaves Mestras</span>
            <span className="text-xs text-slate-400">Salvas por usuário</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <LockOpen className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span className="text-xs font-semibold text-slate-100">Cofres Secretos</span>
            <span className="text-xs text-slate-400">Desbloqueio persistente</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span className="text-xs font-semibold text-slate-100">Firebase Auth</span>
            <span className="text-xs text-slate-400">Dados isolados</span>
          </div>
        </div>
      </div>

      {/* Form Card Column */}
      <div className="lg:col-span-6 bg-[#121D31] border border-slate-700/70 rounded-xl p-7 md:p-10 flex flex-col gap-6">
        {/* Segmented Mode Toggle */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#0B1320] rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              resetMessages();
              onSwitchMode('LOGIN');
            }}
            className={`py-2.5 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              !isRegister
                ? 'bg-[#1E2D47] text-amber-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              resetMessages();
              onSwitchMode('REGISTER');
            }}
            className={`py-2.5 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              isRegister
                ? 'bg-[#1E2D47] text-amber-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cadastro
          </button>
        </div>

        <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
          {isRegister && (
            <div>
              <label
                htmlFor="auth-display-name"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Nome de Agente
              </label>
              <input
                id="auth-display-name"
                type="text"
                required
                minLength={2}
                maxLength={60}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ex: Ana Silva"
                className="w-full px-3.5 py-2.5 bg-[#0B1320] border border-slate-700 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              E-mail
            </label>
            <input
              id="auth-email"
              type="email"
              required
              maxLength={160}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              className="w-full px-3.5 py-2.5 bg-[#0B1320] border border-slate-700 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="auth-password"
                className="block text-xs font-medium text-slate-300"
              >
                Senha
              </label>
              {!isRegister && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="text-xs text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
                >
                  Esqueci minha senha
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-3.5 pr-11 py-2.5 bg-[#0B1320] border border-slate-700 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {isRegister && (
            <div>
              <label
                htmlFor="auth-confirm-password"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Confirmar Senha
              </label>
              <input
                id="auth-confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                className="w-full px-3.5 py-2.5 bg-[#0B1320] border border-slate-700 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg border border-rose-700/70 bg-rose-950/40 text-xs text-rose-200 leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div
              role="status"
              className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg border border-emerald-700/70 bg-emerald-950/40 text-xs text-emerald-200 leading-relaxed"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{infoMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
          >
            {isRegister ? (
              <>
                <UserPlus className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{loading ? 'Criando conta...' : 'Criar Conta'}</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{loading ? 'Entrando...' : 'Entrar'}</span>
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="flex-1 h-px bg-slate-800" aria-hidden="true" />
          <span>ou</span>
          <div className="flex-1 h-px bg-slate-800" aria-hidden="true" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg bg-[#0B1320] hover:bg-slate-800 border border-slate-700 text-slate-100 font-medium text-sm flex items-center justify-center gap-2.5 transition-colors whitespace-nowrap cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.2 14.7 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12z"
            />
          </svg>
          <span>{isRegister ? 'Cadastrar com Google' : 'Entrar com Google'}</span>
        </button>

        <p className="text-xs text-center text-slate-400">
          {isRegister ? 'Já possui uma conta?' : 'Ainda não tem cadastro?'}{' '}
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              resetMessages();
              onSwitchMode(isRegister ? 'LOGIN' : 'REGISTER');
            }}
            className="text-amber-300 hover:underline font-semibold cursor-pointer"
          >
            {isRegister ? 'Fazer login' : 'Criar conta'}
          </button>
        </p>
      </div>
    </section>
  );
}
