import { useCallback, useRef, useState } from 'react';
import { IconSprite, Icon } from './components/Icon';
import { LibraryPanel } from './components/library/LibraryPanel';
import { Canvas } from './components/editor/Canvas';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { useCanvasEditor } from './components/editor/useCanvasEditor';

function App() {
  const editor = useCanvasEditor();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [markdown, setMarkdown] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1600);
  }, []);

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
          </div>
          <div className="right">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => showToast('Save isn’t wired up yet — use Copy Markdown or Export for now.')}
            >
              Save
            </button>
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
          <LibraryPanel onUse={editor.addFromLibrary} />
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

      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </>
  );
}

export default App;
