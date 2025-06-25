'use client'
import { useEditor, EditorContent, JSONContent } from '@tiptap/react'
import HardBreak from '@tiptap/extension-hard-break'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import MenuBar from './menu-bar'
import RedText from '../../extension/RedText'
import '../app/styles/editor.css'
import { useState, useCallback, useRef, useEffect } from 'react'
// Import your diff class - adjust the path as needed
import TiptapTreeDiff from './diff/TiptapTreeDiff' // or './diff' if that's your file name

const Tiptap = () => {
  const [initialContent, setInitialContent] = useState<JSONContent | null>(null)
  const [diffHTML, setDiffHTML] = useState<string>('')
  const [changesSummary, setChangesSummary] = useState<any>(null)
  //const [isStashed, setIsStashed] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState(false);
  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const previewWrapperRef = useRef<HTMLDivElement>(null);
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
      HardBreak,
      Placeholder.configure({
        placeholder: 'Write something...',
      }),
      RedText,
    ],
    content: `London's Newest Luxury Hotel Was Once The US Embassy. A Night In Its Penthouse Costs Rs 28 LakhA former US Embassy will soon welcome guests as London's newest luxury hotel, with its penthouses priced at Rs 28 lakh a night
Written by:
NDTV Lifestyle Desk
Luxury
Jun 09, 2025 18:00 pm IST
Published On
Jun 09, 2025 17:59 pm IST
Last Updated On
Jun 09, 2025 18:00 pm IST
Read Time:
3 mins
Share
TwitterWhatsAppFacebookRedditEmail
London's Newest Luxury Hotel Was Once The US Embassy. A Night In Its Penthouse Costs Rs 28 Lakh
The Chancery Rosewood in London was once the US Embassy. Photo: Rosewood Hotels
Quick Read
Summary is AI generated, newsroom reviewed.
London's newest luxury hotel is The Chancery Rosewood.
The building served as the US Embassy from 1960 until 2017 before the Embassy moved to Nine Elms.
Qatari Diar converted the building into the Chancery Rosewood, a luxury hotel opening this September.
When Finnish-American modernist architect Eero Saarinen won a design competition to create a new Chancery for London, little did he know that it would one day be turned into a lavish luxury hotel in the heart of the city.`,

    onUpdate({ editor }) {
      const current = editor.getJSON()
      if (initialContent) {
        generateJsonDiff(initialContent, current)
      }
    },

    onCreate({ editor }) {
      const json = editor.getJSON()
      setInitialContent(json)
      setDiffHTML(editor.view.dom.innerHTML);
      console.log('Initial content set:', json)
    },

    editorProps: {
      attributes: {
        class: 'min-h-[156px] border rounded-md bg-slate-50 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500',
      },
    },
  })

  const generateJsonDiff = useCallback((oldJson: JSONContent, newJson: JSONContent) => {
    try {
      console.log('DEBUGGING')
      console.log('Old JSON:', JSON.stringify(oldJson, null, 2))
      console.log('New JSON:', JSON.stringify(newJson, null, 2))
      
      // new instance of the diff class
      const differ = new TiptapTreeDiff()
      
      // generate the diff(debugging)
      const changes = differ.diff(oldJson, newJson)
      console.log('Changes detected:', changes)
      console.log('Number of changes:', changes.length)
      
      // Generate HTML with diff highlighting
      const generatedDiffHTML = differ.generateDiffHTML(oldJson, newJson)
      console.log('Generated diff HTML:', generatedDiffHTML)
      
      // get changes summary(debugging)
      const summary = differ.getChangesSummary()
      console.log('Changes summary:', summary)
      
      // Update state
      setDiffHTML(generatedDiffHTML)
      setChangesSummary(summary)
      
    } catch (error) {
      console.error('Error generating diff:', error)
      setDiffHTML('<p style="color: red;">Error generating diff</p>')
    }
  }, [])

  const handleAccept = useCallback(() => {
    if (editor) {
      // Extract the content from the diffHTML by removing the highlighting div
      //const tempDiv = document.createElement('div');
      //tempDiv.innerHTML = diffHTML;
      // Get the inner content while preserving HTML formatting
      //const cleanContent = tempDiv.querySelector('div')?.innerHTML || diffHTML;
      
      // Set the clean content in the editor
      //editor.commands.setContent(cleanContent);
      
      // Update the initial content to the new content
      const json = editor.getJSON();
      setInitialContent(json);
      
      // Update the preview to show the current editor content without highlighting
      setDiffHTML(editor.view.dom.innerHTML);
      
      // Keep the changes summary but update it to show no changes
      setChangesSummary({
        additions: 0,
        deletions: 0,
        modifications: 0,
        total: 0
      });
    }
  }, [editor, diffHTML]);

  const handleReject = useCallback(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
      
      // Update the preview to show the current editor content
      setDiffHTML(editor.view.dom.innerHTML);
      
      // Keep the changes summary but update it to show no changes
      setChangesSummary({
        additions: 0,
        deletions: 0,
        modifications: 0,
        total: 0
      });
    }
  }, [editor, initialContent]);

  const handleReset = useCallback(() => {
    if (editor) {
      const defaultContent = '<p>Hello World! 🌎️</p>'
      editor.commands.setContent(defaultContent)
      const json = editor.getJSON()
      setInitialContent(json)
      setDiffHTML('')
      setChangesSummary(null)
    }
  }, [editor])

  // Handle click outside editor to show preview
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        editorWrapperRef.current &&
        !editorWrapperRef.current.contains(event.target as Node) &&
        previewWrapperRef.current &&
        !previewWrapperRef.current.contains(event.target as Node)
      ) {
        setShowPreview(true);
      }
    }
    if (!showPreview) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPreview]);

  // Accept/Reject buttons (shared for both editor and preview)
  const changeButtons = (diffHTML && changesSummary && changesSummary.total > 0) && (
    <div className="flex gap-3 mt-[10px]">
      <button
        onClick={handleAccept}
        className="bg-white-500 hover:bg-gray-300 text-green px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
      >
        <span>✓</span> Accept Changes ({changesSummary.total})
      </button>
      <button
        onClick={handleReject}
        className="bg-white-500 hover:bg-gray-300 text-red px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
      >
        <span>✗</span> Reject Changes
      </button>
    </div>
  );

  if (!editor) {
    return <div className="p-4">Loading editor...</div>
  }

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <div
        className="editor-wrapper p-6 w-1/2 border-r bg-white"
        ref={editorWrapperRef}
        style={{ display: showPreview ? 'none' : 'block' }}
      >
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2">Text Editor</h2>
        </div>
        <MenuBar setDiffHTML={setDiffHTML} editor={editor} setChangesSummary={setChangesSummary} setShowPreview={setShowPreview} />
        <EditorContent editor={editor} />
        {changeButtons}
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={handleReset}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            Reset Editor
          </button>
        </div>
      </div>
      <div
        className="preview-wrapper p-6 pt-[30px] w-1/2"
        ref={previewWrapperRef}
        style={{ display: showPreview ? 'block' : 'none', cursor: 'pointer' }}
        onClick={() => setShowPreview(false)}
      >
        <div className="mb-4">
          <h3 className="text-2xl font-bold ">Preview with Changes</h3>
        </div>
        <div
          className="border rounded-lg p-4 mt-[80px] bg-white text-black min-h-[210px] mb-4 shadow-sm"
          style={{ fontFamily: 'inherit', lineHeight: '1.6' }}
          dangerouslySetInnerHTML={{
            __html: diffHTML || '<p class="text-gray-400 italic"></p>'
          }}
        />
        {changeButtons}
        {!diffHTML && (
          <div className="text-center text-gray-500 py-8">
            <p></p>
          </div>
        )}
        <div className="text-center text-gray-400 text-xs mt-4">Click anywhere in this area to edit</div>
      </div>
    </div>
  )
}

export default Tiptap