import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle, Color } from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import './RichTextEditor.css'

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="editor-menu">
      <div className="menu-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          title="Gras"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          title="Italique"
        >
          <em>I</em>
        </button>
      </div>

      <div className="menu-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
          title="Titre 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          title="Titre 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
          title="Titre 3"
        >
          H3
        </button>
      </div>

      <div className="menu-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          title="Liste à puces"
        >
          • Liste
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          title="Liste numérotée"
        >
          1. Liste
        </button>
      </div>

      <div className="menu-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
          title="Aligner à gauche"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
          title="Centrer"
        >
          ↔
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
          title="Aligner à droite"
        >
          →
        </button>
      </div>

      <div className="menu-group">
        <label className="color-picker-label" title="Couleur du texte">
          <span style={{ marginRight: '4px' }}>A</span>
          <input
            type="color"
            onInput={(e) => editor.chain().focus().setColor(e.target.value).run()}
            value={editor.getAttributes('textStyle').color || '#000000'}
          />
        </label>
      </div>
    </div>
  )
}

const RichTextEditor = ({ value, onChange, placeholder = 'Écrivez ici...' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
  })

  // Update editor content when value prop changes externally
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '')
    }
  }, [value, editor])

  return (
    <div className="rich-text-editor">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="editor-content" placeholder={placeholder} />
    </div>
  )
}

export default RichTextEditor
