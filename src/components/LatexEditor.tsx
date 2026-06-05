import { useRef, useEffect } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine, drawSelection } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { syntaxHighlighting, defaultHighlightStyle, indentOnInput, bracketMatching } from '@codemirror/language'
import { latexSupport } from '../utils/latex-lang'
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
import { useStore } from '../store'

const PLACEHOLDER = '◆'

export default function LatexEditor() {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const { latexCode, setLatexCode, setCursorPosition, undo, redo } = useStore()

  useEffect(() => {
    if (!editorRef.current) return

    const tabKeymap = keymap.of([
      {
        key: 'Tab',
        run: (view) => {
          const pos = view.state.selection.main.head
          const doc = view.state.doc.toString()
          const nextPlaceholder = doc.indexOf(PLACEHOLDER, pos)
          if (nextPlaceholder >= 0) {
            const tr = view.state.update({
              changes: { from: nextPlaceholder, to: nextPlaceholder + PLACEHOLDER.length, insert: '' },
              selection: { anchor: nextPlaceholder },
            })
            view.dispatch(tr)
            return true
          }
          return false
        },
      },
      {
        key: 'Mod-z',
        run: () => { undo(); return true },
      },
      {
        key: 'Mod-Shift-z',
        run: () => { redo(); return true },
      },
    ])

    const state = EditorState.create({
      doc: latexCode,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        highlightActiveLine(),
        drawSelection(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        latexSupport(),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...completionKeymap,
          ...historyKeymap,
        ]),
        tabKeymap,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setLatexCode(update.state.doc.toString())
          }
          if (update.selectionSet) {
            setCursorPosition(update.state.selection.main.head)
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px',
          },
          '.cm-content': {
            fontFamily: '"JetBrains Mono", monospace',
            caretColor: 'var(--editor-cursor)',
          },
          '.cm-gutters': {
            backgroundColor: 'var(--editor-gutter)',
            color: 'var(--text-muted)',
            border: 'none',
          },
          '&.cm-focused .cm-cursor': {
            borderLeftColor: 'var(--editor-cursor)',
          },
          '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
            backgroundColor: 'var(--editor-selection) !important',
          },
          '.cm-activeLine': {
            backgroundColor: 'var(--editor-active-line)',
          },
          '.cm-line': {
            color: 'var(--editor-text)',
          },
        }),
      ],
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const currentDoc = view.state.doc.toString()
    if (currentDoc !== latexCode) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: latexCode },
      })
    }
  }, [latexCode])

  return (
    <div ref={editorRef} className="h-full w-full overflow-hidden rounded-none" />
  )
}
