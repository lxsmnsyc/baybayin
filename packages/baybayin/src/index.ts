/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
import * as shiki from 'shiki';
import { STYLESHEET, CARETS } from './styles';

export interface EditorOptions {
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

export function setCDN(cdnURL: string): void {
  shiki.setCDN(cdnURL);
}

export class Editor {
  private ready = false;

  private highlighter?: shiki.Highlighter;

  private target: HTMLElement;

  private languages: shiki.Lang[];

  private themes: shiki.Theme[];

  private readonly: boolean;

  private tabSize: number;

  private lineNumbers: boolean;

  private handleTabs: boolean;

  private handleSelfClosing: boolean;

  private handleNewLine: boolean;

  private value: string;

  private selectedLanguage: shiki.Lang;

  private selectedTheme: shiki.Theme;

  private cleanups: (() => void)[] = [];

  constructor(target: HTMLElement, options: EditorOptions) {
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
      this.cleanups.push(() => {
        this.highlighter = undefined;
      });
    }
  }

  private setupEditor() {
    // Create editor wrapper
    if (!this.wrapper) {
      const wrapper = document.createElement('div');
      wrapper.classList.add('baybayin', ...STYLESHEET.split(' '));
      this.target.appendChild(wrapper);
      this.wrapper = wrapper;
      this.updateLineNumbers();
      this.cleanups.push(() => {
        this.wrapper = undefined;
        wrapper.parentNode?.removeChild(wrapper);
      });
    }
    // Create code
    if (!this.pre) {
      const pre = document.createElement('pre');
      pre.classList.add('baybayin__highlight');
      this.wrapper.appendChild(pre);
      this.pre = pre;
      this.cleanups.push(() => {
        this.pre = undefined;
        this.wrapper?.removeChild(pre);
      });
    }
    // Create textarea
    if (!this.textarea) {
      const textarea = document.createElement('textarea');
      textarea.classList.add('baybayin__textarea');
      textarea.setAttribute('spellcheck', 'false');
      textarea.setAttribute('autocomplete', 'off');

      const textareaWrapper = document.createElement('div');
      textareaWrapper.classList.add('baybayin__textarea--wrapper');
      const update = () => {
        textareaWrapper.dataset.replicatedValue = textarea.value;
      };
      textarea.addEventListener('input', update);
      textareaWrapper.appendChild(textarea);
      this.wrapper.appendChild(textareaWrapper);
      this.textarea = textarea;
      this.updateReadonly();

      this.cleanups.push(() => {
        textareaWrapper.removeChild(textarea);
        this.wrapper?.removeChild(textareaWrapper);
        textarea.removeEventListener('input', update);

        this.textarea = undefined;
      });
    }
    this.textarea.style.caretColor = CARETS[this.selectedTheme];
    // Highlight code
    if (this.highlighter) {
      this.pre.innerHTML = this.highlighter.codeToHtml(
        this.value,
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

  setReadonly(flag: boolean): void {
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

  setLineNumbers(flag: boolean): void {
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

  getValue(): string {
    return this.value;
  }

  private listenTextarea(): void {
    if (!this.textarea) {
      return;
    }

    const { textarea } = this;

    const onInput = () => {
      this.setValue(textarea.value);
    };
    textarea.addEventListener('input', onInput);

    const onKeyDown = (e: KeyboardEvent) => {
      if (this.readonly) {
        return;
      }
      this.tabHandler(textarea, e);
      this.selfClosingHandler(textarea, e);
      this.newLineHandler(textarea, e);
    };
    textarea.addEventListener('keydown', onKeyDown);

    this.cleanups.push(() => {
      textarea.removeEventListener('input', onInput);
      textarea.removeEventListener('keydown', onKeyDown);
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

    if (!Editor.skipCloseChar(textarea, char)) {
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
      const closeChar = (!skipChar && (char === '\'' || char === '"')) ? char : '';
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
    switch (char) {
      case ')':
      case '}':
      case ']':
      case '>':
        return true;
      default:
        return ((char === '\'' || char === '"') && !hasSelection);
    }
  }

  destroy(): void {
    this.cleanups.forEach((cleanup) => {
      cleanup();
    });
    this.cleanups = [];
    this.ready = false;
  }
}
