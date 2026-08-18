const API = 'https://api.github.com';

export class GitHubApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'GitHubApiError';
  }
}

async function ghFetch<T = unknown>(token: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as { message?: string });
    throw new GitHubApiError(res.status, body.message || `GitHub API error (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** UTF-8 safe base64 — plain btoa() mangles anything outside Latin-1 (e.g. Korean commit content). */
export function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export function base64ToUtf8(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ''));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export interface GitHubUser {
  login: string;
  avatarUrl: string;
  name: string | null;
}

export async function fetchGitHubUser(token: string): Promise<GitHubUser> {
  const data = await ghFetch<{ login: string; avatar_url: string; name: string | null }>(token, '/user');
  return { login: data.login, avatarUrl: data.avatar_url, name: data.name };
}

export interface GitHubRepo {
  fullName: string;
  owner: string;
  name: string;
  defaultBranch: string;
  private: boolean;
  updatedAt: string;
}

export async function listUserRepos(token: string): Promise<GitHubRepo[]> {
  const data = await ghFetch<
    { full_name: string; owner: { login: string }; name: string; default_branch: string; private: boolean; updated_at: string }[]
  >(token, '/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator');
  return data.map((r) => ({
    fullName: r.full_name,
    owner: r.owner.login,
    name: r.name,
    defaultBranch: r.default_branch,
    private: r.private,
    updatedAt: r.updated_at,
  }));
}

export async function listBranches(token: string, owner: string, repo: string): Promise<string[]> {
  const data = await ghFetch<{ name: string }[]>(token, `/repos/${owner}/${repo}/branches?per_page=100`);
  return data.map((b) => b.name);
}

export interface FileContent {
  sha: string;
  content: string;
}

/** Returns null (not throws) on a genuine 404 — "file doesn't exist yet" is an expected case, not an error. */
export async function getFileContent(token: string, owner: string, repo: string, path: string, ref: string): Promise<FileContent | null> {
  try {
    const data = await ghFetch<{ sha: string; content: string }>(
      token,
      `/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(ref)}`,
    );
    return { sha: data.sha, content: base64ToUtf8(data.content) };
  } catch (e) {
    if (e instanceof GitHubApiError && e.status === 404) return null;
    throw e;
  }
}

export async function putFileContent(
  token: string,
  owner: string,
  repo: string,
  path: string,
  opts: { message: string; content: string; branch: string; sha?: string },
): Promise<{ commitSha: string; contentHtmlUrl: string }> {
  const data = await ghFetch<{ commit: { sha: string }; content: { html_url: string } }>(
    token,
    `/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        message: opts.message,
        content: utf8ToBase64(opts.content),
        branch: opts.branch,
        sha: opts.sha,
      }),
    },
  );
  return { commitSha: data.commit.sha, contentHtmlUrl: data.content.html_url };
}

export async function getBranchSha(token: string, owner: string, repo: string, branch: string): Promise<string> {
  const data = await ghFetch<{ object: { sha: string } }>(token, `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`);
  return data.object.sha;
}

export async function createBranch(token: string, owner: string, repo: string, newBranch: string, fromSha: string): Promise<void> {
  await ghFetch(token, `/repos/${owner}/${repo}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({ ref: `refs/heads/${newBranch}`, sha: fromSha }),
  });
}

export async function createPullRequest(
  token: string,
  owner: string,
  repo: string,
  opts: { title: string; head: string; base: string; body?: string },
): Promise<{ htmlUrl: string; number: number }> {
  const data = await ghFetch<{ html_url: string; number: number }>(token, `/repos/${owner}/${repo}/pulls`, {
    method: 'POST',
    body: JSON.stringify(opts),
  });
  return { htmlUrl: data.html_url, number: data.number };
}
