import { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { SavedProgress } from '../types/game';

export const BOOTSTRAPPED_ADMIN_EMAIL = '20261ac0080020@estudantes.ifpr.edu.br';

export interface AdminBannerData {
  title: string;
  message: string;
  active: boolean;
}

export interface AdminAgentRow {
  uid: string;
  displayName: string;
  email: string;
  isAdmin: boolean;
  solvedCount: number;
  endlessSolvedCount: number;
  endlessBestStreak: number;
}

function sanitizeDisplayName(raw: string | null | undefined, email: string | null | undefined): string {
  const fallback = email ? email.split('@')[0] : 'Agente';
  const cleaned = (raw ?? fallback).trim().slice(0, 60);
  return cleaned.length >= 2 ? cleaned : 'Agente';
}

function sanitizeHintsMap(raw: Record<string, number>): Record<string, number> {
  const entries = Object.entries(raw).slice(0, 20);
  const out: Record<string, number> = {};
  for (const [k, v] of entries) {
    const cleanKey = k.slice(0, 24);
    out[cleanKey] = Math.max(0, Math.min(3, Math.floor(Number(v) || 0)));
  }
  return out;
}

function sanitizeProgressPayload(uid: string, progress: SavedProgress) {
  return {
    uid,
    solvedIds: Array.from(new Set(progress.solvedIds))
      .map((id) => String(id).slice(0, 24))
      .slice(0, 20),
    hintsUsedByLevel: sanitizeHintsMap(progress.hintsUsedByLevel),
    omegaUnlockedWithMasterKey: Boolean(progress.omegaUnlockedWithMasterKey),
    endlessSolvedCount: Math.max(0, Math.min(100000, Math.floor(progress.endlessSolvedCount || 0))),
    endlessBestStreak: Math.max(0, Math.min(100000, Math.floor(progress.endlessBestStreak || 0))),
    soundEnabled: Boolean(progress.soundEnabled),
    musicEnabled: Boolean(progress.musicEnabled),
    musicVolume: Math.max(0, Math.min(1, Number(progress.musicVolume ?? 0.55))),
    currentTrackIndex: Math.max(0, Math.min(20, Math.floor(progress.currentTrackIndex || 0))),
  };
}

export function mergeProgress(local: SavedProgress, remote: Partial<SavedProgress>): SavedProgress {
  const solvedSet = new Set<string>([
    ...local.solvedIds,
    ...(Array.isArray(remote.solvedIds) ? remote.solvedIds : []),
  ]);

  const mergedHints: Record<string, number> = { ...local.hintsUsedByLevel };
  if (remote.hintsUsedByLevel && typeof remote.hintsUsedByLevel === 'object') {
    for (const [key, val] of Object.entries(remote.hintsUsedByLevel)) {
      mergedHints[key] = Math.max(mergedHints[key] ?? 0, Number(val) || 0);
    }
  }

  return {
    solvedIds: Array.from(solvedSet).slice(0, 20),
    hintsUsedByLevel: mergedHints,
    omegaUnlockedWithMasterKey:
      local.omegaUnlockedWithMasterKey || Boolean(remote.omegaUnlockedWithMasterKey),
    endlessSolvedCount: Math.max(local.endlessSolvedCount, Number(remote.endlessSolvedCount) || 0),
    endlessBestStreak: Math.max(local.endlessBestStreak, Number(remote.endlessBestStreak) || 0),
    soundEnabled: remote.soundEnabled !== undefined ? Boolean(remote.soundEnabled) : local.soundEnabled,
    musicEnabled: remote.musicEnabled !== undefined ? Boolean(remote.musicEnabled) : local.musicEnabled,
    musicVolume: typeof remote.musicVolume === 'number' ? remote.musicVolume : local.musicVolume,
    currentTrackIndex:
      typeof remote.currentTrackIndex === 'number'
        ? remote.currentTrackIndex
        : local.currentTrackIndex,
  };
}

export async function ensureUserProfileAndSyncProgress(
  user: User,
  localProgress: SavedProgress
): Promise<SavedProgress> {
  if (!user.emailVerified) {
    return localProgress;
  }

  const userPath = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);
  const displayName = sanitizeDisplayName(user.displayName, user.email);
  const email = (user.email ?? 'agente@arquivocifra.app').trim().slice(0, 160);

  let userExists = false;
  try {
    const snap = await getDoc(userRef);
    userExists = snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  if (!userExists) {
    try {
      await setDoc(userRef, {
        uid: user.uid,
        displayName,
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, userPath);
    }
  } else {
    try {
      await updateDoc(userRef, {
        displayName,
        email,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, userPath);
    }
  }

  const progressPath = `users/${user.uid}/progress/main`;
  const progressRef = doc(db, 'users', user.uid, 'progress', 'main');

  let remoteData: Partial<SavedProgress> | null = null;
  try {
    const progSnap = await getDoc(progressRef);
    if (progSnap.exists()) {
      remoteData = progSnap.data() as Partial<SavedProgress>;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, progressPath);
  }

  const merged = remoteData ? mergeProgress(localProgress, remoteData) : localProgress;
  const payload = sanitizeProgressPayload(user.uid, merged);

  if (!remoteData) {
    try {
      await setDoc(progressRef, {
        ...payload,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, progressPath);
    }
  } else {
    try {
      await updateDoc(progressRef, {
        solvedIds: payload.solvedIds,
        hintsUsedByLevel: payload.hintsUsedByLevel,
        omegaUnlockedWithMasterKey: payload.omegaUnlockedWithMasterKey,
        endlessSolvedCount: payload.endlessSolvedCount,
        endlessBestStreak: payload.endlessBestStreak,
        soundEnabled: payload.soundEnabled,
        musicEnabled: payload.musicEnabled,
        musicVolume: payload.musicVolume,
        currentTrackIndex: payload.currentTrackIndex,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, progressPath);
    }
  }

  return merged;
}

export async function saveRemoteProgress(user: User, progress: SavedProgress): Promise<void> {
  if (!user.emailVerified) return;

  const progressPath = `users/${user.uid}/progress/main`;
  const progressRef = doc(db, 'users', user.uid, 'progress', 'main');
  const payload = sanitizeProgressPayload(user.uid, progress);

  try {
    await updateDoc(progressRef, {
      solvedIds: payload.solvedIds,
      hintsUsedByLevel: payload.hintsUsedByLevel,
      omegaUnlockedWithMasterKey: payload.omegaUnlockedWithMasterKey,
      endlessSolvedCount: payload.endlessSolvedCount,
      endlessBestStreak: payload.endlessBestStreak,
      soundEnabled: payload.soundEnabled,
      musicEnabled: payload.musicEnabled,
      musicVolume: payload.musicVolume,
      currentTrackIndex: payload.currentTrackIndex,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, progressPath);
  }
}

export async function checkIsUserAdmin(user: User): Promise<boolean> {
  if (!user.emailVerified) return false;
  if (user.email === BOOTSTRAPPED_ADMIN_EMAIL) return true;

  const path = `admins/${user.uid}`;
  try {
    const snap = await getDoc(doc(db, 'admins', user.uid));
    return snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function fetchOfficialBanner(): Promise<AdminBannerData | null> {
  const path = 'announcements/banner';
  try {
    const snap = await getDoc(doc(db, 'announcements', 'banner'));
    if (!snap.exists()) return null;
    const data = snap.data() as Partial<AdminBannerData>;
    return {
      title: String(data.title ?? ''),
      message: String(data.message ?? ''),
      active: Boolean(data.active),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveOfficialBanner(
  adminUser: User,
  banner: AdminBannerData
): Promise<void> {
  const path = 'announcements/banner';
  const ref = doc(db, 'announcements', 'banner');
  const title = banner.title.trim().slice(0, 80);
  const message = banner.message.trim().slice(0, 300);

  if (title.length < 2 || message.length < 2) {
    throw new Error('Título e mensagem precisam ter pelo menos 2 caracteres.');
  }

  let exists = false;
  try {
    const snap = await getDoc(ref);
    exists = snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  const payload = {
    title,
    message,
    active: Boolean(banner.active),
    updatedBy: adminUser.uid,
    updatedAt: serverTimestamp(),
  };

  if (!exists) {
    try {
      await setDoc(ref, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  } else {
    try {
      await updateDoc(ref, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
}

export async function fetchAdminDashboardData(): Promise<AdminAgentRow[]> {
  const usersPath = 'users';
  const adminsPath = 'admins';

  const adminUids = new Set<string>();
  try {
    const adminSnap = await getDocs(collection(db, adminsPath));
    adminSnap.forEach((d) => adminUids.add(d.id));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, adminsPath);
  }

  let userDocs: { uid: string; displayName: string; email: string }[] = [];
  try {
    const usersSnap = await getDocs(collection(db, usersPath));
    userDocs = usersSnap.docs.map((d) => {
      const data = d.data() as { uid?: string; displayName?: string; email?: string };
      return {
        uid: data.uid ?? d.id,
        displayName: String(data.displayName ?? 'Agente'),
        email: String(data.email ?? ''),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, usersPath);
  }

  const rows: AdminAgentRow[] = await Promise.all(
    userDocs.map(async (u) => {
      let solvedCount = 0;
      let endlessSolvedCount = 0;
      let endlessBestStreak = 0;
      const progPath = `users/${u.uid}/progress/main`;
      try {
        const progSnap = await getDoc(doc(db, 'users', u.uid, 'progress', 'main'));
        if (progSnap.exists()) {
          const prog = progSnap.data() as Partial<SavedProgress>;
          solvedCount = Array.isArray(prog.solvedIds) ? prog.solvedIds.length : 0;
          endlessSolvedCount = Number(prog.endlessSolvedCount) || 0;
          endlessBestStreak = Number(prog.endlessBestStreak) || 0;
        }
      } catch {
        // Skip individual missing progress doc safely
      }

      return {
        uid: u.uid,
        displayName: u.displayName,
        email: u.email,
        isAdmin: u.email === BOOTSTRAPPED_ADMIN_EMAIL || adminUids.has(u.uid),
        solvedCount,
        endlessSolvedCount,
        endlessBestStreak,
      };
    })
  );

  return rows;
}

export async function grantAdminAccess(
  actor: User,
  targetUid: string,
  label: string
): Promise<void> {
  const path = `admins/${targetUid}`;
  try {
    await setDoc(doc(db, 'admins', targetUid), {
      uid: targetUid,
      label: label.trim().slice(0, 60) || 'Admin',
      grantedBy: actor.uid,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function revokeAdminAccess(targetUid: string): Promise<void> {
  const path = `admins/${targetUid}`;
  try {
    await deleteDoc(doc(db, 'admins', targetUid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

