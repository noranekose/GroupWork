import { describe, it, expect } from 'vitest';
import { normalizeOutputForJudge } from './normalizeOutput';

describe('normalizeOutputForJudge', () => {
  describe('基本的な動作', () => {
    it('通常の文字列をそのまま返す', () => {
      expect(normalizeOutputForJudge('Hello, TypeScript!')).toBe('Hello, TypeScript!');
    });

    it('空文字列を空文字列として返す', () => {
      expect(normalizeOutputForJudge('')).toBe('');
    });

    it('空白のみの文字列を空文字列にする', () => {
      expect(normalizeOutputForJudge('   ')).toBe('');
    });
  });

  describe('改行コードの正規化', () => {
    it('CRLF（Windows改行）をLFに変換する', () => {
      expect(normalizeOutputForJudge('line1\r\nline2')).toBe('line1\nline2');
    });

    it('複数のCRLFをすべてLFに変換する', () => {
      expect(normalizeOutputForJudge('a\r\nb\r\nc')).toBe('a\nb\nc');
    });

    it('LFのみの改行はそのまま保持する', () => {
      expect(normalizeOutputForJudge('line1\nline2\nline3')).toBe('line1\nline2\nline3');
    });
  });

  describe('行末の空白トリム', () => {
    it('各行末のスペースを除去する', () => {
      expect(normalizeOutputForJudge('line1   \nline2  ')).toBe('line1\nline2');
    });

    it('各行末のタブを除去する', () => {
      expect(normalizeOutputForJudge('line1\t\nline2\t\t')).toBe('line1\nline2');
    });

    it('行頭の空白は trim() によって先頭行の先頭空白が除去される', () => {
      // normalizeOutputForJudge は最後に .trim() を呼ぶため、
      // 文字列全体の先頭・末尾の空白も除去される（仕様）
      expect(normalizeOutputForJudge('  indented\n  also indented')).toBe('indented\n  also indented');
    });
  });

  describe('前後のトリム', () => {
    it('文字列先頭の改行を除去する', () => {
      expect(normalizeOutputForJudge('\nHello')).toBe('Hello');
    });

    it('文字列末尾の改行を除去する', () => {
      expect(normalizeOutputForJudge('Hello\n')).toBe('Hello');
    });

    it('前後の空白と改行を除去する', () => {
      expect(normalizeOutputForJudge('\n  Hello  \n')).toBe('Hello');
    });
  });

  describe('組み合わせ（CRLF + 行末スペース + 前後トリム）', () => {
    it('CRLFと行末スペースと前後トリムを同時に処理する', () => {
      const input = '\r\nline1   \r\nline2  \r\n';
      expect(normalizeOutputForJudge(input)).toBe('line1\nline2');
    });

    it('実際のレッスン出力形式を正規化する（Hello, TypeScript!）', () => {
      const windowsOutput = 'Hello, TypeScript!  \r\n';
      const unixOutput = 'Hello, TypeScript!\n';
      expect(normalizeOutputForJudge(windowsOutput)).toBe(normalizeOutputForJudge(unixOutput));
    });

    it('複数行出力の正規化（typesレッスンの期待出力）', () => {
      const input = 'count: 42\r\nok: true\r\nscores: [80,90,100]   ';
      const expected = 'count: 42\nok: true\nscores: [80,90,100]';
      expect(normalizeOutputForJudge(input)).toBe(expected);
    });
  });

  describe('境界値テスト', () => {
    it('改行のみの文字列を空文字列にする', () => {
      expect(normalizeOutputForJudge('\n\n\n')).toBe('');
    });

    it('CRLFのみの文字列を空文字列にする', () => {
      expect(normalizeOutputForJudge('\r\n\r\n')).toBe('');
    });

    it('1文字の文字列をそのまま返す', () => {
      expect(normalizeOutputForJudge('a')).toBe('a');
    });

    it('日本語文字列を正しく処理する', () => {
      expect(normalizeOutputForJudge('太郎さんは20歳です\r\n')).toBe('太郎さんは20歳です');
    });
  });
});
