import { listItem } from "@tiptap/pm/schema-list";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Heading2, Highlighter, Italic, List, ListOrdered, Strikethrough } from "lucide-react";
import { Toggle } from "@/components/ui/toggle"

import { Heading1 } from "lucide-react";
import { Heading3 } from "lucide-react";
import { Heading4 } from "lucide-react";
import { Editor } from "@tiptap/react";
import "../app/globals.css";
import RedText from "@/extension/RedText";

export default function MenuBar({editor}:{editor:Editor | null}){
    if (!editor) {
        return null
      }
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

        },
        {
            icon: <Highlighter className="size-4"/>,
            onClick: () => editor.chain().focus().toggleRedText().run(),
            pressed : editor.isActive("redText"),
        }
        

    ]

      return (
        <div className="border rounded-md p-1 mb-1 bg--slate-50 space-x-2 z-50">
            {Options.map((option, index) => (
                <Toggle key={index} pressed={option.pressed} onPressedChange={option.onClick}>
                {option.icon}
               </Toggle>
            ))}
        </div>
      )
      
}

