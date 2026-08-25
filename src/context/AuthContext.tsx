"use client";

import {
  clearSession,
  getSession,
  setSession,
  subscribeToSession,
  type LocalSession,
} from "@/lib/auth/session";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

const AUTH_USERS_KEY = "oceanquiet.auth.users.v1";

type LocalAccount = LocalSession & {
  passwordHash: string;
};

export type AuthErrorCode =
  | "invalidCredentials"
  | "noSecureSignIn"
  | "credentialsMismatch"
  | "invalidName"
  | "invalidEmail"
  | "invalidPassword"
  | "noSecureSignUp"
  | "emailExists";

type AuthResult =
  | { ok: true; user: LocalSession }
  | { ok: false; code: AuthErrorCode };

type AuthContextValue = {
  user: LocalSession | null;
  isReady: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<AuthResult>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isBrowser() {
  return typeof window !== "undefined";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getAccounts(): LocalAccount[] {
  if (!isBrowser()) return [];

  try {
    const saved = window.localStorage.getItem(AUTH_USERS_KEY);
    if (!saved) return [];

    const accounts = JSON.parse(saved) as unknown;
    if (!Array.isArray(accounts)) return [];

    return accounts.filter(
      (account): account is LocalAccount =>
        typeof account === "object" &&
        account !== null &&
        typeof (account as LocalAccount).id === "string" &&
        typeof (account as LocalAccount).name === "string" &&
        typeof (account as LocalAccount).email === "string" &&
        typeof (account as LocalAccount).createdAt === "string" &&
        typeof (account as LocalAccount).passwordHash === "string",
    );
  } catch {
    return [];
  }
}

function saveAccounts(accounts: LocalAccount[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(accounts));
}

async function hashPassword(password: string) {
  const encoded = new TextEncoder().encode(password);
  const digest = await window.crypto.subtle.digest("SHA-256", encoded);

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function getDisplayName(firstName: string, lastName: string) {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const user = useSyncExternalStore(subscribeToSession, getSession, () => null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const normalizedEmail = normalizeEmail(email);

      if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || !password) {
        return { ok: false, code: "invalidCredentials" };
      }

      if (!window.crypto?.subtle) {
        return {
          ok: false,
          code: "noSecureSignIn",
        };
      }

      const account = getAccounts().find(
        (savedAccount) => savedAccount.email === normalizedEmail,
      );
      const passwordHash = await hashPassword(password);

      if (!account || account.passwordHash !== passwordHash) {
        return { ok: false, code: "credentialsMismatch" };
      }

      const session: LocalSession = {
        id: account.id,
        name: account.name,
        email: account.email,
        createdAt: account.createdAt,
      };

      setSession(session);
      return { ok: true, user: session };
    },
    [],
  );

  const signUp = useCallback(
    async ({
      firstName,
      lastName,
      email,
      password,
    }: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }): Promise<AuthResult> => {
      const name = getDisplayName(firstName, lastName);
      const normalizedEmail = normalizeEmail(email);

      if (firstName.trim().length < 2 || lastName.trim().length < 2) {
        return { ok: false, code: "invalidName" };
      }

      if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
        return { ok: false, code: "invalidEmail" };
      }

      if (password.length < 8) {
        return { ok: false, code: "invalidPassword" };
      }

      if (!window.crypto?.subtle) {
        return {
          ok: false,
          code: "noSecureSignUp",
        };
      }

      const accounts = getAccounts();
      if (accounts.some((account) => account.email === normalizedEmail)) {
        return {
          ok: false,
          code: "emailExists",
        };
      }

      const createdAt = new Date().toISOString();
      const account: LocalAccount = {
        id: window.crypto.randomUUID(),
        name,
        email: normalizedEmail,
        createdAt,
        passwordHash: await hashPassword(password),
      };

      saveAccounts([...accounts, account]);

      const session: LocalSession = {
        id: account.id,
        name: account.name,
        email: account.email,
        createdAt: account.createdAt,
      };
      setSession(session);

      return { ok: true, user: session };
    },
    [],
  );

  const signOut = useCallback(() => {
    clearSession();
  }, []);

  const value = useMemo(
    () => ({ user, isReady, signIn, signUp, signOut }),
    [isReady, signIn, signOut, signUp, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
