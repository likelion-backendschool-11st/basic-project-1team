import React, { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table';
import { CharacterCount, Placeholder } from '@tiptap/extensions';
import { apiRequest } from '../api';
import { Icon } from '../layout/Icon';
import { Spoiler, VideoEmbed, toVideoEmbedUrl } from './extensions';
import { BIO_TEXT_MAX, BODY_TEXT_MAX, richTextMessages } from './richText';
import './view.css';
import './editor.css';

/** full: 질문·답변·게시글 본문, simple: 소개글처럼 짧은 글 */
export type RichTextPreset = 'full' | 'simple';

export interface RichTextEditorProps {
  readonly value: string;
  readonly onChange: (html: string) => void;
  readonly preset?: RichTextPreset;
  readonly placeholder?: string;
  /** 에디터 높이 최솟값(px) */
  readonly minHeight?: number;
  /** 순수 글자 수 상한. 생략하면 preset 기본값 (본문 10,000 / 소개글 200) */
  readonly maxLength?: number;
  /** 에디터 아래 글자 수 표시. 화면에서 따로 보여 주면 끈다 */
  readonly showCounter?: boolean;
  /** 이미지 업로드 버튼. 기본은 full 에서 켜짐 */
  readonly allowImages?: boolean;
  /** 스포일러 가리기 버튼. 자유게시판 글쓰기에서만 켠다 (REQ-BOARD-019) */
  readonly allowSpoiler?: boolean;
}

const DEFAULT_MAX: Record<RichTextPreset, number> = { full: BODY_TEXT_MAX, simple: BIO_TEXT_MAX };

/** 본문 이미지: 첨부파일과 따로 관리하는 에디터 이미지 (API_SPEC 6장, purpose=editor_image, 최대 4MB) */
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const IMAGE_MAX_SIZE = 4 * 1024 * 1024;

async function uploadEditorImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('purpose', 'editor_image');
  form.append('file', file);
  const uploaded = await apiRequest<{ url: string }>('/attachments', {
    method: 'POST',
    body: form,
  });
  return uploaded.url;
}

/** 링크 주소에 프로토콜이 없으면 https:// 를 붙인다 */
const withProtocol = (href: string) =>
  /^(https?:|mailto:)/i.test(href) ? href : `https://${href.replace(/^\/+/, '')}`;

/**
 * 이미지·영상 뒤에 빈 문단을 붙여 커서를 그 문단으로 옮긴다.
 * 넣은 블록이 선택된 채로 남으면 이어서 넣는 표·글자가 그 블록을 덮어쓰기 때문이다
 */
const withParagraphAfter = (block: { type: string; attrs: Record<string, string> }) => [
  block,
  { type: 'paragraph' },
];

/** 에디터가 비어 있으면 '' 를 알린다 (빈 문단 `<p></p>` 대신) */
const readHtml = (editor: Editor) => (editor.isEmpty ? '' : editor.getHTML());

type PromptKind = 'link' | 'video';

const PROMPT_LABEL: Record<PromptKind, string> = {
  link: '링크 주소',
  video: 'YouTube·Vimeo 주소',
};

/**
 * TipTap WYSIWYG 에디터. 값은 HTML 문자열이다. (API_SPEC 1.9)
 * 이미지는 업로드 API 로 올린 주소만 넣고(base64 불가), 영상은 YouTube·Vimeo 주소를 플레이어로 바꿔 넣는다.
 */
export const TiptapRichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  preset = 'full',
  placeholder,
  minHeight = preset === 'full' ? 280 : 120,
  maxLength = DEFAULT_MAX[preset],
  showCounter = true,
  allowImages = preset === 'full',
  allowSpoiler = false,
}) => {
  const full = preset === 'full';
  /** 에디터가 마지막으로 알린 값. 같은 값이 props 로 돌아오면 다시 넣지 않는다(커서 유지) */
  const emittedRef = useRef(value);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  valueRef.current = value;
  onChangeRef.current = onChange;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState<{ kind: PromptKind; text: string; error?: string } | null>(
    null,
  );
  /** HTML 코드 보기. 켜져 있는 동안의 입력값 */
  const [codeHtml, setCodeHtml] = useState<string | null>(null);

  const emit = (html: string) => {
    if (html === emittedRef.current) return;
    emittedRef.current = html;
    onChangeRef.current(html);
  };

  const insertImages = async (editor: Editor, files: readonly File[]) => {
    for (const file of files) {
      if (!IMAGE_TYPES.includes(file.type) || file.size > IMAGE_MAX_SIZE) {
        window.alert(richTextMessages.imageUploadFailed);
        continue;
      }
      try {
        const src = await uploadEditorImage(file);
        editor
          .chain()
          .focus()
          .insertContent(withParagraphAfter({ type: 'image', attrs: { src } }))
          .run();
      } catch {
        window.alert(richTextMessages.imageUploadFailed);
      }
    }
  };

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: full ? { levels: [2, 3] } : false,
          bulletList: full ? {} : false,
          orderedList: full ? {} : false,
          listItem: full ? {} : false,
          listKeymap: full ? {} : false,
          blockquote: full ? {} : false,
          codeBlock: full ? {} : false,
          code: full ? {} : false,
          horizontalRule: full ? {} : false,
          strike: full ? {} : false,
          link: {
            openOnClick: false,
            autolink: true,
            defaultProtocol: 'https',
            HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer nofollow' },
          },
        }),
        ...(full ? [TableKit.configure({ table: { resizable: false } }), VideoEmbed] : []),
        ...(allowImages ? [Image.configure({ allowBase64: false })] : []),
        ...(allowSpoiler ? [Spoiler] : []),
        Placeholder.configure({ placeholder: placeholder ?? '' }),
        CharacterCount.configure({ limit: maxLength }),
      ],
      content: valueRef.current,
      editorProps: {
        attributes: { class: 'rich-text', style: `min-height: ${minHeight}px` },
        // 붙여넣거나 끌어 놓은 이미지 파일은 업로드해서 넣는다. 이미지를 받지 않으면 막는다
        handlePaste: (_view, event) => {
          const files = [...(event.clipboardData?.files ?? [])].filter((f) =>
            f.type.startsWith('image/'),
          );
          if (files.length === 0) return false;
          if (allowImages && editorRef.current) void insertImages(editorRef.current, files);
          return true;
        },
        handleDrop: (_view, event) => {
          const files = [...(event.dataTransfer?.files ?? [])].filter((f) =>
            f.type.startsWith('image/'),
          );
          if (files.length === 0) return false;
          event.preventDefault();
          if (allowImages && editorRef.current) void insertImages(editorRef.current, files);
          return true;
        },
      },
      onCreate: ({ editor: created }) => {
        emittedRef.current = readHtml(created);
      },
      onUpdate: ({ editor: updated }) => emit(readHtml(updated)),
    },
    // 설정이 바뀔 때만 다시 만든다. 값은 아래 effect 가 맞춘다
    [preset, placeholder, minHeight, maxLength, allowImages, allowSpoiler],
  );
  const editorRef = useRef<Editor | null>(null);
  editorRef.current = editor;

  // 템플릿 추가·초기화처럼 바깥에서 값이 바뀌면 에디터에 넣는다
  useEffect(() => {
    if (!editor || value === emittedRef.current) return;
    editor.commands.setContent(value, { emitUpdate: false });
    emittedRef.current = readHtml(editor);
    if (codeHtml !== null) setCodeHtml(value);
    // codeHtml 은 코드 보기 입력값이라 의존성에 넣지 않는다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value]);

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive('bold'),
            italic: e.isActive('italic'),
            underline: e.isActive('underline'),
            strike: e.isActive('strike'),
            spoiler: e.isActive('spoiler'),
            heading2: e.isActive('heading', { level: 2 }),
            heading3: e.isActive('heading', { level: 3 }),
            bulletList: e.isActive('bulletList'),
            orderedList: e.isActive('orderedList'),
            blockquote: e.isActive('blockquote'),
            codeBlock: e.isActive('codeBlock'),
            link: e.isActive('link'),
            table: e.isActive('table'),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
            count: e.storage.characterCount.characters() as number,
          }
        : null,
  });

  if (!editor || !state) return null;

  const codeView = codeHtml !== null;
  const run =
    (command: (chain: ReturnType<Editor['chain']>) => ReturnType<Editor['chain']>) => () =>
      command(editor.chain().focus()).run();

  const toggleCodeView = () => {
    if (codeView) {
      // 편집 화면으로 돌아오면 에디터가 정리한 HTML 로 다시 맞춘다
      editor.commands.setContent(codeHtml, { emitUpdate: false });
      setCodeHtml(null);
      emit(readHtml(editor));
    } else {
      setPrompt(null);
      setCodeHtml(readHtml(editor));
    }
  };

  const openPrompt = (kind: PromptKind) =>
    setPrompt({
      kind,
      text:
        kind === 'link' ? ((editor.getAttributes('link').href as string | undefined) ?? '') : '',
    });

  const submitPrompt = () => {
    if (!prompt) return;
    const text = prompt.text.trim();
    if (prompt.kind === 'link') {
      if (!text) {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
      } else if (editor.state.selection.empty && !editor.isActive('link')) {
        const href = withProtocol(text);
        editor
          .chain()
          .focus()
          .insertContent({ type: 'text', text, marks: [{ type: 'link', attrs: { href } }] })
          .run();
      } else {
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: withProtocol(text) })
          .run();
      }
      setPrompt(null);
      return;
    }
    const src = toVideoEmbedUrl(text);
    if (!src) {
      setPrompt({ ...prompt, error: richTextMessages.videoUrlInvalid });
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent(withParagraphAfter({ type: 'videoEmbed', attrs: { src } }))
      .run();
    setPrompt(null);
  };

  const paragraphFormat = state.heading2 ? 'h2' : state.heading3 ? 'h3' : 'p';

  return (
    <div className="rich-text-editor rounded-lg border border-hairline bg-surface-1">
      <div
        role="toolbar"
        aria-label="서식"
        className="flex flex-wrap items-center gap-0.5 px-1.5 py-1 border-b border-hairline bg-surface-2 rounded-t-lg"
      >
        <ToolButton
          label="굵게"
          icon="format_bold"
          active={state.bold}
          disabled={codeView}
          onClick={run((c) => c.toggleBold())}
        />
        <ToolButton
          label="기울임"
          icon="format_italic"
          active={state.italic}
          disabled={codeView}
          onClick={run((c) => c.toggleItalic())}
        />
        <ToolButton
          label="밑줄"
          icon="format_underlined"
          active={state.underline}
          disabled={codeView}
          onClick={run((c) => c.toggleUnderline())}
        />
        {full && (
          <ToolButton
            label="취소선"
            icon="strikethrough_s"
            active={state.strike}
            disabled={codeView}
            onClick={run((c) => c.toggleStrike())}
          />
        )}
        {allowSpoiler && (
          <ToolButton
            label="스포일러 가리기"
            text="스포"
            active={state.spoiler}
            disabled={codeView}
            onClick={run((c) => c.toggleMark('spoiler'))}
          />
        )}
        {full && (
          <>
            <Separator />
            <select
              aria-label="문단 형식"
              value={paragraphFormat}
              disabled={codeView}
              onChange={(e) => {
                const next = e.target.value;
                const chain = editor.chain().focus();
                if (next === 'p') chain.setParagraph().run();
                else chain.setHeading({ level: next === 'h2' ? 2 : 3 }).run();
              }}
              className="h-7 rounded bg-surface-1 border border-hairline px-1.5 font-caption text-caption text-ink-muted disabled:opacity-40"
            >
              <option value="p">본문</option>
              <option value="h2">제목 1</option>
              <option value="h3">제목 2</option>
            </select>
            <ToolButton
              label="글머리 기호 목록"
              icon="format_list_bulleted"
              active={state.bulletList}
              disabled={codeView}
              onClick={run((c) => c.toggleBulletList())}
            />
            <ToolButton
              label="번호 목록"
              icon="format_list_numbered"
              active={state.orderedList}
              disabled={codeView}
              onClick={run((c) => c.toggleOrderedList())}
            />
            <ToolButton
              label="인용"
              icon="format_quote"
              active={state.blockquote}
              disabled={codeView}
              onClick={run((c) => c.toggleBlockquote())}
            />
            <ToolButton
              label="코드 블록"
              icon="code_blocks"
              active={state.codeBlock}
              disabled={codeView}
              onClick={run((c) => c.toggleCodeBlock())}
            />
          </>
        )}
        <Separator />
        <ToolButton
          label="링크"
          icon="link"
          active={state.link || prompt?.kind === 'link'}
          disabled={codeView}
          onClick={() => openPrompt('link')}
        />
        {allowImages && (
          <ToolButton
            label="이미지 올리기"
            icon="image"
            disabled={codeView}
            onClick={() => fileInputRef.current?.click()}
          />
        )}
        {full && (
          <>
            <ToolButton
              label="영상 넣기"
              icon="smart_display"
              active={prompt?.kind === 'video'}
              disabled={codeView}
              onClick={() => openPrompt('video')}
            />
            <ToolButton
              label="표 넣기"
              icon="table"
              disabled={codeView}
              onClick={run((c) => c.insertTable({ rows: 3, cols: 3, withHeaderRow: true }))}
            />
            <Separator />
            <ToolButton
              label="HTML 코드 보기"
              icon="code"
              active={codeView}
              onClick={toggleCodeView}
            />
          </>
        )}
        <ToolButton
          label="실행 취소"
          icon="undo"
          disabled={codeView || !state.canUndo}
          onClick={run((c) => c.undo())}
        />
        <ToolButton
          label="다시 실행"
          icon="redo"
          disabled={codeView || !state.canRedo}
          onClick={run((c) => c.redo())}
        />
      </div>

      {state.table && !codeView && (
        <div
          role="toolbar"
          aria-label="표 편집"
          className="flex flex-wrap items-center gap-0.5 px-1.5 py-1 border-b border-hairline bg-surface-2"
        >
          <ToolButton label="아래에 행 추가" text="행 추가" onClick={run((c) => c.addRowAfter())} />
          <ToolButton
            label="오른쪽에 열 추가"
            text="열 추가"
            onClick={run((c) => c.addColumnAfter())}
          />
          <ToolButton label="행 삭제" text="행 삭제" onClick={run((c) => c.deleteRow())} />
          <ToolButton label="열 삭제" text="열 삭제" onClick={run((c) => c.deleteColumn())} />
          <ToolButton label="표 삭제" text="표 삭제" onClick={run((c) => c.deleteTable())} />
        </div>
      )}

      {prompt && (
        <form
          className="flex flex-wrap items-center gap-2 px-2 py-1.5 border-b border-hairline bg-surface-2"
          onSubmit={(e) => {
            e.preventDefault();
            submitPrompt();
          }}
        >
          <input
            autoFocus
            aria-label={PROMPT_LABEL[prompt.kind]}
            placeholder={PROMPT_LABEL[prompt.kind]}
            value={prompt.text}
            onChange={(e) => setPrompt({ kind: prompt.kind, text: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setPrompt(null);
            }}
            className="min-w-0 flex-1 h-7 rounded bg-surface-1 border border-hairline px-2 font-body-sm text-body-sm text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="h-7 px-2.5 rounded bg-primary-container font-label-md text-label-md text-ink"
          >
            확인
          </button>
          <button
            type="button"
            onClick={() => setPrompt(null)}
            className="h-7 px-2.5 rounded font-label-md text-label-md text-ink-subtle hover:text-ink"
          >
            취소
          </button>
          {prompt.error && (
            <p role="alert" className="w-full font-caption text-caption text-error">
              {prompt.error}
            </p>
          )}
        </form>
      )}

      {codeView ? (
        <textarea
          aria-label="HTML 코드"
          value={codeHtml}
          spellCheck={false}
          // 코드 보기 상태로 저장해도 고친 내용이 빠지지 않게 입력값을 바로 알린다
          onChange={(e) => {
            setCodeHtml(e.target.value);
            emit(e.target.value);
          }}
          style={{ minHeight }}
          className="block w-full resize-y bg-surface-1 px-3 py-2.5 font-code-inline text-[13px] text-ink-muted focus:outline-none"
        />
      ) : (
        <EditorContent editor={editor} className="px-3 py-2.5" />
      )}

      {showCounter && (
        <div className="flex justify-end px-3 py-1 border-t border-hairline font-code-inline text-[11px] text-ink-tertiary">
          {state.count.toLocaleString()} / {maxLength.toLocaleString()}
        </div>
      )}

      {allowImages && (
        <input
          ref={fileInputRef}
          type="file"
          accept={IMAGE_TYPES.join(',')}
          multiple
          hidden
          onChange={(e) => {
            const files = [...(e.target.files ?? [])];
            e.target.value = '';
            void insertImages(editor, files);
          }}
        />
      )}
    </div>
  );
};

interface ToolButtonProps {
  readonly label: string;
  readonly icon?: string;
  /** 아이콘 대신 보여 줄 짧은 글자 */
  readonly text?: string;
  readonly active?: boolean;
  readonly disabled?: boolean;
  readonly onClick: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({
  label,
  icon,
  text,
  active = false,
  disabled = false,
  onClick,
}) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    aria-pressed={active}
    disabled={disabled}
    // 버튼을 눌러도 에디터 선택 영역이 풀리지 않게 한다
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className={`inline-flex items-center justify-center h-7 min-w-7 px-1 rounded transition-colors disabled:opacity-40 disabled:pointer-events-none ${
      active ? 'bg-surface-3 text-primary' : 'text-ink-subtle hover:bg-surface-3 hover:text-ink'
    }`}
  >
    {icon ? (
      <Icon name={icon} className="text-[18px]" />
    ) : (
      <span className="font-label-md text-[12px] font-semibold">{text}</span>
    )}
  </button>
);

const Separator: React.FC = () => <span aria-hidden="true" className="mx-1 h-4 w-px bg-hairline" />;
