"use client";

import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
// import Image from "@tiptap/extension-image"; // <-- 1. REMOVE THIS LINE
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import { FontSize } from "./extensions/FontSize"; // Assuming this is a custom extension
import Underline from "@tiptap/extension-underline";
import ResizeImage from "tiptap-extension-resize-image"; // <-- This is your image handler
import FontFamily from "@tiptap/extension-font-family";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    AlignLeft,
    AlignCenter,
    AlignRight, // This is just the icon, not the Tiptap extension
} from "lucide-react";

interface Props {
    value: string;
    onChange: (_value: string) => void;
}

const fonts = [
    "Arial, sans-serif",
    "Georgia, serif",
    "'Courier New', monospace",
    "'Times New Roman', serif",
    "'Comic Sans MS', cursive, sans-serif",
];

const TiptapEditor: React.FC<Props> = ({ value, onChange }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            FontSize,
            FontFamily.configure({
                types: ["textStyle"],
            }),
            Underline,
            // Image.configure({ inline: false, allowBase64: true }), // <-- 2. REMOVE THIS LINE
            ResizeImage.configure({ // <-- 3. CONFIGURE ResizeImage DIRECTLY
                inline: false,        // Set to true if you want inline images
                allowBase64: true,    // To support base64 images from your HTML
            }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
        ],
        content: value, // ResizeImage will now handle parsing <img> tags from this HTML
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    });

    if (!editor) return <div>Loading editor...</div>;

    return (
        <div className="space-y-2 min">
            <div className="flex flex-wrap gap-2 border p-2 rounded-md bg-gray-100">
                {/* ... (Toolbar buttons remain the same) ... */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    title="Bold"
                >
                    <Bold className={buttonClass(editor.isActive("bold"))} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    title="Italic"
                >
                    <Italic className={buttonClass(editor.isActive("italic"))} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    title="Underline"
                >
                    <UnderlineIcon
                        className={buttonClass(editor.isActive("underline"))}
                    />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    title="Align Left"
                >
                    <AlignLeft
                        className={buttonClass(editor.isActive({ textAlign: "left" }))}
                    />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    title="Align Center"
                >
                    <AlignCenter
                        className={buttonClass(editor.isActive({ textAlign: "center" }))}
                    />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    title="Align Right"
                >
                    <AlignRight
                        className={buttonClass(editor.isActive({ textAlign: "right" }))}
                    />
                </button>

                <select
                    className="border rounded px-1 text-sm"
                    onChange={(e) =>
                        editor.chain().focus().setFontSize(e.target.value).run()
                    }
                    value={editor.getAttributes("textStyle")?.fontSize || "16px"} // Updated to get fontSize from textStyle
                >
                    {[12, 14, 16, 18, 24, 32, 48].map((size) => (
                        <option key={size} value={`${size}px`}>
                            {size}px
                        </option>
                    ))}
                </select>

                <select
                    className="border rounded px-1 text-sm"
                    onChange={(e) =>
                        editor.chain().focus().setFontFamily(e.target.value).run()
                    }
                    value={editor.getAttributes("textStyle")?.fontFamily || "Arial, sans-serif"} // Updated to get fontFamily from textStyle
                >
                    {fonts.map((font) => (
                        <option key={font} value={font}>
                            {font.split(",")[0].replace(/['"]+/g, "")}
                        </option>
                    ))}
                </select>
            </div>

            <div className="border rounded-md p-2 min-h-[100px]">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

export default TiptapEditor;

function buttonClass(active = false): string {
    return `w-6 h-6 stroke-[1.5] ${active ? "text-blue-500" : "text-gray-700"
        } hover:text-blue-600`;
}