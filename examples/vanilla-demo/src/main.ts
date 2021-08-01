import * as baybayin from 'baybayin';
import * as dat from 'dat.gui';

const element = document.getElementById('app');

const CODE = `import * as baybayin from 'baybayin';

const element = document.getElementById('app');

const CODE = \`
import * as baybayin from 'baybayin';

const element = document.getElementById('app');

if (element) {
  const editor = new baybayin.Editor(element, {
    value: "console.log('Hello World');",
    languages: ['javascript'],
    themes: ['github-dark'],
  });
}
\`;

Baybayin.setCDN('https://unpkg.com/shiki/');

if (element) {
  const editor = new baybayin.Editor(element, {
    value: CODE,
    languages: ['javascript'],
    themes: ['github-dark'],
  });

  editor.load().then(() => {
    console.log('Editor ready');
  });
}
`;

baybayin.setCDN('https://unpkg.com/shiki/');

if (element) {
  const opts = {
    lineNumbers: false,
    readonly: false,
    theme: 'dark-plus',
    language: 'javascript',
  };
  const editor = new baybayin.Editor(element, {
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

  // element.appendChild(gui.domElement);

  // gui.domElement.style.position = 'sticky';
  // gui.domElement.style.top = '0px';
  // gui.domElement.style.right = '0px';
  // gui.domElement.style.zIndex = '50';

  gui.add(opts, 'language', baybayin.LANGUAGES).onChange((value) => {
    editor.setLanguage(value);
  });
  gui.add(opts, 'theme', baybayin.THEMES).onChange((value) => {
    editor.setTheme(value);
  });
  gui.add(opts, 'lineNumbers', false).onChange((value) => {
    editor.setLineNumbers(value);
  });
  gui.add(opts, 'readonly', false).onChange((value) => {
    editor.setReadonly(value);
  });
}