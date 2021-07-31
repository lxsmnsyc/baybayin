import * as shiki from 'shiki';

export interface BaybayinOptions {
  languages?: shiki.Lang[];
  themes?: shiki.Theme[];
  readonly?: boolean;
  showLineNumbers?: boolean;
}

export type ChangeListener = (value: string) => void;

export default class Baybayin {
  private highlighter?: shiki.Highlighter;

  private target: HTMLElement;

  private options?: BaybayinOptions;

  constructor(target: HTMLElement, options?: BaybayinOptions) {
    this.target = target;
    this.options = options;
  }

  private value = '';

  private wrapper?: HTMLDivElement;

  private textarea?: HTMLTextAreaElement;

  private pre?: HTMLPreElement;

  private code?: HTMLElement;

  private createEditor() {
    this.value = this.target.innerHTML;
    this.target.innerHTML = '';

    const wrapper = document.createElement('div');
    const textarea = document.createElement('textarea');
    const pre = document.createElement('pre');
    const code = document.createElement('code');

    pre.appendChild(code);
    wrapper.appendChild(textarea);
    wrapper.appendChild(pre);
  }

  createWrapper () {
    this.code = this.editorRoot.innerHTML
    this.editorRoot.innerHTML = ''
    this.elWrapper = this.createElement('div', this.editorRoot)
    this.elWrapper.classList.add('codeflask')
  }

  createTextarea () {
    this.elTextarea = this.createElement('textarea', this.elWrapper)
    this.elTextarea.classList.add('codeflask__textarea', 'codeflask__flatten')
  }

  createPre () {
    this.elPre = this.createElement('pre', this.elWrapper)
    this.elPre.classList.add('codeflask__pre', 'codeflask__flatten')
  }

  createCode () {
    this.elCode = this.createElement('code', this.elPre)
    this.elCode.classList.add('codeflask__code', `language-${this.opts.language || 'html'}`)
  }

  createLineNumbers () {
    this.elLineNumbers = this.createElement('div', this.elWrapper)
    this.elLineNumbers.classList.add('codeflask__lines')
    this.setLineNumber()
  }


  async load(): Promise<void> {
    this.highlighter = await shiki.getHighlighter({
      themes: this.options?.themes,
      langs: this.options?.languages,
    });
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
}
