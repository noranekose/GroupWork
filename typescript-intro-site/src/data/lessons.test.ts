import { describe, it, expect } from 'vitest';
import { lessons } from './lessons';
import type { Lesson } from './lessons';

describe('lessons データのスキーマ検証', () => {
  describe('レッスン配列の基本構造', () => {
    it('lessons が配列として export されている', () => {
      expect(Array.isArray(lessons)).toBe(true);
    });

    it('レッスンが1件以上存在する', () => {
      expect(lessons.length).toBeGreaterThan(0);
    });

    it('現在5件のレッスンが定義されている', () => {
      expect(lessons).toHaveLength(5);
    });
  });

  describe('各レッスンの必須フィールド検証', () => {
    it('すべてのレッスンに id が存在する', () => {
      lessons.forEach((lesson) => {
        expect(lesson.id).toBeDefined();
        expect(typeof lesson.id).toBe('string');
        expect(lesson.id.length).toBeGreaterThan(0);
      });
    });

    it('すべてのレッスンに title が存在する', () => {
      lessons.forEach((lesson) => {
        expect(lesson.title).toBeDefined();
        expect(typeof lesson.title).toBe('string');
        expect(lesson.title.length).toBeGreaterThan(0);
      });
    });

    it('すべてのレッスンに description が存在する', () => {
      lessons.forEach((lesson) => {
        expect(lesson.description).toBeDefined();
        expect(typeof lesson.description).toBe('string');
        expect(lesson.description.length).toBeGreaterThan(0);
      });
    });

    it('すべてのレッスンに initialCode が存在する（空文字も可）', () => {
      lessons.forEach((lesson) => {
        expect(lesson.initialCode).toBeDefined();
        expect(typeof lesson.initialCode).toBe('string');
      });
    });

    it('すべてのレッスンに expectedOutput が存在する', () => {
      lessons.forEach((lesson) => {
        expect(lesson.expectedOutput).toBeDefined();
        expect(typeof lesson.expectedOutput).toBe('string');
        expect(lesson.expectedOutput.length).toBeGreaterThan(0);
      });
    });
  });

  describe('id の一意性検証', () => {
    it('すべてのレッスン id が一意である', () => {
      const ids = lessons.map((l) => l.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('オプションフィールドの型検証', () => {
    it('hint が定義されている場合は string 型である', () => {
      lessons.forEach((lesson) => {
        if (lesson.hint !== undefined) {
          expect(typeof lesson.hint).toBe('string');
        }
      });
    });

    it('hint がない場合は undefined である', () => {
      const lessonsWithoutHint = lessons.filter((l) => l.hint === undefined);
      lessonsWithoutHint.forEach((lesson) => {
        expect(lesson.hint).toBeUndefined();
      });
    });
  });

  describe('個別レッスンの内容検証', () => {
    it('hello レッスンが正しく定義されている', () => {
      const lesson = lessons.find((l) => l.id === 'hello');
      expect(lesson).toBeDefined();
      expect(lesson!.title).toBe('1. はじめての TypeScript');
      expect(lesson!.expectedOutput).toBe('Hello, TypeScript!');
      expect(lesson!.initialCode).toBe('');
    });

    it('types レッスンが正しく定義されている', () => {
      const lesson = lessons.find((l) => l.id === 'types');
      expect(lesson).toBeDefined();
      expect(lesson!.expectedOutput).toContain('count: 42');
      expect(lesson!.expectedOutput).toContain('ok: true');
      expect(lesson!.expectedOutput).toContain('scores: [80,90,100]');
    });

    it('interface レッスンが正しく定義されている', () => {
      const lesson = lessons.find((l) => l.id === 'interface');
      expect(lesson).toBeDefined();
      expect(lesson!.expectedOutput).toBe('太郎さんは20歳です');
    });

    it('function レッスンが正しく定義されている', () => {
      const lesson = lessons.find((l) => l.id === 'function');
      expect(lesson).toBeDefined();
      expect(lesson!.expectedOutput).toBe('10 + 32 = 42');
    });

    it('union レッスンが正しく定義されている', () => {
      const lesson = lessons.find((l) => l.id === 'union');
      expect(lesson).toBeDefined();
      expect(lesson!.expectedOutput).toBe('ID: 101\nID: 202');
    });
  });

  describe('Lesson 型との整合性検証', () => {
    it('lessons の各要素が Lesson 型の必須キーをすべて持つ', () => {
      const requiredKeys: (keyof Lesson)[] = ['id', 'title', 'description', 'initialCode', 'expectedOutput'];
      lessons.forEach((lesson) => {
        requiredKeys.forEach((key) => {
          expect(lesson).toHaveProperty(key);
        });
      });
    });

    it('lessons の各要素に Lesson 型に存在しないキーがない', () => {
      const allowedKeys: string[] = ['id', 'title', 'description', 'hint', 'initialCode', 'expectedOutput'];
      lessons.forEach((lesson) => {
        Object.keys(lesson).forEach((key) => {
          expect(allowedKeys).toContain(key);
        });
      });
    });
  });

  describe('expectedOutput の整合性検証', () => {
    it('すべての expectedOutput が空でない', () => {
      lessons.forEach((lesson) => {
        expect(lesson.expectedOutput.trim().length).toBeGreaterThan(0);
      });
    });

    it('hint が存在するレッスンでは hint に console.log が含まれる', () => {
      const lessonsWithHint = lessons.filter((l) => l.hint !== undefined);
      lessonsWithHint.forEach((lesson) => {
        expect(lesson.hint).toContain('console.log');
      });
    });
  });
});
