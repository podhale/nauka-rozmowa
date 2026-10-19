import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/**
 * "Pokaż więcej" footer for incrementally paginated lists.
 * The parent owns the `limit` signal; this only renders the counter and the button.
 */
@Component({
  selector: 'app-show-more',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (total() > shown()) {
      <div class="show-more">
        <span class="muted num">Pokazano {{ shown() }} z {{ total() }}</span>
        <button class="btn" (click)="more.emit()">Pokaż więcej <small>{{ next() }}</small></button>
        @if (allowAll() && remaining() > step()) { <button class="linkbtn" (click)="all.emit()">Pokaż wszystkie</button> }
      </div>
    }
  `,
})
export class ShowMore {
  readonly total = input.required<number>();
  readonly shown = input.required<number>();
  readonly step = input(30);
  readonly allowAll = input(true);
  readonly more = output<void>();
  readonly all = output<void>();
  protected readonly remaining = computed(() => this.total() - this.shown());
  protected readonly next = computed(() => Math.min(this.step(), this.remaining()));
}
