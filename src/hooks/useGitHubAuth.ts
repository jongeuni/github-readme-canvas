import { useCallback, useState } from 'react';
import { fetchGitHubUser, type GitHubUser } from '../lib/github';

const STORAGE_KEY = 'readmeCanvas:github';

interface StoredAuth {
  token: string;
  user: GitHubUser;
}

function loadStored(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token && parsed?.user ? parsed : null;
  } catch {
    return null;
  }
}

function persistStored(auth: StoredAuth | null) {
  try {
    if (auth) localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode / quota exceeded — the connection just won't persist across reloads.
  }
}

/**
 * GitHub connection — a Personal Access Token kept in localStorage, not a
 * full OAuth login (that needs a server to hold a client secret; see the
 * design discussion). Every write action (PR submission, README commit)
 * reads the token from here and calls the GitHub REST API directly from the
 * browser — no backend involved.
 */
export function useGitHubAuth() {
  const [auth, setAuth] = useState<StoredAuth | null>(() => loadStored());
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (token: string) => {
    const trimmed = token.trim();
    if (!trimmed) {
      setError('Please enter a token.');
      return false;
    }
    setConnecting(true);
    setError(null);
    try {
      const user = await fetchGitHubUser(trimmed);
      const next: StoredAuth = { token: trimmed, user };
      setAuth(next);
      persistStored(next);
      return true;
    } catch {
      setError('This token is invalid or has expired. Please check it and try again.');
      return false;
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAuth(null);
    persistStored(null);
  }, []);

  return {
    token: auth?.token ?? null,
    user: auth?.user ?? null,
    connecting,
    error,
    connect,
    disconnect,
    clearError: () => setError(null),
  };
}
