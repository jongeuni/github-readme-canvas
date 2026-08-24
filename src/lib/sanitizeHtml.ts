const DANGEROUS_TAGS = new Set(['script', 'iframe', 'object', 'embed', 'link', 'meta', 'style', 'base']);

/** Defense-in-depth for pasted HTML rendered via dangerouslySetInnerHTML — not
 *  a full adversarial-input sanitizer, just strips the obvious script/handler
 *  vectors. Reasonable for a single-user local editor previewing its own
 *  pasted content, same trust level the app already extends to user-supplied
 *  image URLs elsewhere. */
export function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.body.querySelectorAll('*').forEach((el) => {
    if (DANGEROUS_TAGS.has(el.tagName.toLowerCase())) {
      el.remove();
      return;
    }
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on') || ((name === 'href' || name === 'src') && /^\s*javascript:/i.test(attr.value))) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return doc.body.innerHTML;
}
