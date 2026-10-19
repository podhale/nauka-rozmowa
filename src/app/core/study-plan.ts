/**
 * "Plan dla fullstacka" – recommended order of study, based on the job-offer analysis
 * (content/README: docs/rynek.md) and the candidate's CV. Each step points to lessons
 * (by id) and flashcard areas (by cat); progress is computed from what was read/learned.
 */
export interface PlanStep {
  id: string;
  title: string;
  why: string;
  priority: 1 | 2 | 3;
  week: number;
  lessons: string[];
  cats: string[];
}

export const STUDY_PLAN: PlanStep[] = [
  { id: 'cv', title: 'Twoje projekty z CV', why: 'Pytają o nie na każdej rozmowie. Opanuj pitch każdego projektu i „opowiedz o sobie”.', priority: 1, week: 1,
    lessons: ['career-interview'], cats: ['cv'] },
  { id: 'csharp', title: 'C#, OOP i async/await', why: 'Fundament rozmowy technicznej .NET – GC, typy, LINQ, async, wątki.', priority: 1, week: 1,
    lessons: ['basics-dotnet', 'net-csharp-oop', 'basics-async', 'net-async'], cats: ['csharp'] },
  { id: 'api', title: 'ASP.NET Core: API, DI, błędy, auth', why: 'Najczęstsze wymaganie w ofertach backend/fullstack.', priority: 1, week: 1,
    lessons: ['basics-web', 'basics-api', 'net-di', 'net-aspnet-api', 'net-auth'], cats: ['aspnet', 'web'] },
  { id: 'db', title: 'SQL i EF Core', why: 'MS SQL jest w niemal połowie ofert; N+1, indeksy i transakcje to pewniaki.', priority: 1, week: 2,
    lessons: ['basics-db', 'data-sql-basics', 'data-indexes', 'data-transactions', 'data-efcore'], cats: ['sql', 'data'] },
  { id: 'angular', title: 'Angular: architektura, change detection, signals', why: 'Druga połowa fullstacka – komponenty, DI, OnPush/zoneless, signals.', priority: 1, week: 2,
    lessons: ['basics-angular', 'ng-architecture', 'ng-change-detection', 'ng-signals'], cats: ['angular', 'signals'] },
  { id: 'rxjs', title: 'RxJS, TypeScript i stan aplikacji', why: 'switchMap vs mergeMap, unsubscribe, NgRx/NGXS (masz w CV).', priority: 1, week: 2,
    lessons: ['ng-rxjs', 'ng-state', 'ng-forms-http'], cats: ['tsrx'] },
  { id: 'principles', title: 'SOLID, clean code i wzorce projektowe', why: 'Klasyka każdej rozmowy – od juniora do seniora.', priority: 1, week: 3,
    lessons: ['arch-solid', 'patterns-gof', 'patterns-enterprise'], cats: ['arch'] },
  { id: 'architecture', title: 'Clean Architecture, CQRS, DDD', why: 'Masz CQRS i mikroserwisy w CV – na pewno dopytają.', priority: 2, week: 3,
    lessons: ['arch-clean', 'patterns-clean', 'arch-ddd', 'arch-cqrs-es'], cats: ['arch'] },
  { id: 'quality', title: 'Testy i code review', why: 'Testy jednostkowe są w ok. 40% ofert; code review u seniorów.', priority: 2, week: 3,
    lessons: ['ops-testing'], cats: ['testing', 'review'] },
  { id: 'devops', title: 'Docker, CI/CD, Git, Azure', why: 'Docker i Kubernetes w ok. 46% ofert, Azure w 35%.', priority: 2, week: 4,
    lessons: ['basics-docker-cloud', 'basics-teamwork', 'ops-docker', 'ops-k8s-cicd', 'ops-azure'], cats: ['devops'] },
  { id: 'distributed', title: 'Kolejki, Kafka, Redis, mikroserwisy', why: 'RabbitMQ u seniorów w 43% ofert; asynchroniczna komunikacja to częsty temat.', priority: 3, week: 4,
    lessons: ['basics-queues', 'dist-messaging', 'dist-rabbitmq', 'dist-kafka', 'dist-patterns', 'dist-cache'], cats: ['dist'] },
  { id: 'senior', title: 'System design, observability, AI', why: 'Plusy na mid i obowiązek na seniora.', priority: 3, week: 4,
    lessons: ['arch-system-design', 'ops-observability', 'career-ai', 'career-livecoding'], cats: ['ai', 'algo'] },
  { id: 'english', title: 'Angielski na rozmowę', why: 'Większość ofert wymaga angielskiego – 10–15 minut dziennie przez cały plan.', priority: 1, week: 0,
    lessons: [], cats: ['english'] },
];
