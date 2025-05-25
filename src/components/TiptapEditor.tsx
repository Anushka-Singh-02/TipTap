'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import '../app/styles/editor.css'
import Typography from '@tiptap/extension-typography'
import Placeholder from '@tiptap/extension-placeholder'
import MenuBar from './menu-bar'
import TextAlign from '@tiptap/extension-text-align'
import RedText from "../../extension/RedText";
import {diff_match_patch, Diff} from "diff-match-patch";
import { useState } from 'react'

const Tiptap = () => {

  const [initialContent, setInitialContent] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)
  const [diffHTML, setDiffHTML] = useState<string>('')

  const dmp = new diff_match_patch()

    const editor = useEditor({
      extensions: [StarterKit.configure({
        bulletList:{
          HTMLAttributes:{
            class: 'list-disc pl-3',
          },
        },
        orderedList:{
          HTMLAttributes:{
            class: 'list-decimal pl-3',
          },
        },
      }
      ),
      Highlight.configure({
        HTMLAttributes: {
          class: 'hover:bg-red-500',
          multicolor: true,
        },
      }),
        TextAlign.configure({
        types: ['heading', 'paragraph'],
      }), 
      Typography, Placeholder.configure({
        placeholder: 'Write something amazing...'
      }),
      RedText],
      content: '<p>Hello World! 🌎️</p>',

      onUpdate({ editor }) {
        const current = editor.getHTML()
        generateDiff(initialContent, current)
      },
      onCreate({ editor }) {
        const html = editor.getHTML()
        setInitialContent(html)
      },

      editorProps: {
        attributes: {
          class: "min-h-[156px] border rounded-md bg-slate-50 py-2 px-3",
        },
      },
    })

    
  const generateDiff = (oldText: string, newText: string) => {
    const diffs: Diff[] = dmp.diff_main(oldText, newText)
    dmp.diff_cleanupSemantic(diffs)

    const formatted = diffs
      .map(([op, data]) => {
        if (op === 1) {
          return `<span style="background-color: #d1fae5; color: black;">${data}</span>` // green
        } else if (op === -1) {
          return `<span style="background-color: #fee2e2; color: black; text-decoration: line-through;">${data}</span>` // red
        } else {
          return `<span style="color: black;">${data}</span>` // normal
        }
      })
      .join('')

    setDiffHTML(formatted)
  }

  const handleAccept = () => {
    if (editor) {
      const current = editor.getHTML()
      setInitialContent(current)
      setDiffHTML('')
    }
  }

  const handleReject = () => {
    if (editor) {
      editor.commands.setContent(initialContent)
      setDiffHTML('')
    }
  }
  
    if (!editor) {
      return null
    }
  
    return (
      <div className="editor-wrapper">
        <div className="editor-toolbar">
        <button
          onClick={() => setShowPreview(prev => !prev)}
          className="text-sm text-blue-600 underline"
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
        <button
          onClick={handleAccept}
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          Accept
        </button>
        <button
          onClick={handleReject}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Reject
        </button>
        { (
          <div className="mt-4">
            <h3 className="font-semibold mb-1">Preview Changes:</h3>
            <div
              className="border p-3 bg-white text-black"
              dangerouslySetInnerHTML={{ __html: diffHTML }}
            />
          </div>
        )}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
          >
            Bold
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
          >
            Italic
          </button>
          {/* Add more toolbar buttons as needed */}
        </div>
        <MenuBar editor={editor}/>
        < EditorContent editor={editor} />
      </div>
    )
  }
  

export default Tiptap

