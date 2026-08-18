import { useState } from 'react';
import { GitHubApiError, createBranch, createPullRequest, getBranchSha, getFileContent, putFileContent } from '../../lib/github';
import type { LibraryEntry } from '../../types/library';

const OWNER = 'jongeuni';
const REPO = 'github-readme-canvas';
const DATA_PATH = 'src/data/community-components.json';

function slugify(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'component'
  );
}

type Result = { kind: 'success'; url: string; number: number } | { kind: 'error'; message: string };

export function SubmitComponentPrModal({
  open,
  token,
  entry,
  onCancel,
}: {
  open: boolean;
  token: string | null;
  entry: LibraryEntry | null;
  onCancel: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const submit = async () => {
    if (!token || !entry) return;
    setBusy(true);
    setResult(null);
    try {
      const baseSha = await getBranchSha(token, OWNER, REPO, 'main');
      const branch = `add-component-${slugify(entry.name)}-${Date.now()}`;
      await createBranch(token, OWNER, REPO, branch, baseSha);

      const existing = await getFileContent(token, OWNER, REPO, DATA_PATH, branch);
      let list: LibraryEntry[] = [];
      if (existing) {
        try {
          const parsed = JSON.parse(existing.content);
          if (Array.isArray(parsed)) list = parsed;
        } catch {
          list = [];
        }
      }

      let id = entry.id;
      const taken = new Set(list.map((e) => e.id));
      let n = 2;
      while (taken.has(id)) {
        id = `${entry.id}-${n}`;
        n += 1;
      }

      list.push({ ...entry, id });
      const content = JSON.stringify(list, null, 2) + '\n';
      await putFileContent(token, OWNER, REPO, DATA_PATH, {
        message: `Add component: ${entry.name}`,
        content,
        branch,
        sha: existing?.sha,
      });

      const pr = await createPullRequest(token, OWNER, REPO, {
        title: `Add component: ${entry.name}`,
        head: branch,
        base: 'main',
        body: `"${entry.name}" 컴포넌트를 라이브러리에 추가합니다.\n\n- 카테고리: ${entry.category}\n- 설명: ${entry.description}\n\nGitHub Readme Canvas의 "컴포넌트 추가하기"로 생성됐습니다.`,
      });
      setResult({ kind: 'success', url: pr.htmlUrl, number: pr.number });
    } catch (e) {
      setResult({ kind: 'error', message: e instanceof GitHubApiError ? e.message : '제출에 실패했어요.' });
    } finally {
      setBusy(false);
    }
  };

  if (!open || !entry) return <div className="modal-overlay" />;

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-card">
        <h4>GitHub에 PR로 올리기</h4>
        <p className="field-hint" style={{ marginTop: 0 }}>
          {'"'}
          {entry.name}
          {'"을(를) github-readme-canvas 프로젝트에 새 컴포넌트로 제안해요. 새 브랜치를 만들어 '}
          <code>community-components.json</code>
          {'에 추가하고, 자동으로 PR을 엽니다.'}
        </p>
        {result?.kind === 'success' && (
          <div className="banner success" style={{ borderRadius: 8, marginBottom: 12 }}>
            PR을 올렸어요 · #{result.number}
            <a href={result.url} target="_blank" rel="noreferrer">
              PR 보기 ↗
            </a>
          </div>
        )}
        {result?.kind === 'error' && <div className="field-error">{result.message}</div>}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
            닫기
          </button>
          {result?.kind !== 'success' && (
            <button type="button" className="btn btn-primary btn-sm" onClick={submit} disabled={busy}>
              {busy ? '올리는 중...' : 'PR 올리기'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
