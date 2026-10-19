import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import csharp from 'highlight.js/lib/languages/csharp';
import css from 'highlight.js/lib/languages/css';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import plaintext from 'highlight.js/lib/languages/plaintext';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('css', css);
hljs.registerLanguage('dockerfile', dockerfile);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('yaml', yaml);

const LANG: Record<string, string> = {
  csharp: 'csharp', 'c#': 'csharp', cs: 'csharp', typescript: 'typescript', ts: 'typescript', javascript: 'javascript', js: 'javascript',
  html: 'xml', xml: 'xml', sql: 'sql', json: 'json', bash: 'bash', shell: 'bash', sh: 'bash', yaml: 'yaml', yml: 'yaml',
  dockerfile: 'dockerfile', docker: 'dockerfile', css: 'css', text: 'plaintext',
};

export const escapeHtml = (s: unknown): string =>
  String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Content strings use `code` and **bold**; everything else is escaped. */
export const inlineHtml = (s: string | undefined): string =>
  escapeHtml(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');

export function highlight(code: string, lang?: string): string {
  const l = LANG[(lang ?? '').toLowerCase()] ?? 'plaintext';
  try { return hljs.highlight(code, { language: l, ignoreIllegals: true }).value; } catch { return escapeHtml(code); }
}

/** Minimal markdown for AI answers: fenced code, bullet/numbered lists, headings, paragraphs. */
export function markdownHtml(text: string): string {
  const out: string[] = [];
  String(text).split('```').forEach((part, i) => {
    if (i % 2) {
      const nl = part.indexOf('\n');
      const lang = nl > -1 ? part.slice(0, nl).trim() : '';
      const code = (nl > -1 ? part.slice(nl + 1) : part).replace(/\n$/, '');
      out.push(`<pre><code>${highlight(code, lang)}</code></pre>`);
      return;
    }
    let list: string[] | null = null;
    for (const raw of part.split('\n')) {
      const line = raw.trimEnd();
      const m = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
      if (m) { (list ??= []).push(`<li>${inlineHtml(m[1])}</li>`); continue; }
      if (list) { out.push(`<ul>${list.join('')}</ul>`); list = null; }
      const h = line.match(/^#{1,4}\s+(.*)$/);
      if (h) out.push(`<p><b>${inlineHtml(h[1])}</b></p>`);
      else if (line.trim()) out.push(`<p>${inlineHtml(line)}</p>`);
    }
    if (list) out.push(`<ul>${list.join('')}</ul>`);
  });
  return out.join('');
}
