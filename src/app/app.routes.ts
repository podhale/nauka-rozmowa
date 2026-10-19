import { Routes } from '@angular/router';
import { CardsSetupPage } from './features/cards/cards-setup.page';
import { LearnPage } from './features/learn/learn.page';
import { LessonPage } from './features/learn/lesson.page';
import { QuizResultPage } from './features/quiz/quiz-result.page';
import { QuizSetupPage } from './features/quiz/quiz-setup.page';
import { QuizPage } from './features/quiz/quiz.page';
import { SearchPage } from './features/search/search.page';
import { SheetDetailPage } from './features/sheets/sheet-detail.page';
import { SheetsPage } from './features/sheets/sheets.page';
import { StatsPage } from './features/stats/stats.page';
import { StudyResultPage } from './features/study/study-result.page';
import { StudyPage } from './features/study/study.page';
import { TodayPage } from './features/today/today.page';

// Eagerly loaded on purpose: the whole app is small and must work as one bundle
// inside a Claude artifact and inside Capacitor without extra chunk requests.
export const routes: Routes = [
  { path: '', component: TodayPage, title: 'Dziś' },
  { path: 'nauka', component: LearnPage, title: 'Nauka' },
  { path: 'nauka/:id', component: LessonPage, title: 'Lekcja' },
  { path: 'fiszki', component: CardsSetupPage, title: 'Fiszki' },
  { path: 'fiszki/sesja', component: StudyPage, title: 'Fiszki' },
  { path: 'fiszki/wynik', component: StudyResultPage, title: 'Wynik' },
  { path: 'test', component: QuizSetupPage, title: 'Test' },
  { path: 'test/sesja', component: QuizPage, title: 'Test' },
  { path: 'test/wynik', component: QuizResultPage, title: 'Wynik testu' },
  { path: 'sciagi', component: SheetsPage, title: 'Ściągi' },
  { path: 'sciaga/:cat/:topic', component: SheetDetailPage, title: 'Ściąga' },
  { path: 'postep', component: StatsPage, title: 'Postęp' },
  { path: 'szukaj', component: SearchPage, title: 'Szukaj' },
  { path: '**', redirectTo: '' },
];
