import { css } from 'goober';

const FONT_FAMILY = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

const STYLESHEET: string = css({
  display: 'grid',
  width: '100%',
  height: '100%',

  '& *': {
    boxSizing: 'border-box',
  },

  '> .baybayin__highlight': {
    gridArea: '1 / 1 / 2 / 2',
    padding: 0,
    margin: 0,
    pointerEvents: 'none',
    whiteSpace: 'pre',
    outline: 'none',
    textAlign: 'left',
  },
  '> .baybayin__textarea--wrapper': {
    gridArea: '1 / 1 / 2 / 2',
    display: 'grid',
    marginTop: '1rem',
    marginLeft: '1rem',
    marginRight: '1rem',
    marginBottom: '1rem',
    '&::after': {
      /* Note the weird space! Needed to preventy jumpy behavior */
      content: 'attr(data-replicated-value) " "',
      /* This is how textarea text behaves */
      /* Hidden from view, clicks, and screen readers */
      visibility: 'hidden',
      fontSize: '1em',
      fontWeight: 'normal',
      fontFamily: FONT_FAMILY,
      lineHeight: 'normal',
      background: 'none',
      border: 'none',
      color: 'transparent',
      whiteSpace: 'pre',
      outline: 'none',
      textAlign: 'left',
      gridArea: '1 / 1 / 2 / 2',
    },
    '& > .baybayin__textarea': {
      padding: 0,
      overflow: 'hidden',
      resize: 'none',
      fontSize: '1em',
      fontWeight: 'normal',
      fontFamily: FONT_FAMILY,
      lineHeight: 'normal',
      background: 'none',
      border: 'none',
      color: 'transparent',
      whiteSpace: 'pre',
      outline: 'none',
      textAlign: 'left',
      gridArea: '1 / 1 / 2 / 2',
    },
  },
  '& .shiki': {
    margin: 0,
    display: 'inline-block',
    minWidth: '100%',
    minHeight: '100%',
    '& > code': {
      margin: '1rem',
      display: 'inline-block',
      height: 'auto',
      counterReset: 'step',
      counterIncrement: 'step 0',
    },
  },
  '&.baybayin__line-numbers': {
    '& > .baybayin__textarea--wrapper': {
      marginLeft: '3.5rem',
    },
    '& .shiki > code': {
      counterReset: 'step',
      counterIncrement: 'step 0',
      '&  .line::before': {
        content: 'counter(step)',
        counterIncrement: 'step',
        width: '1rem',
        marginRight: '1.5rem',
        display: 'inline-block',
        textAlign: 'right',
        color: 'rgba(115,138,148,.4)',
      },
    },
  },
  '& .shiki *': {
    fontSize: '1em',
    fontWeight: 'normal',
    fontFamily: FONT_FAMILY,
    lineHeight: 'normal',
  },
});

export default STYLESHEET;
