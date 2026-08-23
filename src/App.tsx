import { useCallback, useRef, useState } from 'react';
import { IconSprite, Icon } from './components/Icon';
import { LibraryPanel } from './components/library/LibraryPanel';
import { Canvas } from './components/editor/Canvas';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { useCanvasEditor } from './components/editor/useCanvasEditor';
import { useSavedDocuments } from './hooks/useSavedDocuments';
import { SaveMenu } from './components/save/SaveMenu';
import { SaveAsModal } from './components/save/SaveAsModal';
import type { SavedDocument } from './types/document';
import { useCustomComponents } from './hooks/useCustomComponents';
import { AddComponentModal } from './components/library/AddComponentModal';
import { useGitHubAuth } from './hooks/useGitHubAuth';
import { ConnectGitHubModal } from './components/github/ConnectGitHubModal';
import { CommitToGithubModal } from './components/github/CommitToGithubModal';
import { SubmitComponentPrModal } from './components/library/SubmitComponentPrModal';
import type { LibraryEntry } from './types/library';

function App() {
  const editor = useCanvasEditor();
  const documents = useSavedDocuments();
  const customComponents = useCustomComponents();
  const github = useGitHubAuth();
  const [activeDoc, setActiveDoc] = useState<{ id: string; name: string } | null>(null);
  const [saveAsOpen, setSaveAsOpen] = useState(false);
  const [addComponentOpen, setAddComponentOpen] = useState(false);
  const [githubConnectOpen, setGithubConnectOpen] = useState(false);
  const [commitOpen, setCommitOpen] = useState(false);
  const [commitMarkdown, setCommitMarkdown] = useState('');
  const [prEntry, setPrEntry] = useState<LibraryEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [markdown, setMarkdown] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1600);
  }, []);

  const handleQuickSave = useCallback(() => {
    if (!activeDoc) return;
    documents.overwrite(activeDoc.id, editor.serializeCanvas());
    showToast('Saved');
  }, [activeDoc, documents, editor, showToast]);

  const handleConfirmSaveAs = useCallback(
    (name: string) => {
      const doc = documents.saveAs(name, editor.serializeCanvas());
      setActiveDoc({ id: doc.id, name: doc.name });
      setSaveAsOpen(false);
      showToast('Saved');
    },
    [documents, editor, showToast],
  );

  const handleLoad = useCallback(
    (doc: SavedDocument) => {
      editor.loadFromBlocks(doc.blocks);
      setActiveDoc({ id: doc.id, name: doc.name });
      showToast('Loaded');
    },
    [editor, showToast],
  );

  const handleRename = useCallback(
    (id: string, name: string) => {
      documents.rename(id, name);
      setActiveDoc((prev) => (prev && prev.id === id ? { ...prev, name } : prev));
    },
    [documents],
  );

  const handleDelete = useCallback(
    (id: string) => {
      documents.remove(id);
      setActiveDoc((prev) => (prev && prev.id === id ? null : prev));
    },
    [documents],
  );

  const handleUseComponent = useCallback(
    (libId: string) => {
      if (libId.startsWith('custom-')) {
        const entry = customComponents.customComponents.find((c) => c.id === libId);
        if (entry) editor.addCustomEntry(entry);
        return;
      }
      editor.addFromLibrary(libId);
    },
    [customComponents.customComponents, editor],
  );

  const handleConnectGitHub = useCallback(
    async (token: string) => {
      const ok = await github.connect(token);
      if (ok) {
        setGithubConnectOpen(false);
        showToast('Connected to GitHub');
      }
    },
    [github, showToast],
  );

  const handleRequestSubmitPr = useCallback(
    (entry: LibraryEntry) => {
      if (!github.user) {
        showToast('Please connect to GitHub first');
        setGithubConnectOpen(true);
        return;
      }
      setPrEntry(entry);
    },
    [github.user, showToast],
  );

  // Adding a component and proposing it to the project used to be two
  // separate trips (add here, then hunt down the new card in the library to
  // hit "Submit PR to GitHub"). Now finishing the wizard goes straight into
  // the same PR flow — still requires the user's own confirm click inside
  // SubmitComponentPrModal, this just removes the extra navigation before it.
  const handleCreateComponent = useCallback(
    (entry: Parameters<typeof customComponents.addCustomComponent>[0]) => {
      const created = customComponents.addCustomComponent(entry);
      editor.addCustomEntry(created);
      setAddComponentOpen(false);
      if (github.user) showToast('Component added · Preparing PR');
      handleRequestSubmitPr(created);
    },
    [customComponents, editor, github.user, showToast, handleRequestSubmitPr],
  );

  const openCommitModal = useCallback(() => {
    setCommitMarkdown(editor.buildFullMarkdown());
    setCommitOpen(true);
  }, [editor]);

  const openMarkdownDrawer = useCallback(() => {
    setMarkdown(editor.buildFullMarkdown());
    setDrawerOpen(true);
  }, [editor]);

  const copyMarkdown = useCallback(() => {
    const md = editor.buildFullMarkdown();
    navigator.clipboard?.writeText(md).catch(() => {});
    showToast('Markdown copied to clipboard');
  }, [editor, showToast]);

  const exportMarkdown = useCallback(() => {
    const md = editor.buildFullMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    a.click();
    URL.revokeObjectURL(url);
    showToast('README.md downloaded');
  }, [editor, showToast]);

  return (
    <>
      <IconSprite />
      <div className="editor-shell">
        <div className="editor-topbar">
          <div className="left">
            <div className="mark">R</div>
            GitHub Readme Canvas
            <a
              className="icon-btn repo-link"
              href="https://github.com/jongeuni/github-readme-canvas"
              target="_blank"
              rel="noreferrer"
              title="View source on GitHub"
              aria-label="View source on GitHub"
            >
              <Icon name="github" />
            </a>
            {activeDoc && <span className="doc-name"> · {activeDoc.name}</span>}
          </div>
          <div className="right">
            {github.user ? (
              <div
                className="avatar-chip"
                title="Click to disconnect from GitHub"
                onClick={() => {
                  github.disconnect();
                  showToast('Disconnected from GitHub');
                }}
              >
                {github.user.avatarUrl ? <img src={github.user.avatarUrl} alt="" /> : <span className="dot">{github.user.login.charAt(0).toUpperCase()}</span>}
                {github.user.login}
              </div>
            ) : null}
            {github.user && (
              <button type="button" className="btn btn-primary btn-sm" onClick={openCommitModal}>
                <Icon name="github" />
                Commit to GitHub
              </button>
            )}
            {!github.user && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setGithubConnectOpen(true)}>
                <Icon name="github" />
                Connect GitHub
              </button>
            )}
            <SaveMenu
              documents={documents.documents}
              activeDocId={activeDoc?.id ?? null}
              onQuickSave={handleQuickSave}
              onOpenSaveAs={() => setSaveAsOpen(true)}
              onLoad={handleLoad}
              onRename={handleRename}
              onDelete={handleDelete}
            />
            <button type="button" className="btn btn-secondary btn-sm" onClick={openMarkdownDrawer}>
              <Icon name="code" />
              Copy Markdown
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={exportMarkdown}>
              Export
            </button>
          </div>
        </div>
        <div className="editor-body">
          <LibraryPanel
            onUse={handleUseComponent}
            customComponents={customComponents.customComponents}
            onRemoveCustomComponent={customComponents.removeCustomComponent}
            onRequestAddComponent={() => setAddComponentOpen(true)}
            onSubmitPr={handleRequestSubmitPr}
          />
          <Canvas editor={editor} />
          <SettingsPanel editor={editor} />
        </div>
      </div>

      <div className={`md-overlay ${drawerOpen ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && setDrawerOpen(false)}>
        <div className="md-drawer">
          <div className="md-drawer-head">
            <h3>Markdown</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-primary btn-sm" onClick={copyMarkdown}>
                <Icon name="copy" />
                Copy Markdown
              </button>
              <button type="button" className="icon-btn" onClick={() => setDrawerOpen(false)}>
                <Icon name="close" />
              </button>
            </div>
          </div>
          <div className="md-drawer-body">
            <pre>
              <code>{markdown}</code>
            </pre>
          </div>
        </div>
      </div>

      <SaveAsModal open={saveAsOpen} onCancel={() => setSaveAsOpen(false)} onConfirm={handleConfirmSaveAs} />

      <AddComponentModal open={addComponentOpen} onCancel={() => setAddComponentOpen(false)} onCreate={handleCreateComponent} />

      <ConnectGitHubModal
        open={githubConnectOpen}
        connecting={github.connecting}
        error={github.error}
        onCancel={() => setGithubConnectOpen(false)}
        onConnect={handleConnectGitHub}
        onDismissError={github.clearError}
      />

      <CommitToGithubModal open={commitOpen} token={github.token} markdown={commitMarkdown} onCancel={() => setCommitOpen(false)} />

      <SubmitComponentPrModal open={!!prEntry} token={github.token} entry={prEntry} onCancel={() => setPrEntry(null)} />

      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </>
  );
}

export default App;
