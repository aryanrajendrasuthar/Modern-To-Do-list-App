import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import styles from './RichTextEditor.module.css';

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Add a description...',
  editable = true,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content,
    editable,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editable, editor]);

  if (!editor) return null;

  return (
    <div className={`${styles.wrapper} ${editable ? styles.editable : styles.readonly}`}>
      {editable && (
        <div className={styles.toolbar}>
          <button
            type="button"
            className={`${styles.toolBtn} ${editor.isActive('bold') ? styles.active : ''}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className={`${styles.toolBtn} ${editor.isActive('italic') ? styles.active : ''}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className={`${styles.toolBtn} ${editor.isActive('strike') ? styles.active : ''}`}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <s>S</s>
          </button>
          <div className={styles.divider} />
          <button
            type="button"
            className={`${styles.toolBtn} ${editor.isActive('bulletList') ? styles.active : ''}`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet list"
          >
            &#8226;&#8212;
          </button>
          <button
            type="button"
            className={`${styles.toolBtn} ${editor.isActive('orderedList') ? styles.active : ''}`}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered list"
          >
            1&#8212;
          </button>
          <div className={styles.divider} />
          <button
            type="button"
            className={`${styles.toolBtn} ${editor.isActive('blockquote') ? styles.active : ''}`}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Blockquote"
          >
            &ldquo;
          </button>
          <button
            type="button"
            className={`${styles.toolBtn} ${editor.isActive('code') ? styles.active : ''}`}
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Inline code"
          >
            {'<>'}
          </button>
        </div>
      )}
      <EditorContent editor={editor} className={styles.editor} />
    </div>
  );
}
