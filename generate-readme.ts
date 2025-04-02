import { readFileSync, rmSync, writeFileSync } from 'node:fs';

rmSync('dist/tests', {
  recursive: true,
  force: true
})
let readme = `# Sky utils
**JavaScript/TypeScript utilities**

Utils library. 

\`npm i @softsky/utils\`

Usual utils plus more obscure stuff that I've never seen in any library. 
Also fancy TypeScript generics and types that I often use.

Test coverage __100%__.

# Contribute
I don't know why would you want to, but here's how to:
1. Install Bun
2. Install dependencies \`bun i\` or \`npm i\`
3. Lint files \`bun run lint\`
4. Run tests \`bun run test\`
5. Update README \`bun run gen-readme\`
6. Create merge request

Don't forget to follow comment style for new exported features:
\`\`\`ts
/** Description of how it works (REQUIRED) */
export function newStuff() {}
\`\`\`

# Full feature list:`;

const files = readFileSync('./src/index.ts', 'utf8')
  .split('\n')
  .map((x) => x.slice(16, -1))
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
  const content = readFileSync(`./src${file}.ts`, 'utf8');
  readme += `\n\n## ${file.slice(1, 2).toUpperCase()}${file.slice(2)}\n${extractCommentText(/\/\*\*([^/]+?)\*\//s.exec(content)![1]!)}`;
  for (const match of content.matchAll(
    /\/\*\*([^/]+?)\*\/\n(\/\/[^\n]+?\n)*export ((const|function|async function|function*|type|class) \w+)/gs,
  )) {
    const split = match[3].split(' ');
    readme += `\n### ${split.slice(0,-1).join(' ')} _${split.at(-1)}_\n${extractCommentText(match[1]!)}`;
  }
}
writeFileSync('./README.md', readme, 'utf8');
