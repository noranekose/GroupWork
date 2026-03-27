import * as ts from 'typescript';

export const NO_LOG_PLACEHOLDER = '（console.log の出力はありません）';

const SANDBOX_RESPONSE_TIMEOUT_MS = 2000;
const SANDBOX_EVENT_KEY = '__tsSandbox';

type RunResult = {
  success: boolean;
  output: string;
  errorMessage: string;
};

let sandboxFrame: HTMLIFrameElement | null = null;
let sandboxReadyPromise: Promise<HTMLIFrameElement> | null = null;
let requestId = 0;
const pending = new Map<number, (result: RunResult) => void>();

function cleanupSandbox() {
  sandboxFrame?.remove();
  sandboxFrame = null;
  sandboxReadyPromise = null;
}

function installMessageListener() {
  if ((window as Window & { __tsSandboxListenerInstalled?: boolean }).__tsSandboxListenerInstalled) {
    return;
  }

  window.addEventListener('message', (event: MessageEvent<unknown>) => {
    if (!event.data || typeof event.data !== 'object') return;

    const payload = event.data as {
      __tsSandbox?: boolean;
      id?: number;
      success?: boolean;
      output?: string;
      errorMessage?: string;
    };

    if (!payload.__tsSandbox || typeof payload.id !== 'number') return;
    if (event.source !== sandboxFrame?.contentWindow) return;

    const resolver = pending.get(payload.id);
    if (!resolver) return;
    pending.delete(payload.id);
    resolver({
      success: Boolean(payload.success),
      output: typeof payload.output === 'string' ? payload.output : '',
      errorMessage: typeof payload.errorMessage === 'string' ? payload.errorMessage : '',
    });
  });

  (window as Window & { __tsSandboxListenerInstalled?: boolean }).__tsSandboxListenerInstalled = true;
}

function getSandboxHtml(): string {
  return `<!doctype html>
<html>
  <body>
    <script>
      (function () {
        const EVENT_KEY = '${SANDBOX_EVENT_KEY}';
        const NO_LOG = '${NO_LOG_PLACEHOLDER}';

        const block = function () {
          throw new Error('この学習環境では利用できません。');
        };
        window.fetch = block;
        window.XMLHttpRequest = function () { throw new Error('この学習環境では利用できません。'); };
        window.WebSocket = function () { throw new Error('この学習環境では利用できません。'); };
        window.EventSource = function () { throw new Error('この学習環境では利用できません。'); };

        window.parent.postMessage({ [EVENT_KEY]: true, type: 'ready' }, '*');

        window.addEventListener('message', function (event) {
          const data = event.data || {};
          if (!data[EVENT_KEY] || data.type !== 'run') return;

          const lines = [];
          const consoleProxy = {
            log: function () { lines.push(Array.from(arguments).join(' ')); },
            warn: function () { lines.push('[warn] ' + Array.from(arguments).join(' ')); },
            error: function () { lines.push('[error] ' + Array.from(arguments).join(' ')); },
          };

          try {
            const fn = new Function(
              'console',
              '"use strict";\\n' +
              'const parent = undefined;\\n' +
              'const top = undefined;\\n' +
              'const opener = undefined;\\n' +
              data.code
            );
            fn(consoleProxy);
            window.parent.postMessage(
              { [EVENT_KEY]: true, id: data.id, success: true, output: lines.length ? lines.join('\\n') : NO_LOG, errorMessage: '' },
              '*'
            );
          } catch (e) {
            window.parent.postMessage(
              { [EVENT_KEY]: true, id: data.id, success: false, output: lines.join('\\n'), errorMessage: '実行時エラー: ' + (e && e.message ? e.message : String(e)) },
              '*'
            );
          }
        });
      })();
    <\/script>
  </body>
</html>`;
}

async function ensureSandboxFrame(): Promise<HTMLIFrameElement> {
  if (sandboxFrame?.contentWindow) return sandboxFrame;
  if (sandboxReadyPromise) return sandboxReadyPromise;

  installMessageListener();

  sandboxReadyPromise = new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.style.display = 'none';
    iframe.srcdoc = getSandboxHtml();

    const timeoutId = window.setTimeout(() => {
      cleanupSandbox();
      reject(new Error('サンドボックスの初期化がタイムアウトしました。'));
    }, SANDBOX_RESPONSE_TIMEOUT_MS);

    const onReady = (event: MessageEvent<unknown>) => {
      if (!event.data || typeof event.data !== 'object') return;
      const data = event.data as { __tsSandbox?: boolean; type?: string };
      if (!data.__tsSandbox || data.type !== 'ready') return;
      if (event.source !== iframe.contentWindow) return;

      window.clearTimeout(timeoutId);
      window.removeEventListener('message', onReady);
      sandboxFrame = iframe;
      resolve(iframe);
    };

    window.addEventListener('message', onReady);
    document.body.appendChild(iframe);
  }).finally(() => {
    sandboxReadyPromise = null;
  });

  return sandboxReadyPromise;
}

async function executeInSandbox(code: string): Promise<RunResult> {
  const iframe = await ensureSandboxFrame();
  const id = ++requestId;

  return new Promise((resolve) => {
    pending.set(id, resolve);

    const timeoutId = window.setTimeout(() => {
      if (!pending.has(id)) return;
      pending.delete(id);
      cleanupSandbox();
      resolve({
        success: false,
        output: '',
        errorMessage: '実行時エラー: コード実行がタイムアウトしました。無限ループの可能性があります。',
      });
    }, SANDBOX_RESPONSE_TIMEOUT_MS);

    pending.set(id, (result) => {
      window.clearTimeout(timeoutId);
      resolve(result);
    });

    iframe.contentWindow?.postMessage(
      {
        [SANDBOX_EVENT_KEY]: true,
        type: 'run',
        id,
        code,
      },
      '*'
    );
  });
}

/**
 * ブラウザ上で TypeScript をトランスパイルし、console.log を捕捉して実行する
 */
export async function runTypeScript(source: string): Promise<RunResult> {
  const { outputText, diagnostics } = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.None,
      strict: true,
      isolatedModules: true,
      noImplicitAny: true,
    },
    reportDiagnostics: true,
  });

  const diagTexts =
    diagnostics
      ?.filter((d) => d.category === ts.DiagnosticCategory.Error)
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')) ?? [];

  if (diagTexts.length > 0) {
    return {
      success: false,
      output: '',
      errorMessage: diagTexts.join('\n'),
    };
  }

  const result = await executeInSandbox(outputText);
  return {
    success: result.success,
    output: result.output
      ? result.output
      : result.success
        ? NO_LOG_PLACEHOLDER
        : '',
    errorMessage: result.errorMessage,
  };
}
