'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import '../app/styles/editor.css'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import Placeholder from '@tiptap/extension-placeholder'




const Tiptap = () => {
    const editor = useEditor({
      extensions: [StarterKit, Highlight, Typography, Placeholder.configure({
        placeholder: 'Write something amazing...'
      })],
      content: '<p>Hello World! 🌎️</p>',
    })
  
    if (!editor) {
      return null
    }
  
    return (
      <div className="editor-wrapper">
        <div className="editor-toolbar">
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
        <EditorContent editor={editor} />
      </div>
    )
  }
  

export default Tiptap

