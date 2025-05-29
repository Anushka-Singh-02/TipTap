'use client'
import { createHTMLDiff, diffStyles } from './diff'
import { useEditor, EditorContent, JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import MenuBar from './menu-bar'
import RedText from '../../extension/RedText'
import '../app/styles/editor.css'
import { useState } from 'react'



const Tiptap = () => {
  const [initialContent, setInitialContent] = useState<String | null>(null)
  const [diffHTML, setDiffHTML] = useState<string>('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { HTMLAttributes: { class: 'list-disc pl-3' } },
        orderedList: { HTMLAttributes: { class: 'list-decimal pl-3' } },
      }),
      Highlight.configure({
        HTMLAttributes: { class: 'hover:bg-red-500', multicolor: true },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Typography,
      Placeholder.configure({
        placeholder: 'Write something amazing...',
      }),
      RedText,
    ],
    content: '<p>Hello World! 🌎️</p>',

    onUpdate({ editor }) {
      const current = editor.getHTML()
      if (initialContent) {
        generateHTMLDiff(initialContent, current)
      }
    },

    onCreate({ editor }) {
      const current = editor.getHTML()
      setInitialContent(current)
      // Generate initial diff to show preview
      generateHTMLDiff(current, current)
    },

    editorProps: {
      attributes: {
        class: 'min-h-[156px] border rounded-md bg-slate-50 py-2 px-3',
      },
    },
  })

  const generateHTMLDiff = (oldHTML:any, newHTML:any) => {
    // Get HTML content from editor

    // Generate diff HTML
    const diffedHTML = createHTMLDiff(oldHTML, newHTML)
    setDiffHTML(diffedHTML)
    console.log(diffedHTML);
  }

  const handleAccept = () => {
    if (editor) {
      const json = editor.getHTML()
      setInitialContent(json)
      // Generate diff with the same content to keep preview visible
      generateHTMLDiff(json,json)
    }
  }

  const handleReject = () => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent)
      // Generate diff with the same content to keep preview visible
      generateHTMLDiff(initialContent, initialContent)
    }
  }

  if (!editor) return null

  return (
    <div className='flex'>
      <div className="editor-wrapper p-4 mx-auto w-1/2">
        <div className="editor-toolbar flex gap-3 mb-4">
          <MenuBar editor={editor} />
        </div>
        <EditorContent editor={editor} />
      </div>
      <div className="mt-7.5 w-1/2">
        <h3 className="font-semibold mb-1 py-2">Preview Changes:</h3>
        <style>{diffStyles}</style>
        <div
          className="border p-3 bg-white text-black whitespace-pre-wrap diff-content"
          dangerouslySetInnerHTML={{ __html: diffHTML }}
        />
        {diffHTML && (
          <div className="mt-2 space-x-2">
            <button
              onClick={handleAccept}
              className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded cursor-pointer transition-colors"
            >
              Accept
            </button>
            <button
              onClick={handleReject}
              className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded cursor-pointer transition-colors"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Tiptap
