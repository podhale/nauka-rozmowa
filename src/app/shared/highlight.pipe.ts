import { Pipe, PipeTransform } from '@angular/core';
import { normalize } from '../core/search.service';
import { escapeHtml } from './text';

/**
 * `text | highlight: query` → escaped HTML with <mark> around every query word,
 * matching without diacritics (a search for "wspolbieznosc" marks "współbieżność").
 */
@Pipe({ name: 'highlight' })
export class HighlightPipe implements PipeTransform {
  transform(text: string | undefined | null, query: string): string {
    const src = text ?? '';
    const words = normalize(query).split(/\s+/).filter(w => w.length > 1);
    if (!words.length) return escapeHtml(src);
    // normalize() keeps string length 1:1 for Latin text, so indexes map back to the original.
    const norm = normalize(src);
    const marks: boolean[] = new Array(src.length).fill(false);
    if (norm.length === src.length) {
      for (const w of words) {
        let i = norm.indexOf(w);
        while (i >= 0) { for (let k = i; k < i + w.length; k++) marks[k] = true; i = norm.indexOf(w, i + w.length); }
      }
    }
    let out = '', open = false;
    for (let i = 0; i < src.length; i++) {
      if (marks[i] && !open) { out += '<mark>'; open = true; }
      if (!marks[i] && open) { out += '</mark>'; open = false; }
      out += escapeHtml(src[i]);
    }
    return open ? out + '</mark>' : out;
  }
}
