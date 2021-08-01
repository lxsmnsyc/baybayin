import React, { useMemo } from 'react'
import { useEditor, setCDN } from 'react-baybayin';
import './App.css'

const CODE = `
import React, { useMemo } from 'react'
import { useEditor, setCDN } from 'react-baybayin';
import './App.css'

setCDN('https://unpkg.com/shiki/');

function App() {
  const [targetRef, loading] = useEditor<HTMLDivElement>(
    useMemo(() => ({
      value: "console.log('Hello World')",
      languages: ['javascript'],
      themes: ['github-dark'],
      lineNumbers: true,
      onChange(newValue) {
        console.log('Received:', newValue);
      },
    }), [])
  );

  return (
    <div ref={targetRef} className="App" />
  )
}

export default App;
`;

setCDN('https://unpkg.com/shiki/');

function App() {
  const [targetRef, loading] = useEditor<HTMLDivElement>(
    useMemo(() => ({
      value: CODE,
      languages: ['javascript'],
      themes: ['github-dark'],
      lineNumbers: true,
      onChange(newValue) {
        console.log('Received:', newValue);
      },
    }), [])
  );

  return (
    <div ref={targetRef} className="App" />
  )
}

export default App;
