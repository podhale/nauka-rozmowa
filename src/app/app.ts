import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { ContentService } from './core/content.service';
import { SyncService } from './core/sync.service';
import { UiStateService } from './core/ui-state.service';

interface Tab { path: string; label: string; icon: string; exact: boolean; }

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
})
export class App {
  protected readonly content = inject(ContentService);
  protected readonly sync = inject(SyncService);
  protected readonly ui = inject(UiStateService);
  private readonly router = inject(Router);

  private readonly url = toSignal(this.router.events.pipe(filter(e => e instanceof NavigationEnd), map(e => e.urlAfterRedirects)), { initialValue: '/' });
  /** Tab bar hides during a running session to keep the screen calm. */
  protected readonly inSession = computed(() => /\/(fiszki|test)\/sesja/.test(this.url()));
  protected readonly syncLabel = computed(() => ({ local: 'lokalnie', connecting: 'łączę…', synced: 'zsynchronizowano', saving: 'zapisuję…' })[this.sync.status()]);

  protected readonly tabs: Tab[] = [
    { path: '/', label: 'Dziś', exact: true, icon: 'M4 11.5 12 4l8 7.5M6 10v10h12V10' },
    { path: '/fiszki', label: 'Fiszki', exact: false, icon: 'M5 6h12a2 2 0 0 1 2 2v12H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM7 3h12a2 2 0 0 1 2 2v12' },
    { path: '/test', label: 'Test', exact: false, icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17.5h.01' },
    { path: '/sciagi', label: 'Ściągi', exact: false, icon: 'M5 4h11l3 3v13H5zM9 10h6M9 14h6M9 18h3' },
    { path: '/postep', label: 'Postęp', exact: false, icon: 'M5 20V11M12 20V4M19 20v-6' },
  ];
}
