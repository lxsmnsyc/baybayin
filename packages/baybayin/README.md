# Baybayin

> Simple in-browser code editor, inspired by CodeFlask

[![NPM](https://img.shields.io/npm/v/baybayin.svg)](https://www.npmjs.com/package/baybayin) [![JavaScript Style Guide](https://badgen.net/badge/code%20style/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://codesandbox.io/s/github/lxsmnsyc/baybayin/tree/main/examples/baybayin)

## Install

```bash
npm install --save baybayin
```

```bash
yarn add baybayin
```

## Usage

```js
import * as baybayin from 'baybayin';

// Setup the CDN, this CDN is important
// since Baybayin uses Shiki for highlighting
baybayin.setCDN('https://unpkg.com/shiki/');

const editor = new baybayin.Editor(document.getElementById('code'), {
  // The initial value of the editor
  value: "console.log('Hello World')",
  // The initial loaded themes for editor
  // The first one in the array is shown as default.
  themes: ['dark-plus'],
  // The initial loaded languages for editor
  // The first one in the array is used as default.
  languages: ['javascript', 'typescript'],
  // Display line numbers, defaults to false
  lineNumbers: false,
  // readonly editor
  readonly: false,
  // tab size, defaults to 2
  tabSize: 2,
});

// Load the editor
editor.load().then(() => {
  console.log('Editor is now ready');
});
```

### Updating config

```js
// Loads or push a language, returns a Promise
editor.loadLanguage('tsx');
// Loads or push a theme, returns a Promise
editor.loadTheme('monokai');
// Selects the language to use, returns a Promise
editor.setLanguage('typescript');
// Selects the theme to use, returns a Promise
editor.setTheme('github-dark');

// Toggle readonly
editor.setReadonly(true);
// Toggle line numbers
editor.setLineNumbers(true);

// Set editor value
editor.setValue('...');
```

### Reading editor value

```ts
const currentValue = editor.getValue();
```

### Subscribing for changes

```js
const unsubscribe = editor.onChange((newValue) => {
  console.log('Received', newValue);
});
```

### Destroying the editor

```js
editor.destroy();
```

## License

MIT © [lxsmnsyc](https://github.com/lxsmnsyc)
