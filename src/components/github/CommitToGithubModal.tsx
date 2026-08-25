import { useEffect, useMemo, useState } from 'react';
import {
  GitHubApiError,
  createBranch,
  getBranchSha,
  getFileContent,
  listUserRepos,
  putFileContent,
  type GitHubRepo,
} from '../../lib/github';
import { track } from '../../lib/analytics';
import { useOverlayDismiss } from '../../hooks/useOverlayDismiss';

type Result = { kind: 'success'; message: string; url: string } | { kind: 'conflict'; message: string } | { kind: 'error'; message: string };

function slugTimestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export function CommitToGithubModal({
  open,
  token,
  markdown,
  onCancel,
}: {
  open: boolean;
  token: string | null;
  markdown: string;
  onCancel: () => void;
}) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [reposError, setReposError] = useState<string | null>(null);
  const [repoQuery, setRepoQuery] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [branch, setBranch] = useState('');
  const [path, setPath] = useState('README.md');
  const [message, setMessage] = useState('Update README via GitHub Readme Canvas');
  const [busy, setBusy] = useState<'branch' | 'direct' | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const overlayDismiss = useOverlayDismiss(onCancel);

  useEffect(() => {
    if (!open || !token) return;
    setRepos([]);
    setSelectedRepo(null);
    setRepoQuery('');
    setResult(null);
    setReposError(null);
    setReposLoading(true);
    listUserRepos(token)
      .then((list) => setRepos(list))
      .catch(() => setReposError('Failed to load the repository list.'))
      .finally(() => setReposLoading(false));
  }, [open, token]);

  useEffect(() => {
    if (selectedRepo) setBranch(selectedRepo.defaultBranch);
  }, [selectedRepo]);

  const filteredRepos = useMemo(() => {
    const q = repoQuery.trim().toLowerCase();
    if (!q) return repos;
    return repos.filter((r) => r.fullName.toLowerCase().includes(q));
  }, [repos, repoQuery]);

  // A successful commit disables both buttons until something about the
  // target actually changes (see the field handlers below clearing
  // `result`) — without this, the buttons re-enable the instant `busy`
  // clears, and a second click (a real "just in case" double-click, or
  // hitting Enter again out of habit) silently fires a second, identical
  // commit against the same repo/branch/path.
  const canSubmit = !!(token && selectedRepo && branch.trim() && path.trim() && message.trim() && !busy && result?.kind !== 'success');

  const runDirectPush = async () => {
    if (!token || !selectedRepo) return;
    setBusy('direct');
    setResult(null);
    try {
      const existing = await getFileContent(token, selectedRepo.owner, selectedRepo.name, path.trim(), branch.trim());
      const put = await putFileContent(token, selectedRepo.owner, selectedRepo.name, path.trim(), {
        message: message.trim(),
        content: markdown,
        branch: branch.trim(),
        sha: existing?.sha,
      });
      setResult({ kind: 'success', message: `Committed · ${selectedRepo.fullName}/${path.trim()}`, url: put.contentHtmlUrl });
      track({ name: 'github_committed', props: { mode: 'direct' } });
    } catch (e) {
      if (e instanceof GitHubApiError && (e.status === 409 || e.status === 422)) {
        setResult({ kind: 'conflict', message: 'This file was just changed somewhere else · please refresh and try again' });
      } else {
        setResult({ kind: 'error', message: e instanceof Error ? e.message : 'Commit failed.' });
      }
    } finally {
      setBusy(null);
    }
  };

  const runNewBranch = async () => {
    if (!token || !selectedRepo) return;
    setBusy('branch');
    setResult(null);
    try {
      const baseSha = await getBranchSha(token, selectedRepo.owner, selectedRepo.name, branch.trim());
      const newBranch = `readme-canvas-${slugTimestamp()}`;
      await createBranch(token, selectedRepo.owner, selectedRepo.name, newBranch, baseSha);
      const existing = await getFileContent(token, selectedRepo.owner, selectedRepo.name, path.trim(), newBranch);
      await putFileContent(token, selectedRepo.owner, selectedRepo.name, path.trim(), {
        message: message.trim(),
        content: markdown,
        branch: newBranch,
        sha: existing?.sha,
      });
      const compareUrl = `https://github.com/${selectedRepo.fullName}/compare/${encodeURIComponent(branch.trim())}...${encodeURIComponent(newBranch)}?expand=1`;
      setResult({ kind: 'success', message: `Committed to branch "${newBranch}" · main is untouched`, url: compareUrl });
      track({ name: 'github_committed', props: { mode: 'branch' } });
    } catch (e) {
      setResult({ kind: 'error', message: e instanceof Error ? e.message : 'Commit failed.' });
    } finally {
      setBusy(null);
    }
  };

  if (!open) return <div className="modal-overlay" />;

  return (
    <div className="modal-overlay open" {...overlayDismiss}>
      <div className="modal-card wide">
        <h4>Commit to GitHub</h4>

        <div className="field">
          <label>Repository</label>
          <div className="repo-search">
            <input type="text" placeholder="Search repositories..." value={repoQuery} onChange={(e) => setRepoQuery(e.target.value)} />
            <div className="repo-list">
              {reposLoading && <div className="repo-row">Loading...</div>}
              {reposError && <div className="repo-row">{reposError}</div>}
              {!reposLoading && !reposError && filteredRepos.length === 0 && <div className="repo-row">No matching repositories</div>}
              {filteredRepos.slice(0, 8).map((r) => (
                <div
                  key={r.fullName}
                  className={`repo-row ${selectedRepo?.fullName === r.fullName ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedRepo(r);
                    setResult(null);
                  }}
                >
                  <span className="name">{r.fullName}</span>
                  <span className="vis">{r.private ? 'Private' : 'Public'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Branch</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value);
                setResult(null);
              }}
              disabled={!selectedRepo}
            />
          </div>
          <div className="field">
            <label>File path</label>
            <input
              type="text"
              value={path}
              onChange={(e) => {
                setPath(e.target.value);
                setResult(null);
              }}
            />
          </div>
        </div>
        <div className="field">
          <label>Commit message</label>
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setResult(null);
            }}
          />
        </div>

        {result && (
          <div className={`banner ${result.kind === 'success' ? 'success' : result.kind === 'conflict' ? 'error' : 'error'}`} style={{ borderRadius: 8, marginBottom: 12 }}>
            {result.message}
            {result.kind === 'success' && (
              <a href={result.url} target="_blank" rel="noreferrer">
                View on GitHub ↗
              </a>
            )}
          </div>
        )}

        <div className="commit-actions">
          <div className="commit-option">
            <button type="button" className="btn btn-secondary btn-sm" disabled={!canSubmit} onClick={runNewBranch}>
              {busy === 'branch' ? 'Committing...' : result?.kind === 'success' ? 'Committed ✓' : 'Commit'}
            </button>
            <p>Creates a new branch with the change. main stays untouched — you'll need to merge it on GitHub for it to show up in the real README.</p>
          </div>
          <div className="commit-option primary">
            <button type="button" className="btn btn-primary btn-sm" disabled={!canSubmit} onClick={runDirectPush}>
              {busy === 'direct' ? 'Committing...' : result?.kind === 'success' ? 'Committed ✓' : 'Commit & Push Directly'}
            </button>
            <p>Applies directly to the branch you picked. The real README changes the moment you save.</p>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
