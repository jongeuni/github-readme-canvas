import { useEffect, useMemo, useState } from 'react';
import { getFileContent, listUserRepos, type GitHubRepo } from '../../lib/github';
import { useOverlayDismiss } from '../../hooks/useOverlayDismiss';

/**
 * "Open my README" — the reverse of CommitToGithubModal: pick a repository
 * (the profile repo `<login>/<login>` is pre-selected when it's in the list),
 * and its README gets parsed into canvas blocks by the same markdown parser
 * paste uses. Replaces the whole canvas, same as loading a saved document or
 * a template, so the modal says so up front instead of surprising anyone.
 */
export function ImportFromGithubModal({
  open,
  token,
  login,
  onCancel,
  onImport,
}: {
  open: boolean;
  token: string | null;
  login: string | null;
  onCancel: () => void;
  onImport: (markdown: string, source: string) => void;
}) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [reposError, setReposError] = useState<string | null>(null);
  const [repoQuery, setRepoQuery] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [branch, setBranch] = useState('');
  const [path, setPath] = useState('README.md');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayDismiss = useOverlayDismiss(onCancel);

  useEffect(() => {
    if (!open || !token) return;
    setRepos([]);
    setSelectedRepo(null);
    setRepoQuery('');
    setError(null);
    setReposError(null);
    setReposLoading(true);
    listUserRepos(token)
      .then((list) => {
        setRepos(list);
        // The profile repo (<login>/<login>) is what "my README" almost
        // always means — start there instead of making everyone search.
        const profile = login ? list.find((r) => r.fullName.toLowerCase() === `${login}/${login}`.toLowerCase()) : undefined;
        if (profile) setSelectedRepo(profile);
      })
      .catch(() => setReposError('Failed to load the repository list.'))
      .finally(() => setReposLoading(false));
  }, [open, token, login]);

  useEffect(() => {
    if (selectedRepo) setBranch(selectedRepo.defaultBranch);
  }, [selectedRepo]);

  const filteredRepos = useMemo(() => {
    const q = repoQuery.trim().toLowerCase();
    if (!q) return repos;
    return repos.filter((r) => r.fullName.toLowerCase().includes(q));
  }, [repos, repoQuery]);

  const canImport = !!(token && selectedRepo && branch.trim() && path.trim() && !busy);

  const runImport = async () => {
    if (!token || !selectedRepo) return;
    setBusy(true);
    setError(null);
    try {
      const file = await getFileContent(token, selectedRepo.owner, selectedRepo.name, path.trim(), branch.trim());
      if (!file) {
        setError(`"${path.trim()}" wasn't found on branch "${branch.trim()}" of ${selectedRepo.fullName}.`);
        return;
      }
      onImport(file.content, `${selectedRepo.fullName}/${path.trim()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load the file.');
    } finally {
      setBusy(false);
    }
  };

  if (!open) return <div className="modal-overlay" />;

  return (
    <div className="modal-overlay open" {...overlayDismiss}>
      <div className="modal-card wide">
        <h4>Open README from GitHub</h4>
        <p className="field-hint" style={{ marginTop: 0 }}>
          Loads a README from one of your repositories onto the canvas. This replaces what's currently on the canvas — save it first if you want to keep it.
        </p>

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
                    setError(null);
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
                setError(null);
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
                setError(null);
              }}
            />
          </div>
        </div>

        {error && <div className="field-error">{error}</div>}

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary btn-sm" disabled={!canImport} onClick={runImport}>
            {busy ? 'Loading...' : 'Open README'}
          </button>
        </div>
      </div>
    </div>
  );
}
