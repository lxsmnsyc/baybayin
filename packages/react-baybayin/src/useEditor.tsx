import { useFreshLazyRef, useReactiveRef } from '@lyonph/react-hooks';
import { Editor, EditorOptions, setCDN as setShikiCDN } from 'baybayin';
import {
  useEffect,
  useRef,
  MutableRefObject,
  useState,
} from 'react';

export function setCDN(cdnURL: string): void {
  setShikiCDN(cdnURL);
}

export interface UseEditorOptions extends EditorOptions {
  onChange?: (value: string) => void;
  onError?: (error: Error) => void;
}

export function useEditor<T extends HTMLElement>(
  options: UseEditorOptions,
): [MutableRefObject<T | null>, boolean] {
  const targetRef = useReactiveRef<T | null>(() => null);
  const [loading, setLoading] = useState(true);

  const value = useFreshLazyRef(() => options.value, options.value);
  const languages = useFreshLazyRef(() => options.languages, options.languages);
  const themes = useFreshLazyRef(() => options.themes, options.themes);
  const readonly = useFreshLazyRef(() => options.readonly, options.readonly);
  const lineNumbers = useFreshLazyRef(() => options.lineNumbers, options.lineNumbers);
  const onChange = useFreshLazyRef(() => options.onChange, options.onChange);
  const onError = useFreshLazyRef(() => options.onError, options.onError);

  const editorRef = useRef<Editor | undefined>();

  const target = targetRef.current;
  useEffect(() => {
    if (target) {
      let mounted = true;

      const instance = new Editor(target, {
        value: value.current,
        languages: languages.current,
        themes: themes.current,
        readonly: readonly.current,
        lineNumbers: lineNumbers.current,
      });

      editorRef.current = instance;

      instance.load().then(
        () => {
          if (mounted) {
            setLoading(false);
          }
        },
        (error: Error) => {
          if (mounted) {
            setLoading(false);
          }
          onError.current?.(error);
        },
      );

      instance.onChange((newValue) => {
        onChange.current?.(newValue);
      });

      return () => {
        instance.destroy();
        mounted = false;
      };
    }
    return undefined;
  }, [target, languages, themes, value, onError, onChange, readonly, lineNumbers]);

  const currentEditorInstance = editorRef.current;
  const currentValue = value.current;
  useEffect(() => {
    currentEditorInstance?.setValue(currentValue ?? '');
  }, [currentEditorInstance, currentValue]);

  const currentLineNumbers = lineNumbers.current;
  useEffect(() => {
    currentEditorInstance?.setLineNumbers(!!currentLineNumbers);
  }, [currentEditorInstance, currentLineNumbers]);

  const currentReadOnly = readonly.current;
  useEffect(() => {
    currentEditorInstance?.setReadonly(!!currentReadOnly);
  }, [currentEditorInstance, currentReadOnly]);

  // Manage languages and themes
  const currentLanguages = languages.current;
  useEffect(() => {
    if (currentEditorInstance) {
      currentLanguages.forEach((language, index) => {
        if (index === 0) {
          currentEditorInstance.setLanguage(language).catch((error: Error) => {
            onError.current?.(error);
          });
        } else {
          currentEditorInstance.loadLanguage(language).catch((error: Error) => {
            onError.current?.(error);
          });
        }
      });
    }
  }, [currentEditorInstance, currentLanguages, onError]);

  const currentThemes = themes.current;
  useEffect(() => {
    if (currentEditorInstance) {
      currentThemes.forEach((theme, index) => {
        if (index === 0) {
          currentEditorInstance.setTheme(theme).catch((error: Error) => {
            onError.current?.(error);
          });
        } else {
          currentEditorInstance.loadTheme(theme).catch((error: Error) => {
            onError.current?.(error);
          });
        }
      });
    }
  }, [currentEditorInstance, currentThemes, onError]);

  return [targetRef, loading];
}
