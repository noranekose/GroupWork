import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, 'test-cases_20260511.xlsx');

const workbook = new ExcelJS.Workbook();
workbook.creator = 'qa-agent';
workbook.created = new Date('2026-05-11');

// ヘッダー定義（全シート共通）
const HEADERS = [
  { header: 'テストID', key: 'id', width: 12 },
  { header: 'テスト名', key: 'name', width: 45 },
  { header: '分類', key: 'category', width: 12 },
  { header: '前提条件', key: 'precondition', width: 40 },
  { header: '手順', key: 'steps', width: 60 },
  { header: '期待値', key: 'expected', width: 50 },
  { header: '優先度', key: 'priority', width: 10 },
];

function createSheet(name) {
  const ws = workbook.addWorksheet(name);
  ws.columns = HEADERS;

  // ヘッダー行スタイル
  const headerRow = ws.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' },
    };
  });
  headerRow.height = 22;

  // ヘッダー行を固定
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  return ws;
}

function addRow(ws, data, rowIndex) {
  const row = ws.addRow(data);
  const bgColor = rowIndex % 2 === 0 ? 'FFDAE8F5' : 'FFFFFFFF';
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    cell.alignment = { vertical: 'top', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    };
  });
  // 優先度セルに色付け
  const prioCell = row.getCell('priority');
  if (prioCell.value === '高') {
    prioCell.font = { bold: true, color: { argb: 'FFCC0000' } };
  } else if (prioCell.value === '中') {
    prioCell.font = { bold: true, color: { argb: 'FFCC6600' } };
  } else {
    prioCell.font = { color: { argb: 'FF006600' } };
  }
  row.height = 60;
}

// ─────────────────────────────────────────────
// シート1: normalizeOutput.ts
// ─────────────────────────────────────────────
const wsNorm = createSheet('normalizeOutput');
const normCases = [
  {
    id: 'TC-001', name: '通常の文字列をそのまま返す', category: '正常系',
    precondition: 'normalizeOutputForJudge 関数がインポートされている',
    steps: '1. normalizeOutputForJudge("Hello, TypeScript!") を呼び出す',
    expected: '"Hello, TypeScript!" がそのまま返される', priority: '高',
  },
  {
    id: 'TC-002', name: '空文字列を空文字列として返す', category: '境界値',
    precondition: 'normalizeOutputForJudge 関数がインポートされている',
    steps: '1. normalizeOutputForJudge("") を呼び出す',
    expected: '空文字列 "" が返される', priority: '高',
  },
  {
    id: 'TC-003', name: '空白のみの文字列を空文字列にする', category: '正常系',
    precondition: 'normalizeOutputForJudge 関数がインポートされている',
    steps: '1. normalizeOutputForJudge("   ") を呼び出す',
    expected: '空文字列 "" が返される（.trim() により除去）', priority: '中',
  },
  {
    id: 'TC-004', name: 'CRLF（Windows改行）をLFに変換する', category: '正常系',
    precondition: 'normalizeOutputForJudge 関数がインポートされている',
    steps: '1. normalizeOutputForJudge("line1\\r\\nline2") を呼び出す',
    expected: '"line1\\nline2" が返される', priority: '高',
  },
  {
    id: 'TC-005', name: '複数のCRLFをすべてLFに変換する', category: '正常系',
    precondition: 'normalizeOutputForJudge 関数がインポートされている',
    steps: '1. normalizeOutputForJudge("a\\r\\nb\\r\\nc") を呼び出す',
    expected: '"a\\nb\\nc" が返される', priority: '中',
  },
  {
    id: 'TC-006', name: 'LFのみの改行はそのまま保持する', category: '正常系',
    precondition: 'normalizeOutputForJudge 関数がインポートされている',
    steps: '1. normalizeOutputForJudge("line1\\nline2\\nline3") を呼び出す',
    expected: '"line1\\nline2\\nline3" が返される', priority: '中',
  },
  {
    id: 'TC-007', name: '各行末のスペースを除去する', category: '正常系',
    precondition: 'normalizeOutputForJudge 関数がインポートされている',
    steps: '1. normalizeOutputForJudge("line1   \\nline2  ") を呼び出す',
    expected: '"line1\\nline2" が返される（各行末スペース除去）', priority: '高',
  },
  {
    id: 'TC-008', name: '各行末のタブを除去する', category: '正常系',
    precondition: 'normalizeOutputForJudge 関数がインポートされている',
    steps: '1. normalizeOutputForJudge("line1\\t\\nline2\\t\\t") を呼び出す',
    expected: '"line1\\nline2" が返される（各行末タブ除去）', priority: '中',
  },
  {
    id: 'TC-009', name: '文字列先頭の改行を除去する（.trim()）', category: '正常系',
    precondition: 'normalizeOutputForJudge 関数がインポートされている',
    steps: '1. normalizeOutputForJudge("\\nHello") を呼び出す',
    expected: '"Hello" が返される', priority: '中',
  },
  {
    id: 'TC-010', name: '文字列末尾の改行を除去する（.trim()）', category: '正常系',
    precondition: 'normalizeOutputForJudge 関数がインポートされている',
    steps: '1. normalizeOutputForJudge("Hello\\n") を呼び出す',
    expected: '"Hello" が返される', priority: '中',
  },
  {
    id: 'TC-011', name: '先頭インデントが .trim() により除去される（仕様確認）', category: '仕様確認',
    precondition: 'normalizeOutputForJudge 関数がインポートされている',
    steps: '1. normalizeOutputForJudge("  indented\\n  also indented") を呼び出す',
    expected: '"indented\\n  also indented" が返される（先頭行の先頭空白のみ除去）\n※インデントを含む expectedOutput を追加する際は注意が必要', priority: '中',
  },
  {
    id: 'TC-012', name: 'CRLF・行末スペース・前後トリムを同時に処理する', category: '複合',
    precondition: 'normalizeOutputForJudge 関数がインポートされている',
    steps: '1. normalizeOutputForJudge("\\r\\nline1   \\r\\nline2  \\r\\n") を呼び出す',
    expected: '"line1\\nline2" が返される', priority: '高',
  },
  {
    id: 'TC-013', name: '改行のみの文字列を空文字列にする', category: '境界値',
    precondition: 'normalizeOutputForJudge 関数がインポートされている',
    steps: '1. normalizeOutputForJudge("\\n\\n\\n") を呼び出す',
    expected: '空文字列 "" が返される', priority: '低',
  },
  {
    id: 'TC-014', name: '日本語文字列を正しく処理する', category: '正常系',
    precondition: 'normalizeOutputForJudge 関数がインポートされている',
    steps: '1. normalizeOutputForJudge("太郎さんは20歳です\\r\\n") を呼び出す',
    expected: '"太郎さんは20歳です" が返される', priority: '中',
  },
];
normCases.forEach((tc, i) => addRow(wsNorm, tc, i));

// ─────────────────────────────────────────────
// シート2: runTypeScript.ts
// ─────────────────────────────────────────────
const wsRun = createSheet('runTypeScript');
const runCases = [
  {
    id: 'TC-015', name: '型注釈付きのコードを正常にトランスパイルする', category: '正常系',
    precondition: 'typescript パッケージがインポートされている',
    steps: '1. ts.transpileModule("const message: string = \\"Hello\\"; console.log(message);", options) を呼び出す',
    expected: 'diagnostics に Error が含まれない\noutputText に console.log が含まれる', priority: '高',
  },
  {
    id: 'TC-016', name: 'number 型の変数を正常にトランスパイルする', category: '正常系',
    precondition: 'typescript パッケージがインポートされている',
    steps: '1. ts.transpileModule("const count: number = 42; console.log(count);", options) を呼び出す',
    expected: 'diagnostics に Error が含まれない', priority: '高',
  },
  {
    id: 'TC-017', name: 'interface を正常にトランスパイルする', category: '正常系',
    precondition: 'typescript パッケージがインポートされている',
    steps: '1. interface User { name: string; age: number; } を含むコードをトランスパイルする',
    expected: 'diagnostics に Error が含まれない', priority: '高',
  },
  {
    id: 'TC-018', name: 'ユニオン型を正常にトランスパイルする', category: '正常系',
    precondition: 'typescript パッケージがインポートされている',
    steps: '1. function printId(id: string | number) を含むコードをトランスパイルする',
    expected: 'diagnostics に Error が含まれない', priority: '中',
  },
  {
    id: 'TC-019', name: '型注釈がトランスパイル後に除去される', category: '正常系',
    precondition: 'typescript パッケージがインポートされている',
    steps: '1. "const x: number = 10;" をトランスパイルする\n2. outputText を確認する',
    expected: 'outputText に ": number" が含まれない\noutputText に "const x" が含まれる', priority: '高',
  },
  {
    id: 'TC-020', name: '構文エラーはトランスパイル時に検出される', category: '異常系',
    precondition: 'typescript パッケージがインポートされている',
    steps: '1. "const x: = 10;" （不正な構文）をトランスパイルする',
    expected: 'diagnostics に category === Error の診断が1件以上含まれる', priority: '高',
  },
  {
    id: 'TC-021', name: 'NO_LOG_PLACEHOLDER 定数が正しい値で export されている', category: '正常系',
    precondition: 'runTypeScript モジュールがインポートされている',
    steps: '1. NO_LOG_PLACEHOLDER を import する',
    expected: '"（console.log の出力はありません）" と等しい', priority: '中',
  },
  {
    id: 'TC-022', name: '型エラーのあるコードで runTypeScript が success: false を返す', category: '異常系',
    precondition: 'DOM 環境（jsdom）でモックが設定されている',
    steps: '1. runTypeScript("const x: = 10;") を呼び出す\n2. 結果を待つ',
    expected: 'result.success === false\nresult.errorMessage が空でない', priority: '高',
  },
  {
    id: 'TC-023', name: '構文エラーのあるコードで runTypeScript が success: false を返す', category: '異常系',
    precondition: 'DOM 環境（jsdom）でモックが設定されている',
    steps: '1. runTypeScript("const x: = 10;") を呼び出す\n2. 結果を待つ',
    expected: 'result.success === false\nresult.errorMessage が空でない', priority: '高',
  },
  {
    id: 'TC-024', name: 'isolatedModules の制限：存在しないメソッド呼び出しはエラーにならない', category: '仕様確認',
    precondition: 'isolatedModules: true のオプションでトランスパイルする',
    steps: '1. "const x: string = \\"hello\\"; x.nonExistentMethod();" をトランスパイルする',
    expected: 'diagnostics に Error が0件（isolatedModules では存在しないメソッドは検出されない）\n※仕様による制限', priority: '低',
  },
];
runCases.forEach((tc, i) => addRow(wsRun, tc, i));

// ─────────────────────────────────────────────
// シート3: lessons.ts
// ─────────────────────────────────────────────
const wsLessons = createSheet('lessons');
const lessonCases = [
  {
    id: 'TC-025', name: 'lessons が配列として export されている', category: '正常系',
    precondition: 'lessons.ts がインポートされている',
    steps: '1. import { lessons } from "./lessons" を実行する\n2. Array.isArray(lessons) を確認する',
    expected: 'Array.isArray(lessons) === true', priority: '高',
  },
  {
    id: 'TC-026', name: 'レッスンが1件以上存在する', category: '正常系',
    precondition: 'lessons 配列がインポートされている',
    steps: '1. lessons.length を確認する',
    expected: 'lessons.length >= 1', priority: '高',
  },
  {
    id: 'TC-027', name: '現在5件のレッスンが定義されている', category: '正常系',
    precondition: 'lessons 配列がインポートされている',
    steps: '1. lessons.length を確認する',
    expected: 'lessons.length === 5', priority: '中',
  },
  {
    id: 'TC-028', name: 'すべてのレッスンに id（非空文字列）が存在する', category: '正常系',
    precondition: 'lessons 配列がインポートされている',
    steps: '1. lessons.forEach で各レッスンの id を確認する',
    expected: '全レッスンの id が string 型で長さ > 0', priority: '高',
  },
  {
    id: 'TC-029', name: 'すべてのレッスン id が一意である', category: '正常系',
    precondition: 'lessons 配列がインポートされている',
    steps: '1. lessons.map(l => l.id) で id 配列を作成する\n2. Set に変換して size と length を比較する',
    expected: 'new Set(ids).size === lessons.length', priority: '高',
  },
  {
    id: 'TC-030', name: 'すべてのレッスンに title（非空文字列）が存在する', category: '正常系',
    precondition: 'lessons 配列がインポートされている',
    steps: '1. lessons.forEach で各レッスンの title を確認する',
    expected: '全レッスンの title が string 型で長さ > 0', priority: '高',
  },
  {
    id: 'TC-031', name: 'すべてのレッスンに description（非空文字列）が存在する', category: '正常系',
    precondition: 'lessons 配列がインポートされている',
    steps: '1. lessons.forEach で各レッスンの description を確認する',
    expected: '全レッスンの description が string 型で長さ > 0', priority: '高',
  },
  {
    id: 'TC-032', name: 'すべてのレッスンに initialCode（string）が存在する', category: '正常系',
    precondition: 'lessons 配列がインポートされている',
    steps: '1. lessons.forEach で各レッスンの initialCode を確認する',
    expected: '全レッスンの initialCode が string 型（空文字も許容）', priority: '中',
  },
  {
    id: 'TC-033', name: 'すべてのレッスンに expectedOutput（非空文字列）が存在する', category: '正常系',
    precondition: 'lessons 配列がインポートされている',
    steps: '1. lessons.forEach で各レッスンの expectedOutput を確認する',
    expected: '全レッスンの expectedOutput が string 型で trim() 後に長さ > 0', priority: '高',
  },
  {
    id: 'TC-034', name: 'hint が存在するレッスンでは string 型である', category: '正常系',
    precondition: 'lessons 配列がインポートされている',
    steps: '1. lesson.hint !== undefined のレッスンを抽出する\n2. hint の型を確認する',
    expected: 'typeof lesson.hint === "string"', priority: '中',
  },
  {
    id: 'TC-035', name: 'hint が存在するレッスンには console.log が含まれる', category: '正常系',
    precondition: 'lessons 配列がインポートされている',
    steps: '1. hint が存在するレッスンを抽出する\n2. hint に console.log が含まれるか確認する',
    expected: 'lesson.hint.includes("console.log") === true', priority: '中',
  },
  {
    id: 'TC-036', name: 'hello レッスンの内容が正しい', category: '正常系',
    precondition: 'lessons 配列がインポートされている',
    steps: '1. id === "hello" のレッスンを取得する\n2. title・expectedOutput・initialCode を確認する',
    expected: 'title === "1. はじめての TypeScript"\nexpectedOutput === "Hello, TypeScript!"\ninitialCode === ""', priority: '高',
  },
  {
    id: 'TC-037', name: 'types レッスンの expectedOutput が正しい', category: '正常系',
    precondition: 'lessons 配列がインポートされている',
    steps: '1. id === "types" のレッスンを取得する\n2. expectedOutput を確認する',
    expected: '"count: 42"・"ok: true"・"scores: [80,90,100]" をすべて含む', priority: '高',
  },
  {
    id: 'TC-038', name: '各レッスンに Lesson 型に存在しないキーがない', category: '正常系',
    precondition: 'lessons 配列と Lesson 型がインポートされている',
    steps: '1. 各レッスンの Object.keys() を取得する\n2. allowedKeys と比較する',
    expected: 'Object.keys に ["id","title","description","hint","initialCode","expectedOutput"] 以外のキーが存在しない', priority: '中',
  },
];
lessonCases.forEach((tc, i) => addRow(wsLessons, tc, i));

// ─────────────────────────────────────────────
// シート4: App.tsx（E2E・UIテスト）
// ─────────────────────────────────────────────
const wsApp = createSheet('App（E2Eテスト）');
const appCases = [
  {
    id: 'TC-039', name: 'ページタイトル「TypeScript 入門」が表示される', category: '正常系',
    precondition: 'アプリが http://localhost:5173 で起動している',
    steps: '1. ブラウザで "/" にアクセスする\n2. h1 要素のテキストを確認する',
    expected: 'h1 テキストが "TypeScript 入門" である', priority: '高',
  },
  {
    id: 'TC-040', name: '最初のレッスンがアクティブ状態で表示される', category: '正常系',
    precondition: 'アプリが起動している',
    steps: '1. "/" にアクセスする\n2. "1. はじめての TypeScript" ボタンを確認する',
    expected: '1番目のレッスンボタンに active クラスが付いている', priority: '高',
  },
  {
    id: 'TC-041', name: 'サイドバーに5件のレッスンボタンが表示される', category: '正常系',
    precondition: 'アプリが起動している',
    steps: '1. "/" にアクセスする\n2. .lesson-btn の数を確認する',
    expected: '.lesson-btn が5件存在する', priority: '高',
  },
  {
    id: 'TC-042', name: '「実行する」ボタンが表示される', category: '正常系',
    precondition: 'アプリが起動している',
    steps: '1. "/" にアクセスする\n2. "実行する" ボタンを確認する',
    expected: '"実行する" テキストを持つボタンが存在する', priority: '高',
  },
  {
    id: 'TC-043', name: '「判定する」ボタンが表示される', category: '正常系',
    precondition: 'アプリが起動している',
    steps: '1. "/" にアクセスする\n2. "判定する" ボタンを確認する',
    expected: '"判定する" テキストを持つボタンが存在する', priority: '高',
  },
  {
    id: 'TC-044', name: '「初期コードに戻す」ボタンが表示される', category: '正常系',
    precondition: 'アプリが起動している',
    steps: '1. "/" にアクセスする\n2. "初期コードに戻す" ボタンを確認する',
    expected: '"初期コードに戻す" テキストを持つボタンが存在する', priority: '中',
  },
  {
    id: 'TC-045', name: 'レッスン切り替え：「2. 基本的な型」をクリックすると切り替わる', category: '正常系',
    precondition: 'アプリが起動し、レッスン1が表示されている',
    steps: '1. サイドバーの "2. 基本的な型" ボタンをクリックする\n2. h2 テキストを確認する',
    expected: 'h2 が "2. 基本的な型" に更新される\n2番目のボタンに active クラスが付く', priority: '高',
  },
  {
    id: 'TC-046', name: 'レッスン切り替え後に説明文が更新される', category: '正常系',
    precondition: 'アプリが起動し、レッスン1が表示されている',
    steps: '1. "2. 基本的な型" ボタンをクリックする\n2. .description テキストを確認する',
    expected: 'description がレッスン2の説明文に更新される', priority: '中',
  },
  {
    id: 'TC-047', name: 'レッスン切り替え後に出力パネルがリセットされる', category: '正常系',
    precondition: 'アプリが起動している',
    steps: '1. レッスン2に切り替える\n2. 出力パネルのプレースホルダーを確認する',
    expected: '「実行する」を押すとここに表示されます が表示される', priority: '中',
  },
  {
    id: 'TC-048', name: '5件すべてのレッスンを順番に切り替えられる', category: '正常系',
    precondition: 'アプリが起動している',
    steps: '1. レッスン1〜5のボタンを順番にクリックする\n2. 各レッスンの h2 を確認する',
    expected: '各クリックで h2 がそのレッスンタイトルに更新される', priority: '高',
  },
  {
    id: 'TC-049', name: 'ヒントの summary をクリックするとヒントが展開される', category: '正常系',
    precondition: 'アプリが起動し、ヒントを持つレッスンが表示されている',
    steps: '1. details.hint の summary をクリックする\n2. details の open 属性を確認する',
    expected: 'details 要素が open 状態になる', priority: '中',
  },
  {
    id: 'TC-050', name: 'ヒントを展開するとコードが表示される', category: '正常系',
    precondition: 'アプリが起動し、ヒントを持つレッスンが表示されている',
    steps: '1. details.hint の summary をクリックする\n2. .hint-code の可視性を確認する',
    expected: '.hint-code が表示状態になり、コードテキストが見える', priority: '中',
  },
  {
    id: 'TC-051', name: 'ヒントを再クリックすると閉じる', category: '正常系',
    precondition: 'アプリが起動し、ヒントが展開されている',
    steps: '1. ヒントを展開する\n2. summary をもう一度クリックする',
    expected: 'details 要素が閉じた状態になる', priority: '低',
  },
  {
    id: 'TC-052', name: '「実行する」ボタンがクリック可能である', category: '正常系',
    precondition: 'アプリが起動している（コード実行中でない）',
    steps: '1. "実行する" ボタンの disabled 属性を確認する',
    expected: '"実行する" ボタンが disabled でない', priority: '高',
  },
  {
    id: 'TC-053', name: '「実行する」クリックで処理が実行される（エラーにならない）', category: '正常系',
    precondition: 'アプリが起動している',
    steps: '1. "実行する" ボタンをクリックする\n2. エラーが発生しないことを確認する',
    expected: 'ページがクラッシュせず、出力パネルが更新される', priority: '高',
  },
  {
    id: 'TC-054', name: '「初期コードに戻す」クリックで出力パネルがリセットされる', category: '正常系',
    precondition: 'アプリが起動し、「実行する」を押した後の状態',
    steps: '1. "初期コードに戻す" ボタンをクリックする\n2. 出力パネルのプレースホルダーを確認する',
    expected: '出力パネルにプレースホルダーが再表示される', priority: '中',
  },
  {
    id: 'TC-055', name: 'header 要素が存在する', category: 'アクセシビリティ',
    precondition: 'アプリが起動している',
    steps: '1. DOM に header 要素が存在するか確認する',
    expected: 'header 要素が1件存在する', priority: '中',
  },
  {
    id: 'TC-056', name: 'footer 要素が存在する', category: 'アクセシビリティ',
    precondition: 'アプリが起動している',
    steps: '1. DOM に footer 要素が存在するか確認する',
    expected: 'footer 要素が1件存在する', priority: '中',
  },
  {
    id: 'TC-057', name: 'Monaco エディタコンテナに aria-label が付いている', category: 'アクセシビリティ',
    precondition: 'アプリが起動している',
    steps: '1. .code-editor-container の aria-label 属性を確認する',
    expected: 'aria-label === "TypeScript コードエディタ"', priority: '中',
  },
  {
    id: 'TC-058', name: 'ナビゲーションに aria-label が付いている', category: 'アクセシビリティ',
    precondition: 'アプリが起動している',
    steps: '1. nav 要素の aria-label 属性を確認する',
    expected: 'aria-label === "レッスン一覧"', priority: '中',
  },
  {
    id: 'TC-059', name: '出力パネルに aria-live が付いている', category: 'アクセシビリティ',
    precondition: 'アプリが起動している',
    steps: '1. .output-panel の aria-live 属性を確認する',
    expected: 'aria-live === "polite"', priority: '中',
  },
  {
    id: 'TC-060', name: '合格モーダルに role="dialog" と aria-modal が付いている', category: 'アクセシビリティ',
    precondition: '正解コードを入力して「判定する」を押した後の状態',
    steps: '1. モーダルの role 属性を確認する\n2. aria-modal 属性を確認する\n3. aria-labelledby 属性を確認する',
    expected: 'role === "dialog"\naria-modal === "true"\naria-labelledby が pass-modal-title を参照', priority: '中',
  },
];
appCases.forEach((tc, i) => addRow(wsApp, tc, i));

// ─────────────────────────────────────────────
// ファイル保存
// ─────────────────────────────────────────────
await workbook.xlsx.writeFile(OUTPUT_PATH);
console.log(`✅ Excel ファイルを出力しました: ${OUTPUT_PATH}`);
console.log(`   シート数: ${workbook.worksheets.length}`);
console.log(`   総テストケース数: ${normCases.length + runCases.length + lessonCases.length + appCases.length}`);
