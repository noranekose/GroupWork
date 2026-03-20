import * as ts from 'typescript';

function formatArg(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

/**
 * ブラウザ上で TypeScript をトランスパイルし、console.log を捕捉して実行する
 */
export function runTypeScript(source: string): {
  success: boolean;
  output: string;
  errorMessage: string;
} {
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

  const lines: string[] = [];
  const mockConsole = {
    log: (...args: unknown[]) => {
      lines.push(args.map(formatArg).join(' '));
    },
    error: (...args: unknown[]) => {
      lines.push('[error] ' + args.map(formatArg).join(' '));
    },
    warn: (...args: unknown[]) => {
      lines.push('[warn] ' + args.map(formatArg).join(' '));
    },
  };

  try {
    // eslint-disable-next-line no-new-func -- 学習用サンドボックス実行
    const fn = new Function('console', `"use strict";\n${outputText}`);
    fn(mockConsole);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      success: false,
      output: lines.length > 0 ? lines.join('\n') : '',
      errorMessage: '実行時エラー: ' + msg,
    };
  }

  return {
    success: true,
    output: lines.length > 0 ? lines.join('\n') : '（console.log の出力はありません）',
    errorMessage: '',
  };
}
