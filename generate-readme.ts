import { readFileSync, writeFileSync } from 'node:fs';

let readme = `# Sky utils
**JavaScript/TypeScript utilities**

Basically library, but it's too simple to be on npm.`;

const files = readFileSync('./index.ts', 'utf8')
  .split('\n')
  .map((x) => x.slice(16, -2))
  .slice(0, -1);

function extractCommentText(text: string) {
  return text
    .split('\n')
    .map((x) => x.trim())
    .map((x) => (x.startsWith('*') ? x.slice(1) : x))
    .map((x) => x.trim())
    .join('\n')
    .trim();
}
for (const file of files) {
  const content = readFileSync(`.${file}.ts`, 'utf8');
  readme += `\n\n## ${file.slice(5)}\n${extractCommentText(/\/\*\*([^/]+?)\*\//s.exec(content)![1]!)}`;
  for (const match of content.matchAll(
    /\/\*\*([^/]+?)\*\/\n(\/\/[^\n]+?\n)*export ((const|function|async function|function*|type|class) \w+)/gs,
  ))
    readme += `\n### ${match[3]}\n${extractCommentText(match[1]!)}`;
}
writeFileSync('./README.md', readme, 'utf8');
