export const AUTH_SESSION_KEY = "oceanquiet.auth.session";
export const AUTH_SESSION_EVENT = "oceanquiet:session-change";

export type LocalSession = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
};

let cachedRawSession: string | null | undefined;
let cachedSession: LocalSession | null = null;

function isBrowser() {
  return typeof window !== "undefined";
}

function notifySessionChange(session: LocalSession | null) {
  if (!isBrowser()) return;

  window.dispatchEvent(
    new CustomEvent<LocalSession | null>(AUTH_SESSION_EVENT, {
      detail: session,
    }),
  );
}

export function getSession(): LocalSession | null {
  if (!isBrowser()) return null;

  try {
    const rawSession = window.localStorage.getItem(AUTH_SESSION_KEY);
    if (rawSession === cachedRawSession) return cachedSession;

    cachedRawSession = rawSession;
    if (!rawSession) {
      cachedSession = null;
      return cachedSession;
    }

    const parsed = JSON.parse(rawSession) as Partial<LocalSession>;
    if (
      typeof parsed.id !== "string" ||
      typeof parsed.name !== "string" ||
      typeof parsed.email !== "string"
    ) {
      cachedSession = null;
      return null;
    }

    cachedSession = {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      ...(typeof parsed.createdAt === "string" ? { createdAt: parsed.createdAt } : {}),
    };
    return cachedSession;
  } catch {
    return cachedSession;
  }
}

export function setSession(session: LocalSession) {
  if (!isBrowser()) return;

  try {
    const serialisedSession = JSON.stringify(session);
    window.localStorage.setItem(AUTH_SESSION_KEY, serialisedSession);
    cachedRawSession = serialisedSession;
    cachedSession = session;
  } catch {
    // A mesma aba ainda é atualizada quando o armazenamento não estiver disponível.
    cachedRawSession = undefined;
    cachedSession = session;
  } finally {
    notifySessionChange(session);
  }
}

export function clearSession() {
  if (!isBrowser()) return;

  try {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
    cachedRawSession = null;
    cachedSession = null;
  } catch {
    // Preserva o fluxo de saída mesmo em contextos que bloqueiam o localStorage.
    cachedRawSession = undefined;
    cachedSession = null;
  } finally {
    notifySessionChange(null);
  }
}

export function subscribeToSession(
  listener: (session: LocalSession | null) => void,
) {
  if (!isBrowser()) return () => undefined;

  const onStorage = (event: StorageEvent) => {
    if (event.key === AUTH_SESSION_KEY) listener(getSession());
  };

  const onSessionChange = (event: Event) => {
    listener((event as CustomEvent<LocalSession | null>).detail);
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(AUTH_SESSION_EVENT, onSessionChange);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(AUTH_SESSION_EVENT, onSessionChange);
  };
}
