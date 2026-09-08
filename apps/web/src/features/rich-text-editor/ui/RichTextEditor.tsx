'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { Button } from '@/shared/ui';

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

/** Визуальный редактор с намеренно короткой панелью для повседневных новостей. */
export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          'min-h-56 px-4 py-4 text-base leading-7 text-ink outline-none [&_a]:font-bold [&_a]:text-teal-700 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-coral-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-teal-700 [&_h3]:mt-5 [&_h3]:text-xl [&_h3]:font-black [&_h3]:text-teal-700 [&_li]:ml-6 [&_li]:pl-1 [&_ol]:my-3 [&_ol]:list-decimal [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc',
      },
    },
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
  });

  function setLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Вставьте внутреннюю ссылку или полный адрес:', previousUrl ?? '');

    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  }

  return (
    <div className="overflow-hidden rounded-xl border-2 border-input bg-background focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-100">
      <div className="flex flex-wrap gap-2 border-b border-cream-200 bg-cream-50 p-3">
        <Tool label="Жирный" onClick={() => editor?.chain().focus().toggleBold().run()}>
          Ж
        </Tool>
        <Tool label="Курсив" onClick={() => editor?.chain().focus().toggleItalic().run()}>
          К
        </Tool>
        <Tool
          label="Заголовок"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </Tool>
        <Tool
          label="Маркированный список"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          • Список
        </Tool>
        <Tool
          label="Нумерованный список"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          1. Список
        </Tool>
        <Tool label="Цитата" onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
          Цитата
        </Tool>
        <Tool label="Ссылка" onClick={setLink}>
          Ссылка
        </Tool>
        <Tool label="Отменить" onClick={() => editor?.chain().focus().undo().run()}>
          ↶
        </Tool>
        <Tool label="Повторить" onClick={() => editor?.chain().focus().redo().run()}>
          ↷
        </Tool>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function Tool({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
