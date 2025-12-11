import { readFileSync, rmSync, writeFileSync } from 'node:fs';

rmSync('dist/tests', {
  recursive: true,
  force: true
})

const DEFINITION_COLOR = {
  'function': 'CornflowerBlue',
  'function*': 'CornflowerBlue',
  'async function': 'CornflowerBlue',
  'const': 'ForestGreen',
  'type': 'Magenta',
  'enum': 'Magenta',
  'interface': 'Magenta',
  'class': 'Orange'
}

let readme = `<div align="center">

# Sky utils
**JavaScript/TypeScript utilities**

[![Latest Stable Version](https://img.shields.io/npm/v/@softsky/utils.svg)](https://www.npmjs.com/package/@softsky/utils)
[![NPM Downloads](https://img.shields.io/npm/dm/@softsky/utils.svg)](https://www.npmjs.com/package/@softsky/utils)
[![NPM Downloads](https://img.shields.io/npm/dt/@softsky/utils.svg)](https://www.npmjs.com/package/@softsky/utils)
[![Bundlephobia Size](https://img.shields.io/bundlephobia/minzip/@softsky/utils.svg)](https://www.npmjs.com/package/@softsky/utils)

\`npm i @softsky/utils\`

__ZERO DEPENDENCIES__ utils library. Test coverage __100%__.

Usual utils plus more obscure stuff that I've never seen in any library. 
Also fancy TypeScript generics and types that I often use.
</div>

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
    .trim().replace(/@example\n([\s\S]*?)(?=\n@|\n*$)/g, (match, codeBlock) => `\`\`\`ts\n${codeBlock.trim()}\n\`\`\``);
}
for (const file of files) {
  const content = readFileSync(`./src${file}.ts`, 'utf8');
  readme += `\n\n## ${file.slice(1, 2).toUpperCase()}${file.slice(2)}\n${extractCommentText(/\/\*\*([^/]+?)\*\//s.exec(content)![1]!)}\n\n`;
  for (const match of content.matchAll(
    /\/\*\*(((?!\/\*\*)[\S\s])+?)\*\/\n(\/\/[^\n]+?\n)*export ((const|function|async function|function*|type|class|enum|interface) \w+)/gs,
  )) {
    const split = match[4].split(' ');
    const definition = split.slice(0,-1).join(' ');
    readme+=`__${definition}__ \`${split.at(-1)}\` - ${extractCommentText(match[1]!)}\n\n---\n`
  }
}
writeFileSync('./README.md', readme, 'utf8');
