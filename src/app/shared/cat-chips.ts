import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '../core/content.service';
import { UiStateService } from '../core/ui-state.service';

/** Category multi-select, grouped (.NET / Frontend / …). Selection lives in UiStateService. */
@Component({
  selector: 'app-cat-chips',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stack">
      <div class="row" style="justify-content:space-between">
        <p class="eyebrow">Obszary</p>
        @if (ui.selectedCats().size) { <button class="linkbtn" (click)="ui.clearCats()">Wyczyść</button> }
      </div>
      @for (g of content.groups(); track g.name) {
        <div class="stack" style="gap:6px">
          <span class="eyebrow" style="font-size:.66rem">{{ g.name }}</span>
          <div class="chips">
            @for (c of g.cats; track c) {
              <button class="chip" [attr.aria-pressed]="ui.selectedCats().has(c)" (click)="ui.toggleCat(c)">
                <span [class]="'dot ' + g.kind"></span>{{ content.catName(c) }}
              </button>
            }
          </div>
        </div>
      }
      @if (!ui.selectedCats().size) { <p class="muted" style="font-size:.82rem">Nic nie zaznaczone = wszystkie obszary.</p> }
    </div>
  `,
})
export class CatChips {
  protected readonly content = inject(ContentService);
  protected readonly ui = inject(UiStateService);
}
