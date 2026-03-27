import { useCallback, useMemo, useState } from 'react';
import { lessons } from './data/lessons';
import { normalizeOutputForJudge } from './lib/normalizeOutput';
import { NO_LOG_PLACEHOLDER } from './lib/runTypeScript';
import './App.css';

function App() {
  const [activeId, setActiveId] = useState(lessons[0].id);
  const [codes, setCodes] = useState<Record<string, string>>(() =>
    Object.fromEntries(lessons.map((l) => [l.id, l.initialCode]))
  );
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [judging, setJudging] = useState(false);
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [failModalOpen, setFailModalOpen] = useState(false);

  const lesson = useMemo(
    () => lessons.find((l) => l.id === activeId) ?? lessons[0],
    [activeId]
  );

  const code = codes[lesson.id] ?? lesson.initialCode;

  const handleRun = useCallback(async () => {
    setRunning(true);
    setError('');
    try {
      const { runTypeScript } = await import('./lib/runTypeScript');
      const result = await runTypeScript(code);
      setError(result.errorMessage);
      setOutput(result.output);
    } catch {
      setError('実行エンジンの読み込みに失敗しました。ページを再読み込みしてください。');
      setOutput('');
    } finally {
      setRunning(false);
    }
  }, [code]);

  const handleCodeChange = (value: string) => {
    setCodes((prev) => ({ ...prev, [lesson.id]: value }));
  };

  const resetLessonToInitial = useCallback(() => {
    setCodes((prev) => ({ ...prev, [lesson.id]: lesson.initialCode }));
    setOutput('');
    setError('');
  }, [lesson.id, lesson.initialCode]);

  const handleJudge = useCallback(async () => {
    setJudging(true);
    try {
      const { runTypeScript } = await import('./lib/runTypeScript');
      const result = await runTypeScript(code);
      const expected = lesson.expectedOutput;

      if (!result.success) {
        resetLessonToInitial();
        setFailModalOpen(true);
        return;
      }

      const actual = result.output;
      if (actual === NO_LOG_PLACEHOLDER || !normalizeOutputForJudge(actual)) {
        resetLessonToInitial();
        setFailModalOpen(true);
        return;
      }

      if (normalizeOutputForJudge(actual) === normalizeOutputForJudge(expected)) {
        setPassModalOpen(true);
      } else {
        resetLessonToInitial();
        setFailModalOpen(true);
      }
    } catch {
      resetLessonToInitial();
      setFailModalOpen(true);
    } finally {
      setJudging(false);
    }
  }, [code, lesson.expectedOutput, resetLessonToInitial]);

  return (
    <div className="app">
      <header className="header">
        <h1>TypeScript 入門</h1>
        <p className="tagline">
          コードを編集して「実行する」を押すと、ブラウザ内で TypeScript が動きます
        </p>
      </header>

      <div className="layout">
        <nav className="sidebar" aria-label="レッスン一覧">
          <ul className="lesson-list">
            {lessons.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  className={l.id === activeId ? 'lesson-btn active' : 'lesson-btn'}
                  onClick={() => {
                    setActiveId(l.id);
                    setOutput('');
                    setError('');
                    setPassModalOpen(false);
                    setFailModalOpen(false);
                  }}
                >
                  {l.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="main">
          <section className="panel lesson-panel">
            <h2>{lesson.title}</h2>
            <p className="description">{lesson.description}</p>
            {lesson.hint && (
              <details className="hint">
                <summary>ヒント</summary>
                <pre className="hint-code">{lesson.hint}</pre>
              </details>
            )}
          </section>

          <section className="panel editor-panel">
            <div className="toolbar">
              <span className="toolbar-label">エディタ</span>
              <div className="toolbar-actions">
                <button type="button" className="btn secondary" onClick={resetLessonToInitial}>
                  初期コードに戻す
                </button>
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => void handleRun()}
                  disabled={running}
                >
                  {running ? '実行中…' : '実行する'}
                </button>
              </div>
            </div>
            <textarea
              className="code-input"
              spellCheck={false}
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              aria-label="TypeScript コード"
              placeholder="ここに TypeScript を書いてみよう（ヒントも参考にしてOK）"
            />
          </section>

          <section className="panel output-panel" aria-live="polite">
            <div className="output-panel-head">
              <h3>実行結果</h3>
              <button
                type="button"
                className="btn judge"
                onClick={() => void handleJudge()}
                disabled={running || judging}
              >
                {judging ? '判定中…' : '判定する'}
              </button>
            </div>
            {error && <pre className="output error">{error}</pre>}
            {!error && output && <pre className="output success">{output}</pre>}
            {!error && !output && (
              <pre className="output placeholder">「実行する」を押すとここに表示されます</pre>
            )}
          </section>
        </main>
      </div>

      {passModalOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pass-modal-title"
        >
          <div className="modal-dialog modal-pass">
            <h2 id="pass-modal-title" className="modal-title">
              合格！
            </h2>
            <p className="modal-desc">期待どおりの出力です。次のレッスンに進んでみましょう。</p>
            <button
              type="button"
              className="btn primary modal-close"
              onClick={() => setPassModalOpen(false)}
            >
              OK表示を閉じる
            </button>
          </div>
        </div>
      )}

      {failModalOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fail-modal-title"
        >
          <div className="modal-dialog modal-fail">
            <h2 id="fail-modal-title" className="modal-title">
              不合格！
            </h2>
            <p className="modal-desc">
              コードを初期状態に戻しました。ヒントを参考に、もう一度試してください。
            </p>
            <button
              type="button"
              className="btn secondary modal-close"
              onClick={() => setFailModalOpen(false)}
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      <footer className="footer">
        <small>
          学習用の簡易実行環境です。本番アプリと異なり、ネットワークやファイルにはアクセスしません。
        </small>
      </footer>
    </div>
  );
}

export default App;
