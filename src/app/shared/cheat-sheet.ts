import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../core/content.service';
import { SessionService } from '../core/session.service';
import { shuffle } from '../core/srs';
import { SpeakButton } from './speak';
import { CatTag, CodeBlock, PluralPipe, RichPipe } from './ui';

/** Renders one cheat sheet (points, pitfalls, example, "how to say it"). */
@Component({
  selector: 'app-cheat-sheet',
  imports: [CatTag, CodeBlock, RichPipe, PluralPipe, RouterLink, SpeakButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (sheet(); as sh) {
      <div class="sheet">
        @if (showTitle()) {
          <div class="stack" style="gap:4px"><app-cat-tag [cat]="cat()" /><h2>{{ topic() }}</h2></div>
        }
        <ul>@for (p of sh.points; track $index) { <li><span [innerHTML]="p | rich"></span>@if (isEnglish()) { <app-speak [text]="english(p)" label="" /> }</li> }</ul>
        @if (sh.pitfalls?.length) {
          <div class="stack" style="gap:6px">
            <p class="eyebrow" style="color:var(--bad)">Pułapki</p>
            <ul class="pit">@for (p of sh.pitfalls; track $index) { <li [innerHTML]="p | rich"></li> }</ul>
          </div>
        }
        <app-code [code]="sh.code" [lang]="sh.lang" />
        @if (sh.say) {
          <div class="stack" style="gap:6px"><p class="eyebrow">Jak to powiedzieć na rozmowie</p><p class="say" [innerHTML]="sh.say | rich"></p>
            @if (isEnglish()) { <app-speak [text]="english(sh.say)" /> }</div>
        }
        @if (showActions()) {
          <div class="minirow">
            @if (cardCount()) { <button class="btn" (click)="studyTopic()">Fiszki z tematu <small>{{ cardCount() }}</small></button> }
            @if (quizCount()) { <button class="btn" (click)="quizTopic()">Test z tematu <small>{{ quizCount() }}</small></button> }
          </div>
        }
      </div>
    } @else {
      <p class="muted">
        Brak ściągi dla tego tematu.
        @if (cardCount()) { Przejrzyj {{ cardCount() }} {{ cardCount() | plural: 'fiszkę' : 'fiszki' : 'fiszek' }} z tematu w zakładce <a routerLink="/sciagi">Ściągi</a>. }
      </p>
    }
  `,
})
export class CheatSheetView {
  private readonly content = inject(ContentService);
  private readonly session = inject(SessionService);
  readonly cat = input.required<string>();
  readonly topic = input.required<string>();
  readonly showTitle = input(true);
  readonly showActions = input(true);
  protected readonly sheet = computed(() => this.content.sheet(this.cat(), this.topic()));
  protected readonly cardCount = computed(() => this.content.cardsFor(this.cat(), this.topic()).length);
  protected readonly quizCount = computed(() => this.content.quizFor(this.cat(), this.topic()).length);

  protected readonly isEnglish = computed(() => this.cat() === 'english');
  /** "English phrase — polskie tłumaczenie" → the English part only. */
  protected english(text: string): string { return text.split(/\s[—–]\s|\s\(/)[0]; }

  protected studyTopic(): void { this.session.startStudy(this.content.cardsFor(this.cat(), this.topic()), this.topic(), { srs: false }); }
  protected quizTopic(): void { this.session.startQuiz(shuffle(this.content.quizFor(this.cat(), this.topic())), this.topic()); }
}
