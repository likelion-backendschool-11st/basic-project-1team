import React, { useEffect, useRef } from 'react';
import FroalaEditor, { type FroalaOptions } from 'froala-editor';
import 'froala-editor/css/froala_editor.min.css';
import 'froala-editor/css/plugins/char_counter.min.css';
import 'froala-editor/css/plugins/code_snippet.min.css';
import 'froala-editor/css/plugins/image.min.css';
import 'froala-editor/css/plugins/table.min.css';
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/themes/dark.min.css';
import 'froala-editor/js/languages/ko.js';
import 'froala-editor/js/plugins/char_counter.min.js';
import 'froala-editor/js/plugins/code_snippet.min.js';
import 'froala-editor/js/plugins/image.min.js';
import 'froala-editor/js/plugins/link.min.js';
import 'froala-editor/js/plugins/lists.min.js';
import 'froala-editor/js/plugins/paragraph_format.min.js';
import 'froala-editor/js/plugins/quote.min.js';
import 'froala-editor/js/plugins/table.min.js';
import { getAccessToken } from '../auth';
import { BIO_TEXT_MAX, BODY_TEXT_MAX, richTextMessages } from './richText';
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
  /** 이미지 업로드 버튼. full 에서만 쓸 수 있고, 첨부를 받지 않는 글(게시글)은 끈다 */
  readonly allowImages?: boolean;
}

const TOOLBARS: Record<RichTextPreset, string[]> = {
  full: [
    'bold',
    'italic',
    'underline',
    'strikeThrough',
    '|',
    'paragraphFormat',
    'formatUL',
    'formatOL',
    'quote',
    'codeSnippet',
    '|',
    'insertLink',
    'insertImage',
    'insertTable',
    '|',
    'undo',
    'redo',
  ],
  simple: ['bold', 'italic', 'underline', '|', 'insertLink', '|', 'undo', 'redo'],
};

const DEFAULT_MAX: Record<RichTextPreset, number> = { full: BODY_TEXT_MAX, simple: BIO_TEXT_MAX };

/** 본문 이미지 업로드: 첨부파일 API (API_SPEC 6장, purpose=post_content, 최대 20MB) */
const IMAGE_UPLOAD: Partial<FroalaOptions> = {
  imageUploadURL: '/api/attachments',
  imageUploadParam: 'file',
  imageUploadParams: { purpose: 'post_content' },
  imageUploadMethod: 'POST',
  imageAllowedTypes: ['jpeg', 'jpg', 'png', 'gif'],
  imageMaxSize: 20 * 1024 * 1024,
  // 주소로 넣기는 막고 업로드만 허용한다. 업로드 주소가 있으면 붙여넣은 이미지도 base64 대신 업로드된다
  imageInsertButtons: ['imageBack', '|', 'imageUpload'],
};

/**
 * Froala WYSIWYG 에디터. 값은 HTML 문자열이다. (API_SPEC 1.9)
 * 라이선스 키는 `VITE_FROALA_KEY` 환경 변수로 넣는다.
 *
 * react-froala-wysiwyg 래퍼는 에디터가 생성자 안에서 바로 초기화되면 내용 변경 리스너를 놓치는
 * 문제가 있어, froala-editor 를 직접 만들고 값 동기화도 여기서 한다.
 */
export const FroalaRichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  preset = 'full',
  placeholder,
  minHeight = preset === 'full' ? 280 : 120,
  maxLength = DEFAULT_MAX[preset],
  showCounter = true,
  allowImages = preset === 'full',
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<FroalaEditor | null>(null);
  /** 에디터가 마지막으로 알린 값. 같은 값이 props 로 돌아오면 다시 넣지 않는다(커서 유지) */
  const emittedRef = useRef(value);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  valueRef.current = value;
  onChangeRef.current = onChange;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    // 초기화가 끝나기 전에 destroy 되면(StrictMode 이중 마운트) 툴바가 남으므로, 마운트마다 새 요소에 만든다
    const toolbar = allowImages
      ? TOOLBARS[preset]
      : TOOLBARS[preset].filter((button) => button !== 'insertImage');
    const target = document.createElement('div');
    host.appendChild(target);
    let ready = false;
    const emit = (editor: FroalaEditor) => {
      if (!ready) return;
      const html = editor.html.get();
      if (html === emittedRef.current) return;
      emittedRef.current = html;
      onChangeRef.current(html);
    };

    // 공식 타입(index.d.ts)에 배열형 toolbarButtonsMD/SM/XS 와 일부 이벤트 반환형이 빠져 있어 옵션을 한 번만 변환한다
    const options = {
      key: import.meta.env.VITE_FROALA_KEY,
      language: 'ko',
      theme: 'dark',
      placeholderText: placeholder,
      heightMin: minHeight,
      toolbarButtons: toolbar,
      toolbarButtonsMD: toolbar,
      toolbarButtonsSM: toolbar,
      toolbarButtonsXS: toolbar,
      toolbarSticky: false,
      quickInsertEnabled: false,
      charCounterCount: showCounter,
      charCounterMax: maxLength,
      paragraphFormat: { N: '본문', H2: '제목 1', H3: '제목 2' },
      linkAlwaysBlank: true,
      linkAutoPrefix: 'https://',
      // 저장 전 서버가 다시 정리하지만(API_SPEC 1.9), 에디터에서도 위험한 태그는 받지 않는다
      htmlRemoveTags: ['script', 'style'],
      pasteDeniedTags: ['script', 'style', 'iframe', 'object', 'embed'],
      // 이미지를 받지 않으면 붙여넣은 이미지도 막는다 (base64 로 들어가지 않게)
      ...(allowImages ? IMAGE_UPLOAD : { imageUpload: false, imagePaste: false }),
      events: {
        initialized: function (this: FroalaEditor) {
          this.html.set(valueRef.current);
          emittedRef.current = this.html.get();
          ready = true;
        },
        contentChanged: function (this: FroalaEditor) {
          emit(this);
        },
        keyup: function (this: FroalaEditor) {
          emit(this);
        },
        'image.beforeUpload': function (this: FroalaEditor) {
          const token = getAccessToken();
          this.opts.requestHeaders = token ? { Authorization: `Bearer ${token}` } : {};
          return true;
        },
        // 응답 형식이 { success, data: Attachment } 라 URL 을 꺼내 직접 넣는다
        'image.uploaded': function (this: FroalaEditor, response: string) {
          const url: unknown = JSON.parse(response)?.data?.url;
          if (typeof url === 'string') this.image.insert(url, false, {}, this.image.get());
          return false;
        },
        // 업로드에 실패하면 미리보기로 들어간 이미지를 지운다 (base64·blob 주소가 남지 않게)
        'image.error': function (this: FroalaEditor) {
          const image = this.image.get();
          if (image) this.image.remove(image);
          emit(this);
          window.alert(richTextMessages.imageUploadFailed);
        },
      },
    } as unknown as Partial<FroalaOptions>;
    const editor = new FroalaEditor(target, options);
    editorRef.current = editor;

    return () => {
      ready = false;
      editorRef.current = null;
      editor.destroy();
      target.remove();
    };
    // 설정이 바뀔 때만 다시 만든다. 값은 아래 effect 가 맞춘다
  }, [preset, placeholder, minHeight, maxLength, showCounter, allowImages]);

  // 템플릿 추가·초기화처럼 바깥에서 값이 바뀌면 에디터에 넣는다
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor?.html || value === emittedRef.current) return;
    editor.html.set(value);
    emittedRef.current = editor.html.get();
  }, [value]);

  return (
    <div className="rich-text-editor">
      <div ref={hostRef} />
    </div>
  );
};
