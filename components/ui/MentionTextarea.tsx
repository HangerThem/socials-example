'use client'

import { forwardRef, useImperativeHandle, useCallback, useEffect, useState } from 'react'
import { cn } from '@/utils/cn'
import { AnimatePresence, motion } from 'framer-motion'
import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import { mergeAttributes } from '@tiptap/core'
import tippy, { Instance as TippyInstance } from 'tippy.js'
import 'tippy.js/dist/tippy.css'

export type MentionItem = {
  id: string
  label: string
}

export type TiptapHandle = {
  getHTML: () => string
  getText: () => string
  clearContent: () => void
  focus: () => void
}

type MentionListProps = {
  items: MentionItem[]
  command: (item: MentionItem) => void
}

type MentionListHandle = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

type MentionTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
  inputLike?: boolean
  className?: string
  placeholder?: string
  mentionItems?: MentionItem[]
  onUpdate?: (html: string, text: string) => void
  defaultContent?: string
  disabled?: boolean
}

// Separate component for mention suggestions list
const MentionList = forwardRef<MentionListHandle, MentionListProps>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = useCallback(
    (index: number) => {
      const item = items[index]
      if (item) command(item)
    },
    [items, command],
  )

  useImperativeHandle(
    ref,
    () => ({
      onKeyDown({ event }) {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((i) => (i + items.length - 1) % items.length)
          return true
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((i) => (i + 1) % items.length)
          return true
        }
        if (event.key === 'Enter') {
          selectItem(selectedIndex)
          return true
        }
        return false
      },
    }),
    [selectedIndex, selectItem, items.length],
  )

  useEffect(() => {
    const resetSelectedIndex = () => setSelectedIndex(0)
    resetSelectedIndex()
    return () => resetSelectedIndex()
  }, [])

  if (!items.length) return null

  return (
    <div className="min-w-40 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onClick={() => selectItem(index)}
          className={cn(
            'w-full px-3 py-1.5 text-left text-sm transition-colors',
            index === selectedIndex ? 'bg-primary text-white' : 'text-gray-800 hover:bg-gray-100',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
})

MentionList.displayName = 'MentionList'

export const MentionTextarea = forwardRef<TiptapHandle, MentionTextareaProps>(
  (
    {
      label,
      error,
      inputLike,
      className,
      placeholder = 'Napište zprávu…',
      mentionItems = [],
      onUpdate,
      defaultContent,
      disabled,
    },
    ref,
  ) => {
    const getMentionItems = useCallback(
      (query: string) => {
        const normalizedQuery = query.toLowerCase()
        return mentionItems.filter((item) => item.label.toLowerCase().startsWith(normalizedQuery))
      },
      [mentionItems],
    )

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: false,
          blockquote: false,
          codeBlock: false,
          horizontalRule: false,
          bulletList: false,
          orderedList: false,
        }),
        Placeholder.configure({
          placeholder,
        }),
        Mention.configure({
          HTMLAttributes: { class: 'mention' },
          renderHTML({ node, options }) {
            return [
              'span',
              mergeAttributes(options.HTMLAttributes, {
                'data-id': node.attrs.id,
                'data-type': 'mention',
              }),
              `@${node.attrs.label ?? node.attrs.id}`,
            ]
          },
          deleteTriggerWithBackspace: true,
          renderText({ node }) {
            return `@${node.attrs.label ?? node.attrs.id}`
          },
          suggestion: {
            items: ({ query }) => getMentionItems(query),
            render: () => {
              let component: ReactRenderer<MentionListHandle, MentionListProps>
              let popup: TippyInstance[]

              return {
                onStart: (props) => {
                  const { editor: suggestionEditor, clientRect } = props as {
                    editor: ReturnType<typeof useEditor>
                    clientRect: (() => DOMRect | null) | null
                  }

                  component = new ReactRenderer(MentionList, {
                    props,
                    editor: suggestionEditor,
                  })

                  popup = tippy('body', {
                    getReferenceClientRect: () => clientRect?.() ?? new DOMRect(),
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                  })
                },
                onUpdate: (props) => {
                  const { clientRect } = props as {
                    clientRect: (() => DOMRect | null) | null
                  }

                  component.updateProps(props)
                  popup?.[0]?.setProps({
                    getReferenceClientRect: () => clientRect?.() ?? new DOMRect(),
                  })
                },
                onKeyDown: (props) => {
                  const { event } = props as { event: KeyboardEvent }

                  if (event.key === 'Escape') {
                    popup?.[0]?.hide()
                    return true
                  }

                  return component.ref?.onKeyDown(props) ?? false
                },
                onExit: () => {
                  popup?.[0]?.destroy()
                  component.destroy()
                },
              }
            },
          },
        }),
      ],
      content: defaultContent,
      editable: !disabled,
      onUpdate: ({ editor: editorInstance }) => {
        onUpdate?.(editorInstance.getHTML(), editorInstance.getText())
      },
      editorProps: {
        attributes: {
          class: 'outline-none min-w-0',
        },
      },
    })

    useImperativeHandle(
      ref,
      () => ({
        getHTML: () => editor?.getHTML() ?? '',
        getText: () => editor?.getText() ?? '',
        clearContent: () => editor?.commands.clearContent(true),
        focus: () => editor?.commands.focus(),
      }),
      [editor],
    )

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wide text-dark">{label}</label>
        )}
        <div
          onClick={() => editor?.commands.focus()}
          className={cn(
            'my-1 max-h-48 min-h-24 w-full cursor-text overflow-y-auto rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-accent',
            !inputLike && 'min-h-32 max-h-50',
            inputLike && 'max-h-50',
            disabled && 'cursor-not-allowed bg-gray-100 opacity-50',
            className,
          )}
        >
          <EditorContent editor={editor} />
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              className="text-xs text-red-500"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  },
)

MentionTextarea.displayName = 'MentionTextarea'
