# react-baybayin

> Simple in-browser code editor, inspired by CodeFlask

[![NPM](https://img.shields.io/npm/v/react-baybayin.svg)](https://www.npmjs.com/package/react-baybayin) [![JavaScript Style Guide](https://badgen.net/badge/code%20style/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://codesandbox.io/s/github/lxsmnsyc/react-baybayin/tree/main/examples/react-demo)

## Install

```bash
npm install --save react-baybayin
```

```bash
yarn add react-baybayin
```

## Usage

```js
import { useEditor, setCDN } from 'react-baybayin';

setCDN('https://unpkg.com/shiki/');

function App() {
  const [targetRef, loading] = useEditor<HTMLDivElement>({
    // The value of the editor. This can be controlled.
    value: "console.log('Hello World')",
    // The languages loaded for the editor to use.
    // The first language in the array is the selected
    // language by default.
    languages: ['javascript'],
    // The themes loaded for the editor to use.
    // The first theme in the array is the selected
    // language by default.
    themes: ['github-dark'],
    // Show/hide line numbers
    lineNumbers: true,
    // Set the editor to readonly
    readonly: true,
    // Listen to the changes
    onChange(newValue) {
      console.log('Received:', newValue);
    },
    // Listen to errors
    onError(error) {
      console.log('Caught:', error);
    },
  });

  return (
    <div ref={targetRef} />
  )
}

export default App;
```

## License

MIT © [lxsmnsyc](https://github.com/lxsmnsyc)
