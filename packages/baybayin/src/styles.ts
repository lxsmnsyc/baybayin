import * as shiki from 'shiki';
import cxs from 'cxs';

const FONT_FAMILY = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export const CARETS: Record<shiki.Theme, 'white' | 'black'> = {
  'dark-plus': 'white',
  'github-dark': 'white',
  'github-light': 'black',
  'light-plus': 'black',
  'material-darker': 'white',
  'material-default': 'white',
  'material-lighter': 'black',
  'material-ocean': 'white',
  'material-palenight': 'white',
  'min-dark': 'white',
  'min-light': 'black',
  monokai: 'white',
  nord: 'white',
  poimandres: 'white',
  'slack-dark': 'white',
  'slack-ochin': 'black',
  'solarized-dark': 'white',
  'solarized-light': 'black',
};

export const STYLESHEET: string = cxs({
  position: 'absolute',
  width: '100%',
  height: '100%',
  overflow: 'visible',

  '& *': {
    boxSizing: 'border-box',
  },

  '> .baybayin__highlight': {
    padding: 0,
    margin: 0,
    pointerEvents: 'none',
    overflow: 'visible',
    width: '100%',
    height: '100%',
  },
  '> .baybayin__textarea': {
    paddingTop: '1rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingBottom: '1rem',
    fontSize: '1em',
    fontWeight: 'normal',
    fontFamily: FONT_FAMILY,
    lineHeight: 'normal',
    background: 'none',
    border: 'none',
    color: 'transparent',
    resize: 'none',
    width: '100%',
    height: '100%',
  },
  '> .baybayin__flatten': {
    whiteSpace: 'pre',
    position: 'absolute',
    top: '0',
    left: '0',
    outline: 'none',
    textAlign: 'left',
  },
  '& .shiki': {
    margin: 0,
    display: 'inline-block',
    minWidth: '100%',
    minHeight: '100%',
  },
  '& .shiki > code': {
    margin: '1rem',
    display: 'inline-block',
    width: '100%',
    height: 'auto',
    counterReset: 'step',
    counterIncrement: 'step 0',
  },
  '&.baybayin__line-numbers > .baybayin__textarea': {
    paddingLeft: '3.5rem',
  },
  '&.baybayin__line-numbers .shiki > code': {
    counterReset: 'step',
    counterIncrement: 'step 0',
  },
  '&.baybayin__line-numbers .shiki > code .line::before': {
    content: 'counter(step)',
    counterIncrement: 'step',
    width: '1rem',
    marginRight: '1.5rem',
    display: 'inline-block',
    textAlign: 'right',
    color: 'rgba(115,138,148,.4)',
  },
  '& .shiki *': {
    fontSize: '1em',
    fontWeight: 'normal',
    fontFamily: FONT_FAMILY,
    lineHeight: 'normal',
  },
});
