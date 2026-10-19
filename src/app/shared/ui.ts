import { ChangeDetectionStrategy, Component, Pipe, PipeTransform, computed, inject, input } from '@angular/core';
import { ContentService } from '../core/content.service';
import { Level } from '../core/models';
import { highlight, inlineHtml, markdownHtml } from './text';

/** `text | rich` → HTML with `code` and **bold** (input is escaped first). Bind with [innerHTML]. */
@Pipe({ name: 'rich' })
export class RichPipe implements PipeTransform {
  transform(v: string | undefined | null): string { return inlineHtml(v ?? ''); }
}

@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
  transform(v: string | undefined | null): string { return markdownHtml(v ?? ''); }
}

@Pipe({ name: 'plural' })
export class PluralPipe implements PipeTransform {
  transform(n: number, one: string, few: string, many: string): string {
    if (n === 1) return one;
    const d = n % 10, h = n % 100;
    return d >= 2 && d <= 4 && (h < 10 || h >= 20) ? few : many;
  }
}

@Component({
  selector: 'app-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (code()) { <pre><code [innerHTML]="html()"></code></pre> }`,
})
export class CodeBlock {
  readonly code = input<string | undefined>();
  readonly lang = input<string | undefined>();
  protected readonly html = computed(() => highlight(this.code() ?? '', this.lang()));
}

@Component({
  selector: 'app-cat-tag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="tag"><span class="dot" [class]="'dot ' + content.kind(cat())"></span>{{ content.catName(cat()) }}</span>`,
})
export class CatTag {
  protected readonly content = inject(ContentService);
  readonly cat = input.required<string>();
}

@Component({
  selector: 'app-level',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="lvl" [class.l3]="level() === 3">{{ label() }}</span>`,
})
export class LevelBadge {
  readonly level = input<Level | undefined>(2);
  protected readonly label = computed(() => (this.level() === 1 ? 'junior' : this.level() === 3 ? 'senior' : 'mid'));
}
