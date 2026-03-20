export type Lesson = {
  id: string;
  title: string;
  description: string;
  hint?: string;
  initialCode: string;
  /** 実行結果がこれと一致すれば合格（ヒントどおり実行したときの出力） */
  expectedOutput: string;
};

export const lessons: Lesson[] = [
  {
    id: 'hello',
    title: '1. はじめての TypeScript',
    description: '「Hello, TypeScript!」って出力してみよう！',
    hint: `const message: string = "Hello, TypeScript!";\nconsole.log(message);\n`,
    initialCode: '',
    expectedOutput: 'Hello, TypeScript!',
  },
  {
    id: 'types',
    title: '2. 基本的な型',
    description: 'number / boolean / 配列の型を書いて、値を `console.log` で出してみよう！',
    hint: `const count: number = 42;\nconst ok: boolean = true;\nconst scores: number[] = [80, 90, 100];\n\nconsole.log("count:", count);\nconsole.log("ok:", ok);\nconsole.log("scores:", scores);\n`,
    initialCode: '',
    expectedOutput: 'count: 42\nok: true\nscores: [80,90,100]',
  },
  {
    id: 'interface',
    title: '3. インターフェース',
    description: '`interface` を作って、オブジェクトの形（name と age）を決めてみよう！',
    hint: `interface User {\n  name: string;\n  age: number;\n}\n\nconst user: User = {\n  name: "太郎",\n  age: 20,\n};\n\nconsole.log(user.name + "さんは" + user.age + "歳です");\n`,
    initialCode: '',
    expectedOutput: '太郎さんは20歳です',
  },
  {
    id: 'function',
    title: '4. 関数の型',
    description: '引数と戻り値に型を付けた `add` 関数を作って、結果を表示してみよう！',
    hint: `function add(a: number, b: number): number {\n  return a + b;\n}\n\nconst result = add(10, 32);\nconsole.log("10 + 32 =", result);\n`,
    initialCode: '',
    expectedOutput: '10 + 32 = 42',
  },
  {
    id: 'union',
    title: '5. ユニオン型',
    description: '`string | number` を使って、数値でも文字列でも受け取れる関数を作ってみよう！',
    hint: `function printId(id: string | number): void {\n  console.log(\"ID:\", id);\n}\n\nprintId(101);\nprintId(\"202\");\n`,
    initialCode: '',
    expectedOutput: 'ID: 101\nID: 202',
  },
];
