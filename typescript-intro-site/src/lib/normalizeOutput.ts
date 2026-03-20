/** 判定用：改行・行末空白を揃えて比較する */
export function normalizeOutputForJudge(s: string): string {
  return s
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}
