import React, {createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authApi from '../apis/auth.api';
import {setUnauthorizedHandler} from '../apis/client';
import {User} from '../apis/types';
import {queryClient} from '../queries/queryClient';
import {TOKEN_KEY, USER_KEY} from '../utils/storageKeys';
import {decodeJwtPayload} from '../utils/jwt';

/** Why the last session ended, when the reader didn't choose to sign out. */
export type SessionEnd = 'expired' | null;

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionEnd: SessionEnd;
  /** Set right after sign-up: the app opens on email verification once. */
  pendingVerify: boolean;
  clearPendingVerify: () => void;
  login: (email: string, password: string) => Promise<void>;
  /** Creates the account and signs in; the session starts when `activateSession` is called. */
  register: (data: authApi.RegisterPayload) => Promise<{token: string; user: User}>;
  activateSession: (token: string, sessionUser: User, opts?: {verifyNext?: boolean}) => Promise<void>;
  /** Signs out on the server (best effort) and wipes everything personal on this device. */
  logout: () => Promise<void>;
  setUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/** Thrown when the account was created but the follow-up sign-in failed. */
export class CreatedButNotSignedIn extends Error {
  constructor() {
    super('Account created, sign-in failed');
    this.name = 'CreatedButNotSignedIn';
  }
}

/** POST /api/auth/login returns only a JWT — no user object — so identity
 * (user_id, email) comes from decoding the token's own claims. */
const userFromToken = (token: string): User | null => {
  const claims = decodeJwtPayload<{user_id?: string; email?: string}>(token);
  if (!claims?.user_id || !claims?.email) {
    return null;
  }
  return {_id: claims.user_id, email: claims.email};
};

// Everything personal that must not outlive a session on this device. Device
// preferences (theme, language, numerals, onboarding seen) are kept.
const USER_SCOPED_PREFIXES = ['hassad.draft.', 'hassad.verified.'];
const USER_SCOPED_KEYS = [TOKEN_KEY, USER_KEY, 'hassad.recentSearches', 'hassad.resume'];

const wipeUserData = async () => {
  queryClient.cancelQueries();
  queryClient.clear();
  try {
    const keys = await AsyncStorage.getAllKeys();
    const scoped = keys.filter(k => USER_SCOPED_KEYS.includes(k) || USER_SCOPED_PREFIXES.some(p => k.startsWith(p)));
    await AsyncStorage.multiRemove(scoped);
  } catch {
    await AsyncStorage.multiRemove(USER_SCOPED_KEYS).catch(() => {});
  }
};

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionEnd, setSessionEnd] = useState<SessionEnd>(null);
  const [pendingVerify, setPendingVerify] = useState(false);
  const signingOut = useRef(false);
  const userRef = useRef<User | null>(null);
  userRef.current = user;

  const persistSession = useCallback(async (token: string, sessionUser: User, opts?: {verifyNext?: boolean}) => {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [USER_KEY, JSON.stringify(sessionUser)],
    ]);
    setSessionEnd(null);
    setPendingVerify(!!opts?.verifyNext);
    setUserState(sessionUser);
  }, []);

  const endSession = useCallback(async (reason: SessionEnd) => {
    await wipeUserData();
    setPendingVerify(false);
    setSessionEnd(reason);
    setUserState(null);
  }, []);

  useEffect(() => {
    // A 401 means the server no longer accepts this session.
    setUnauthorizedHandler(() => {
      // Only a live session can expire; a wrong password at sign-in is a 401 too.
      if (!signingOut.current && userRef.current) {
        endSession('expired');
      }
    });
    return () => setUnauthorizedHandler(null);
  }, [endSession]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [token, storedUser] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
        if (token[1] && storedUser[1]) {
          setUserState(JSON.parse(storedUser[1]));
        } else if (token[1] || storedUser[1]) {
          // Half a session (an interrupted sign-in): drop it.
          await wipeUserData();
        }
      } catch {
        // Unreadable storage: start signed out.
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    const {token} = await authApi.login({email, password});
    const sessionUser = userFromToken(token);
    if (!sessionUser) {
      throw new Error('Login response did not include a usable session');
    }
    await persistSession(token, sessionUser);
  };

  const register = async (data: authApi.RegisterPayload) => {
    const created = await authApi.register(data);
    // The register endpoint returns no token; sign in with the same details.
    let token: string;
    try {
      token = (await authApi.login({email: data.email, password: data.password})).token;
    } catch {
      throw new CreatedButNotSignedIn();
    }
    return {
      token,
      user: {_id: created._id, first_name: created.first_name, last_name: created.last_name, email: created.email, verified: created.verified},
    };
  };

  const logout = async () => {
    signingOut.current = true;
    try {
      await authApi.logout();
    } catch {
      // The device forgets the session either way.
    } finally {
      await endSession(null);
      signingOut.current = false;
    }
  };

  const setUser = async (updatedUser: User) => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    setUserState(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        sessionEnd,
        pendingVerify,
        clearPendingVerify: () => setPendingVerify(false),
        login,
        register,
        activateSession: persistSession,
        logout,
        setUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
