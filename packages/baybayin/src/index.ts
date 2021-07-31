/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
import * as shiki from 'shiki';
import { STYLESHEET, CARETS } from './styles';

export interface BaybayinOptions {
  value?: string;
  languages: shiki.Lang[];
  themes: shiki.Theme[];
  readonly?: boolean;
  tabSize?: number;
  handleTabs?: boolean;
  handleSelfClosing?: boolean;
  handleNewLine?: boolean;
  lineNumbers?: boolean;
}

export type ChangeListener = (value: string) => void;

export const THEMES = shiki.BUNDLED_THEMES;

export const LANGUAGES = shiki.BUNDLED_LANGUAGES.map((item) => item.id);

export default class Baybayin {
  private ready = false;

  private highlighter?: shiki.Highlighter;

  private target: HTMLElement;

  private languages: shiki.Lang[];

  private themes: shiki.Theme[];

  private readonly: boolean;

  private tabSize: number;

  private lineNumbers?: boolean;

  private handleTabs: boolean;

  private handleSelfClosing: boolean;

  private handleNewLine: boolean;

  private value: string;

  private selectedLanguage: shiki.Lang;

  private selectedTheme: shiki.Theme;

  constructor(target: HTMLElement, options: BaybayinOptions) {
    this.target = target;
    this.value = options.value ?? '';
    this.languages = [...options.languages];
    this.themes = [...options.themes];
    this.readonly = !!options.readonly;
    this.tabSize = options.tabSize ?? 2;
    this.handleTabs = options.handleTabs ?? true;
    this.handleSelfClosing = options.handleSelfClosing ?? true;
    this.handleNewLine = options.handleNewLine ?? true;
    this.lineNumbers = !!options.lineNumbers;
    this.selectedLanguage = options.languages[0];
    this.selectedTheme = options.themes[0];
  }

  private wrapper?: HTMLDivElement;

  private textarea?: HTMLTextAreaElement;

  private pre?: HTMLPreElement;

  private async setupHighlighter() {
    if (!this.highlighter) {
      this.highlighter = await shiki.getHighlighter({
        themes: this.themes,
        langs: this.languages,
      });
    }
  }

  private setupEditor() {
    // Create editor wrapper
    if (!this.wrapper) {
      this.wrapper = document.createElement('div');
      this.wrapper.classList.add('baybayin', ...STYLESHEET.split(' '));
      this.target.appendChild(this.wrapper);
      this.updateLineNumbers();
    }
    // Create code
    if (!this.pre) {
      this.pre = document.createElement('pre');
      this.pre.classList.add('baybayin__highlight', 'baybayin__flatten');
      this.wrapper.appendChild(this.pre);
    }
    // Create textarea
    if (!this.textarea) {
      this.textarea = document.createElement('textarea');
      this.textarea.classList.add('baybayin__textarea', 'baybayin__flatten');
      this.wrapper.appendChild(this.textarea);
      this.textarea.setAttribute('spellcheck', 'false');
      this.textarea.setAttribute('autocomplete', 'off');
      this.updateReadonly();
    }
    this.textarea.style.caretColor = CARETS[this.selectedTheme];
    // Highlight code
    if (this.highlighter) {
      this.pre.innerHTML = this.highlighter.codeToHtml(
        `${this.value}\n`,
        this.selectedLanguage,
        this.selectedTheme,
      );
    }
  }

  refresh(): void {
    if (this.ready) {
      this.setupEditor();
    }
  }

  async load(): Promise<void> {
    await this.setupHighlighter();
    this.setupEditor();
    this.listenTextarea();
    this.setValue(this.value);

    // Editor is now ready
    this.ready = true;
  }

  async loadLanguage(lang: shiki.Lang): Promise<void> {
    // If the editor hasn't loaded yet,
    // append the new language to the list
    if (this.highlighter) {
      await this.highlighter.loadLanguage(lang);
    } else {
      this.languages.push(lang);
    }
  }

  async loadTheme(theme: shiki.Theme): Promise<void> {
    // If the editor hasn't loaded yet,
    // append the new theme to the list
    if (this.highlighter) {
      await this.highlighter.loadTheme(theme);
    } else {
      this.themes.push(theme);
    }
  }

  async setLanguage(lang: shiki.Lang): Promise<void> {
    // Make sure that the language is loaded first
    await this.loadLanguage(lang);
    this.selectedLanguage = lang;

    // If the editor is ready, reload the editor
    this.refresh();
  }

  async setTheme(theme: shiki.Theme): Promise<void> {
    // Make sure that the theme is loaded first
    await this.loadTheme(theme);
    this.selectedTheme = theme;

    // If the editor is ready, reload the editor
    this.refresh();
  }

  private listeners?: Set<ChangeListener>;

  onChange(listener: (value: string) => void): () => void {
    if (!this.listeners) {
      this.listeners = new Set();
    }
    this.listeners.add(listener);
    return () => {
      this.listeners?.delete(listener);
    };
  }

  private notifyChange(value: string): void {
    if (this.listeners?.size) {
      new Set(this.listeners).forEach((listener) => {
        listener(value);
      });
    }
  }

  private updateReadonly() {
    if (this.textarea) {
      if (this.readonly) {
        this.textarea.setAttribute('readonly', 'true');
      } else {
        this.textarea.removeAttribute('readonly');
      }
    }
  }

  toggleReadonly(flag: boolean): void {
    this.readonly = flag;
    this.updateReadonly();
  }

  private updateLineNumbers(): void {
    if (this.wrapper) {
      if (this.lineNumbers) {
        this.wrapper.classList.add('baybayin__line-numbers');
      } else {
        this.wrapper.classList.remove('baybayin__line-numbers');
      }
    }
  }

  toggleLineNumbers(flag: boolean): void {
    this.lineNumbers = flag;
    this.updateLineNumbers();
  }

  setValue(value: string): void {
    // Check if the value has changed
    if (!Object.is(value, this.value) || !this.ready) {
      // Update the value
      this.value = value;
      // Reload the editor
      this.refresh();
      // Update the value of the textarea
      if (this.textarea) {
        this.textarea.value = value;
      }
      // Notify listeners for value change
      this.notifyChange(value);
    }
  }

  private listenTextarea(): void {
    if (!this.textarea) {
      return;
    }

    const { textarea } = this;

    textarea.addEventListener('input', () => {
      this.setValue(textarea.value);
    });

    textarea.addEventListener('keydown', (e) => {
      if (this.readonly) {
        return;
      }
      this.tabHandler(textarea, e);
      this.selfClosingHandler(textarea, e);
      this.newLineHandler(textarea, e);
    });

    textarea.addEventListener('scroll', () => {
      if (!this.pre) {
        return;
      }
      this.pre.style.transform = `translate3d(-${textarea.scrollLeft}px, -${textarea.scrollTop}px, 0)`;
    });
  }

  private tabHandler(
    textarea: HTMLTextAreaElement,
    e: KeyboardEvent,
  ) {
    if (!this.handleTabs || e.code !== 'Tab') {
      return;
    }
    e.preventDefault();

    const {
      selectionDirection,
      selectionStart,
      selectionEnd,
      value,
    } = textarea;

    let beforeSelection = value.substr(0, selectionStart);
    let selectionVal = value.substring(selectionStart, selectionEnd);
    const afterSelection = value.substring(selectionEnd);
    const indent = ' '.repeat(this.tabSize);

    if (selectionStart !== selectionEnd && selectionVal.length >= indent.length) {
      const splitSelection = beforeSelection.split('\n');
      const currentLineStart = selectionStart - splitSelection[splitSelection.length - 1].length;
      let startIndentLen = indent.length;
      let endIndentLen = indent.length;

      // Unindent
      if (e.shiftKey) {
        const currentLineStartStr = value.substr(currentLineStart, indent.length);
        // Line start whit indent
        if (currentLineStartStr === indent) {
          startIndentLen = -startIndentLen;

          if (currentLineStart > selectionStart) {
            // Indent is in selection
            const prefix = selectionVal.substring(0, currentLineStart);
            const suffix = selectionVal.substring(currentLineStart + indent.length);
            selectionVal = `${prefix}${suffix}`;
            endIndentLen = 0;
          } else if (currentLineStart === selectionStart) {
            // Indent is in start of selection
            startIndentLen = 0;
            endIndentLen = 0;
            selectionVal = selectionVal.substring(indent.length);
          } else {
            // Indent is before selection
            endIndentLen = -endIndentLen;
            const prefix = beforeSelection.substring(0, currentLineStart);
            const suffix = beforeSelection.substring(currentLineStart + indent.length);
            beforeSelection = `${prefix}${suffix}`;
          }
        } else {
          startIndentLen = 0;
          endIndentLen = 0;
        }

        selectionVal = selectionVal.replace(new RegExp(`\n${indent.split('').join('\\')}`, 'g'), '\n');
      } else {
        // Indent
        const prefix = beforeSelection.substr(0, currentLineStart);
        const suffix = beforeSelection.substring(currentLineStart, selectionStart);
        beforeSelection = `${prefix}${indent}${suffix}`;
        selectionVal = selectionVal.replace(/\n/g, `\n${indent}`);
      }

      // Set new indented value
      textarea.value = beforeSelection + selectionVal + afterSelection;

      textarea.selectionStart = selectionStart + startIndentLen;
      textarea.selectionEnd = selectionStart + selectionVal.length + endIndentLen;
      textarea.selectionDirection = selectionDirection;
    } else {
      textarea.value = beforeSelection + indent + afterSelection;
      textarea.selectionStart = selectionStart + indent.length;
      textarea.selectionEnd = selectionStart + indent.length;
    }

    const newCode = textarea.value;
    this.setValue(newCode);
    textarea.selectionEnd = selectionEnd + this.tabSize;
  }

  private selfClosingHandler(
    textarea: HTMLTextAreaElement,
    e: KeyboardEvent,
  ): void {
    if (!this.handleSelfClosing) return;
    const openChars = ['(', '[', '{', '<', '\'', '"'];
    const closeChars = [')', ']', '}', '>', '\'', '"'];
    const key = e.key;

    if (!openChars.includes(key) && !closeChars.includes(key)) {
      return;
    }
    this.closeCharacter(textarea, key);
  }

  private closeCharacter(
    textarea: HTMLTextAreaElement,
    char: string,
  ): void {
    const {
      selectionStart,
      selectionEnd,
    } = textarea;

    if (!Baybayin.skipCloseChar(textarea, char)) {
      let closeChar = char;
      switch (char) {
        case '(':
          closeChar = String.fromCharCode(char.charCodeAt(0) + 1);
          break;
        case '<':
        case '{':
        case '[':
          closeChar = String.fromCharCode(char.charCodeAt(0) + 2);
          break;
        default:
          break;
      }
      const selectionText = this.value.substring(selectionStart, selectionEnd);
      const newCode = `${this.value.substring(0, selectionStart)}${selectionText}${closeChar}${this.value.substring(selectionEnd)}`;
      this.setValue(newCode);
    } else {
      const skipChar = this.value.substr(selectionEnd, 1) === char;
      const newSelectionEnd = skipChar ? selectionEnd + 1 : selectionEnd;
      const closeChar = !skipChar && ['\'', '"'].includes(char) ? char : '';
      const newCode = `${this.value.substring(0, selectionStart)}${closeChar}${this.value.substring(newSelectionEnd)}`;
      this.setValue(newCode);
      textarea.selectionStart += 1;
      textarea.selectionEnd = textarea.selectionStart;
    }

    textarea.selectionEnd = selectionStart;
  }

  private newLineHandler(
    textarea: HTMLTextAreaElement,
    e: KeyboardEvent,
  ): void {
    if (!this.handleNewLine) return;
    if (e.key !== 'Enter') {
      return;
    }

    e.preventDefault();
    const {
      selectionStart,
      selectionEnd,
      value,
    } = textarea;

    const beforeSelection = value.substr(0, selectionStart);
    const afterSelection = value.substring(selectionEnd);

    const lineStart = value.lastIndexOf('\n', selectionStart - 1);
    const spaceLast = lineStart + value.slice(lineStart + 1).search(/[^ ]|$/);
    const indent = (spaceLast > lineStart) ? (spaceLast - lineStart) : 0;
    const newCode = `${beforeSelection}\n${' '.repeat(indent)}${afterSelection}`;

    textarea.value = newCode;
    textarea.selectionStart = selectionStart + indent + 1;
    textarea.selectionEnd = selectionStart + indent + 1;

    this.setValue(newCode);
  }

  private static skipCloseChar(textarea: HTMLTextAreaElement, char: string) {
    const {
      selectionStart,
      selectionEnd,
    } = textarea;
    const hasSelection = Math.abs(selectionEnd - selectionStart) > 0;
    return [')', '}', ']', '>'].includes(char) || (['\'', '"'].includes(char) && !hasSelection);
  }

  static setCDN(cdnURL: string): void {
    shiki.setCDN(cdnURL);
  }
}
