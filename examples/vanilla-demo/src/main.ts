import Baybayin, { LANGUAGES, THEMES } from 'baybayin';
import * as dat from 'dat.gui';

const element = document.getElementById('app');

const CODE = `import Baybayin from 'baybayin';

const element = document.getElementById('app');

const CODE = \`
import Baybayin from 'baybayin';

const element = document.getElementById('app');

if (element) {
  const editor = new Baybayin(element, {
    value: "console.log('Hello World');",
    languages: ['javascript'],
    themes: ['github-dark'],
  });
}
\`;

Baybayin.setCDN('https://unpkg.com/shiki/');

if (element) {
  const editor = new Baybayin(element, {
    value: CODE,
    languages: ['javascript'],
    themes: ['github-dark'],
  });

  editor.load().then(() => {
    console.log('Editor ready');
  });
}
`;

Baybayin.setCDN('https://unpkg.com/shiki/');

if (element) {
  const opts = {
    lineNumbers: false,
    readonly: false,
    theme: 'dark-plus',
    language: 'javascript',
  };
  const editor = new Baybayin(element, {
    value: CODE,
    languages: ['javascript'],
    themes: ['dark-plus'],
  });

  editor.load().then(() => {
    console.log('Editor ready');
  });
 
  const gui = new dat.GUI({
    name: 'Baybayin Settings',
  });

  gui.add(opts, 'language', LANGUAGES).onChange((value) => {
    editor.setLanguage(value);
  });
  gui.add(opts, 'theme', THEMES).onChange((value) => {
    editor.setTheme(value);
  });
  gui.add(opts, 'lineNumbers', false).onChange((value) => {
    editor.toggleLineNumbers(value);
  });
  gui.add(opts, 'readonly', false).onChange((value) => {
    editor.toggleReadonly(value);
  });
}