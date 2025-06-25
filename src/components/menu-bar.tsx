import { listItem } from "@tiptap/pm/schema-list";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Heading2, Highlighter, Italic, List, ListOrdered, Strikethrough, Wand2 } from "lucide-react";
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"

import { Heading1 } from "lucide-react";
import { Heading3 } from "lucide-react";
import { Heading4 } from "lucide-react";
import { Editor, JSONContent } from "@tiptap/react";
import "../app/globals.css";
import { useCallback } from "react";
import TiptapTreeDiff from "./diff/TiptapTreeDiff";
import { promptHelper } from "./data";

export default function MenuBar({editor, setDiffHTML, setChangesSummary, setShowPreview}:{editor:Editor | null, setDiffHTML: (html: string) => void, setChangesSummary: (summary: any) => void, setShowPreview: (show: boolean) => void}){
    if (!editor) {
        return null
    }

    const handleAIEdit = async () => {
        const content = editor.getHTML();
        const jsonContent = editor.getJSON();
        let userPrompt = window.prompt("How would you like to edit this content?");
        userPrompt+="\n\nPlease provide the modified content in json format, preserving all structure (headings, bold, italic, etc.).Just change the content of the json object. Do not include any other text or comments. don't use any other tags than the ones provided in the original content. do not use html with backticks in the modified content. If creating new nodes, use paragraph type. if prompt says to change the type of node, for instance change heading level 1 to heading level 2, then change the type of the node to heading level 2.";
        userPrompt+=promptHelper;
        if (!userPrompt) return;

        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: `Original content: ${JSON.stringify(jsonContent)}\n\nModification instruction: ${userPrompt}\n\nPlease provide the modified content in HTML format, preserving all formatting (headings, bold, italic, etc.).`
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get AI response');
            }

            const data = await response.json();
            if (data.error) {
                throw new Error("modified content error:"+data.error);
            }
            let modifiedContent = data.candidates[0].content.parts[0].text;
            
            
            // Remove backticks and html marker if present
            modifiedContent = modifiedContent
            .replace(/^```json\s*/, '')       // match ```json followed by any space/newline
            .replace(/\s*```[\s\n]*$/, '')    // match triple backticks possibly followed by whitespace or newline at the end
            .trim();
          
            console.log("modified Content",modifiedContent);
            modifiedContent = JSON.parse(modifiedContent);
            // Create a diff container with the modified content highlighted in green
            // Use a wrapper div to preserve formatting while adding the highlight
            //const diffHTML = `<div style="background-color: lightgreen; color: green; padding: 1px 3px; border-radius: 3px;">${modifiedContent}</div>`;
            //setDiffHTML(diffHTML);
            generateJsonDiff(jsonContent, modifiedContent);
            editor.commands.setContent(modifiedContent);
            // Set a changes summary to trigger the accept/reject buttons
            const changesSummary = {
                additions: 1,
                deletions: 0,
                modifications: 0,
                total: 1
            };
            //setChangesSummary(changesSummary);
            setShowPreview(true);
        } catch (error) {
            console.error('Error getting AI edit:', error);
            alert('Failed to get AI edit. Please try again.');
        }
    };
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

    const Options = [
        {
            icon: <Heading1 className="size-4"/>,
            onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            pressed : editor.isActive("heading", {level:1}),
        },
        {
            icon: <Heading2 className="size-4"/>,
            onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            pressed : editor.isActive("heading", {level:2}),
        },
        {
            icon: <Heading3 className="size-4"/>,
            onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            pressed : editor.isActive("heading", {level:3}),
        },
        {
            icon: <Heading4 className="size-4"/>,
            onClick: () => editor.chain().focus().toggleHeading({ level: 4 }).run(),
            pressed : editor.isActive("heading", {level:4}),
        },
        {
            icon: <Bold className="size-4"/>,
            onClick: () => editor.chain().focus().toggleBold().run(),
            pressed : editor.isActive("bold"),
        },
        {
            icon: <Italic className="size-4"/>,
            onClick: () => editor.chain().focus().toggleItalic().run(),
            pressed : editor.isActive("italic"),
        },
        {
            icon: <Strikethrough className="size-4"/>,
            onClick: () => editor.chain().focus().toggleStrike().run(),
            pressed : editor.isActive("strike"),
        },
        {
            icon: <AlignLeft className="size-4"/>,
            onClick: () => editor.chain().focus().setTextAlign('left').run(),
            pressed : editor.isActive({ textAlign: 'left' }),
        },
        {
            icon: <AlignCenter className="size-4"/>,
            onClick: () => editor.chain().focus().setTextAlign('center').run(),
            pressed : editor.isActive({ textAlign: 'center' }),
        },
        {
            icon: <AlignRight className="size-4"/>,
            onClick: () => editor.chain().focus().setTextAlign('right').run(),
            pressed : editor.isActive({ textAlign: 'right' }),
        },
        {
            icon: <AlignJustify className="size-4"/>,
            onClick: () => editor.chain().focus().setTextAlign('justify').run(),
            pressed : editor.isActive({ textAlign: 'justify' }),
        },
        {
            icon: <List className="size-4"/>,
            onClick: () => editor.chain().focus().toggleList( 'bulletList', 'listItem').run(),
            pressed : editor.isActive("bulletList"),
        },
        {
            icon: <ListOrdered className="size-4"/>,
            onClick: () => editor.chain().focus().toggleList( 'orderedList', 'listItem').run(),
            pressed : editor.isActive("orderedList"),
        },
        {
            icon: <Highlighter className="size-4"/>,
            onClick: () => editor.chain().focus().toggleHighlight().run(),
            pressed : editor.isActive("highlight"),
        }
    ]

    return (
        <div className="border rounded-md p-1 mb-1 bg--slate-50 space-x-2 z-50 flex items-center">
            {Options.map((option, index) => (
                <Toggle key={index} pressed={option.pressed} onPressedChange={option.onClick}>
                {option.icon}
               </Toggle>
            ))}
            <div className="ml-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAIEdit}
                    className="flex items-center gap-1"
                >
                    <Wand2 className="size-4" />
                    AI Edit
                </Button>
            </div>
        </div>
    )
}

