import cx from "classnames";
import { useEffect, useRef, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import {
  $createParagraphNode,
  $getRoot,
  $isDecoratorNode,
  $isElementNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  type EditorState,
  type LexicalEditor,
} from "lexical";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import { $getNearestNodeOfType } from "@lexical/utils";
import { FiBold, FiItalic, FiList, FiRotateCcw, FiRotateCw, FiUnderline } from "react-icons/fi";
import { LuListOrdered } from "react-icons/lu";
import { isRichTextEmpty, richTextToHtml, sanitizeRichText } from "../../richText";

interface RichTextFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;

  /** Draw a red ring: a required field left empty on save. */
  invalid?: boolean;

  className?: string;
}

/** Parses the incoming value (legacy plain text or stored markup) into editor nodes, once. */
function buildInitialEditorState(value: string | undefined) {
  return (editor: LexicalEditor) => {
    const root = $getRoot();
    const html = richTextToHtml(value);
    const dom = new DOMParser().parseFromString(html, "text/html");
    const nodes = $generateNodesFromDOM(editor, dom);
    if (nodes.length === 0) {
      return;
    }
    /*
     * The root only accepts element and decorator nodes. Sanitised markup can
     * still yield a bare text run (a stray closing tag leaves its text behind),
     * and appending one throws, which unmounts the whole screen. Wrap anything
     * inline in a paragraph rather than trusting the shape of the input.
     */
    const blocks = nodes.map((node) =>
      $isElementNode(node) || $isDecoratorNode(node)
        ? node
        : $createParagraphNode().append(node)
    );
    root.clear();
    root.append(...blocks);
  };
}

export function RichTextField(props: RichTextFieldProps) {
  const { onChange, value } = props;

  const initialConfig = {
    namespace: "RichTextField",
    theme: {
      text: {
        bold: "font-semibold",
        italic: "italic",
        underline: "underline",
        strikethrough: "line-through",
      },
      paragraph: "mb-2 last:mb-0",
      list: {
        ul: "list-disc pl-5",
        ol: "list-decimal pl-5",
        listitem: "mb-1",
      },
    },
    nodes: [ListNode, ListItemNode],
    onError(error: Error) {
      throw error;
    },
    editorState: buildInitialEditorState(value),
  };

  return (
    <div className={cx("flex min-h-0 w-full flex-1 flex-col gap-1", props.className)}>
      {props.label && (
        <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">{props.label}</div>
      )}
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div
          className={cx(
            "min-h-0 flex-1 overflow-y-auto rounded-md border border-stone-400 bg-white px-3 py-2 text-sm leading-6 text-stone-900 focus-within:ring-2 focus-within:ring-brand-400 focus-within:ring-offset-1",
            props.invalid && "ring-2 ring-red-500"
          )}
        >
          <RichTextPlugin
            contentEditable={<ContentEditable className="h-full min-h-0 outline-none" />}
            placeholder={null}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <ValueSyncPlugin value={value} onChange={onChange} />
      </LexicalComposer>
    </div>
  );
}

/**
 * Keeps the editor in sync with `value` without fighting the caret.
 *
 * The initial content is loaded once, by `LexicalComposer`'s `initialConfig.editorState`.
 * Afterwards, this only reloads the editor when the incoming `value` differs from what this
 * component itself last emitted -- i.e. a genuinely external change (a different patient
 * loaded, a form reset) -- never on every keystroke's own round trip, which would reset the
 * caret mid-word.
 */
function ValueSyncPlugin(props: { value?: string; onChange?: (value: string) => void }) {
  const [editor] = useLexicalComposerContext();
  // Seeded with the value the editor was actually initialised with (by
  // `initialConfig.editorState`), so the first run of the effect below never mistakes the
  // initial load for an external change.
  const lastEmittedRef = useRef<string>(props.value ?? "");
  const isFirstRunRef = useRef(true);

  useEffect(() => {
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      return;
    }
    const incoming = props.value ?? "";
    if (incoming === lastEmittedRef.current) {
      return;
    }
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      const html = richTextToHtml(incoming);
      const dom = new DOMParser().parseFromString(html, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      if (nodes.length > 0) {
        root.append(...nodes);
      }
    });
    lastEmittedRef.current = incoming;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value, editor]);

  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const html = $generateHtmlFromNodes(editor);
      const sanitized = sanitizeRichText(html);
      const emitted = isRichTextEmpty(sanitized) ? "" : sanitized;
      lastEmittedRef.current = emitted;
      if (props.onChange) {
        props.onChange(emitted);
      }
    });
  };

  return <OnChangePlugin onChange={handleChange} ignoreSelectionChange />;
}

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isBulletList, setIsBulletList] = useState(false);
  const [isNumberedList, setIsNumberedList] = useState(false);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          setIsBold(false);
          setIsItalic(false);
          setIsUnderline(false);
          setIsBulletList(false);
          setIsNumberedList(false);
          return;
        }
        setIsBold(selection.hasFormat("bold"));
        setIsItalic(selection.hasFormat("italic"));
        setIsUnderline(selection.hasFormat("underline"));

        const listNode = $getNearestNodeOfType(selection.anchor.getNode(), ListNode);
        setIsBulletList($isListNode(listNode) && listNode.getListType() === "bullet");
        setIsNumberedList($isListNode(listNode) && listNode.getListType() === "number");
      });
    });
  }, [editor]);

  const buttonClass = (active: boolean) =>
    cx(
      "h-7 w-7 inline-flex items-center justify-center rounded-md text-stone-600 hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
      active && "bg-brand-50 text-brand-700"
    );

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        title="Negrita"
        aria-label="Negrita"
        className={buttonClass(isBold)}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
      >
        <FiBold />
      </button>
      <button
        type="button"
        title="Cursiva"
        aria-label="Cursiva"
        className={buttonClass(isItalic)}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
      >
        <FiItalic />
      </button>
      <button
        type="button"
        title="Subrayado"
        aria-label="Subrayado"
        className={buttonClass(isUnderline)}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
      >
        <FiUnderline />
      </button>
      <button
        type="button"
        title="Lista con viñetas"
        aria-label="Lista con viñetas"
        className={buttonClass(isBulletList)}
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
      >
        <FiList />
      </button>
      <button
        type="button"
        title="Lista numerada"
        aria-label="Lista numerada"
        className={buttonClass(isNumberedList)}
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
      >
        <LuListOrdered />
      </button>
      <button
        type="button"
        title="Deshacer"
        aria-label="Deshacer"
        className={buttonClass(false)}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      >
        <FiRotateCcw />
      </button>
      <button
        type="button"
        title="Rehacer"
        aria-label="Rehacer"
        className={buttonClass(false)}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      >
        <FiRotateCw />
      </button>
    </div>
  );
}
