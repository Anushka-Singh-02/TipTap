'use client'
import TipTapTreeDiff from './diff'
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
import DiffMatchPatch from 'diff-match-patch' // ✅ Correct import
import TiptapTreeDiff from './diff'

const Tiptap = () => {
  const [initialContent, setInitialContent] = useState<JSONContent | null>(null)
  const [showPreview, setShowPreview] = useState(false)
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
      const current = editor.getJSON()
      if (initialContent) {
        generateJsonDiff(initialContent, current)
      }
    },

    onCreate({ editor }) {
      const json = editor.getJSON()
      setInitialContent(json)
      // Generate initial diff to show preview
      generateJsonDiff(json, json)
    },

    editorProps: {
      attributes: {
        class: 'min-h-[156px] border rounded-md bg-slate-50 py-2 px-3',
      },
    },
  })

  const generateJsonDiff = (oldJson: JSONContent, newJson: JSONContent) => {
    const oldText = extractTextFromJson(oldJson)
    const newText = extractTextFromJson(newJson)
    console.log('old Json', JSON.stringify(oldJson));
    console.log('new Json', JSON.stringify(newJson));
    const differ = new TiptapTreeDiff();
    const changes = differ.diff(oldJson, newJson);
    const diffHTML = differ.generateDiffHTML(oldJson, newJson, { showUnchanged: true });

    setDiffHTML(diffHTML)
  }

  const extractTextFromJson = (json: JSONContent): string => {
    let text = ''

    const walk = (node: any) => {
      if (node.type === 'text') {
        text += node.text || ''
      }

      if (node.content) {
        node.content.forEach((child: any) => walk(child))
      }
    }

    walk(json)
    return text
  }

  const getTextDiffs = (oldText: string, newText: string) => {
    const dmp = new DiffMatchPatch() // ✅ Correct instantiation
    const diffs = dmp.diff_main(oldText, newText)
    dmp.diff_cleanupSemantic(diffs)
    return diffs
  }

  const handleAccept = () => {
    if (editor) {
      const json = editor.getJSON()
      setInitialContent(json)
      // Generate diff with the same content to keep preview visible
      generateJsonDiff(json, json)
    }
  }

  const handleReject = () => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent)
      // Generate diff with the same content to keep preview visible
      generateJsonDiff(initialContent, initialContent)
    }
  }

  if (!editor) return null

  return (
    <div className='flex'>
    <div className="editor-wrapper p-4 mx-auto w-1/2">
      <div className="editor-toolbar flex gap-3 mb-4">
        
      
      </div>

      <MenuBar editor={editor} />
      <EditorContent editor={editor} />

      
    </div>
    <div className="mt-7.5 w-1/2">
          <h3 className="font-semibold mb-1 py-2 ">Preview Changes:</h3>
          <div
            className="border p-3 bg-white text-black whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: diffHTML }}
          />
          {diffHTML && (
            <div>
          <button
          onClick={handleAccept}
          className="bg-green-500 text-white text-xs px-1 py-0.8 cursor-pointer"
        >
          Accept
        </button>
        <button
          onClick={handleReject}
          className="bg-red-500 text-white text-xs px-1 py-0.8 cursor-pointer"
        >
          Reject
        </button>
            </div> )} 
        </div>
    </div>
  )
}

export default Tiptap
