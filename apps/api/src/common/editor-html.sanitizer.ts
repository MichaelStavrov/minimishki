import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'p',
  'br',
  'h2',
  'h3',
  'h4',
  'ul',
  'ol',
  'li',
  'strong',
  'em',
  'u',
  's',
  'blockquote',
  'a',
  'hr',
];

const EDITOR_HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  parseStyleAttributes: false,
  nestingLimit: 20,

  /**
   * target и rel из входного HTML не считаются доверенными.
   * Для внешних HTTP(S)-ссылок сервер самостоятельно добавляет безопасную
   * пару target="_blank" + rel="noopener noreferrer".
   */
  transformTags: {
    a: (tagName, attributes) => {
      const safeAttributes = { ...attributes };

      delete safeAttributes.target;
      delete safeAttributes.rel;

      const href = safeAttributes.href;
      const isExternalHttpLink = typeof href === 'string' && /^https?:\/\//i.test(href);

      if (isExternalHttpLink) {
        safeAttributes.target = '_blank';
        safeAttributes.rel = 'noopener noreferrer';
      }

      return {
        tagName,
        attribs: safeAttributes,
      };
    },
  },
};

const EDITOR_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
};

/**
 * Очищает HTML из визуального редактора перед записью в PostgreSQL.
 *
 * Функция всегда возвращает новую безопасную строку. Исходный HTML нельзя
 * сохранять параллельно или использовать в ответе API.
 */
export function sanitizeEditorHtml(html: string): string {
  return sanitizeHtml(html, EDITOR_HTML_OPTIONS).trim();
}

/** Проверяет, осталось ли после очистки видимое текстовое содержимое */
export function hasEditorHtmlText(html: string): boolean {
  return sanitizeHtml(html, EDITOR_TEXT_OPTIONS).trim() !== '';
}
