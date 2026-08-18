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
      .catch(() => setReposError('저장소 목록을 불러오지 못했어요.'))
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

  const canSubmit = !!(token && selectedRepo && branch.trim() && path.trim() && message.trim() && !busy);

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
      setResult({ kind: 'success', message: `커밋했어요 · ${selectedRepo.fullName}/${path.trim()}`, url: put.contentHtmlUrl });
    } catch (e) {
      if (e instanceof GitHubApiError && (e.status === 409 || e.status === 422)) {
        setResult({ kind: 'conflict', message: '다른 곳에서 이 파일이 방금 바뀌었어요 · 새로고침 후 다시 시도해 주세요' });
      } else {
        setResult({ kind: 'error', message: e instanceof Error ? e.message : '커밋에 실패했어요.' });
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
      setResult({ kind: 'success', message: `"${newBranch}" 브랜치에 커밋했어요 · main은 그대로예요`, url: compareUrl });
    } catch (e) {
      setResult({ kind: 'error', message: e instanceof Error ? e.message : '커밋에 실패했어요.' });
    } finally {
      setBusy(null);
    }
  };

  if (!open) return <div className="modal-overlay" />;

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-card wide">
        <h4>GitHub에 커밋</h4>

        <div className="field">
          <label>저장소</label>
          <div className="repo-search">
            <input type="text" placeholder="저장소 검색..." value={repoQuery} onChange={(e) => setRepoQuery(e.target.value)} />
            <div className="repo-list">
              {reposLoading && <div className="repo-row">불러오는 중...</div>}
              {reposError && <div className="repo-row">{reposError}</div>}
              {!reposLoading && !reposError && filteredRepos.length === 0 && <div className="repo-row">일치하는 저장소가 없어요</div>}
              {filteredRepos.slice(0, 8).map((r) => (
                <div
                  key={r.fullName}
                  className={`repo-row ${selectedRepo?.fullName === r.fullName ? 'selected' : ''}`}
                  onClick={() => setSelectedRepo(r)}
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
            <label>브랜치</label>
            <input type="text" value={branch} onChange={(e) => setBranch(e.target.value)} disabled={!selectedRepo} />
          </div>
          <div className="field">
            <label>파일 경로</label>
            <input type="text" value={path} onChange={(e) => setPath(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>커밋 메시지</label>
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>

        {result && (
          <div className={`banner ${result.kind === 'success' ? 'success' : result.kind === 'conflict' ? 'error' : 'error'}`} style={{ borderRadius: 8, marginBottom: 12 }}>
            {result.message}
            {result.kind === 'success' && (
              <a href={result.url} target="_blank" rel="noreferrer">
                GitHub에서 보기 ↗
              </a>
            )}
          </div>
        )}

        <div className="commit-actions">
          <div className="commit-option">
            <button type="button" className="btn btn-secondary btn-sm" disabled={!canSubmit} onClick={runNewBranch}>
              {busy === 'branch' ? '커밋 중...' : '커밋하기'}
            </button>
            <p>새 브랜치를 만들어 반영해요. main은 안 바뀌고, GitHub에서 직접 머지해야 실제 README에 나타나요.</p>
          </div>
          <div className="commit-option primary">
            <button type="button" className="btn btn-primary btn-sm" disabled={!canSubmit} onClick={runDirectPush}>
              {busy === 'direct' ? '커밋 중...' : '커밋 및 바로 푸시하기'}
            </button>
            <p>선택한 브랜치에 바로 반영돼요. 저장하는 즉시 실제 README가 바뀝니다.</p>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
