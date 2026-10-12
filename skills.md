# Skills — Vue 3 + TS + Vite

Читать перед задачей. Стек: Vue 3.5 (`<script setup>`), TypeScript 5.9, Vite, Tailwind 4, oxlint, oxfmt. Менеджер пакетов — npm.

## Карта

- `src/views` — экраны. Собирают данные из composables и передают их вниз.
- `src/layouts` — оболочка. Может вызывать composables шапки, меню и темы.
- `src/components` — представление. Не читают `localStorage`, каталог и Telegram.
- `src/composables` — состояние и поведение. Один файл — одна зона данных.
- `src/types` — общие типы.
- `src/data` — JSON. Читает только `useCatalog`.
- `src/router` — hash-роутер (`createWebHashHistory`), чтобы мини-приложение жило на статике.
- `src/assets` — стили.
- `scripts/` — генерация постеров и прочие скрипты сборки.

## Правила

Компоненты — только `<script setup lang="ts">`. Options API, mixins и `defineComponent` не используются.

Порядок в скрипте: импорты, props / emits / model, состояние, computed, функции, подписки.

Пропсы: `defineProps<{ ... }>()` или именованный интерфейс, если тип переиспользуется. События: `defineEmits<{ name: [payload] }>()`. Поля формы — `defineModel`. В шаблоне только проверка и вывод; подписи, рейтинг и адреса считаются в `computed` или функциях.

Vue 3.5 сохраняет реактивность при деструктуризации props в `<script setup>`. В этом репозитории props читают через объект `props`, чтобы не смешивать стиль.

Корневое состояние — `ref` и `shallowRef`, не `reactive`. Списки — `shallowRef`. Производные значения — `computed`. Поля форм и флаги — `ref`. Composable возвращает объект с явным типом.

Подписки на `window`, `localStorage` и Telegram живут в composable, который владеет данными. Такой composable вызывает один хозяин. Флаги экрана (`exported`, открыто ли меню в пределах одного экрана) остаются в экране.

Каталог и «Мои рекомендации» проверяются в `useCatalog` на границе JSON. Тема — только `useTheme`, ключ `iran-cinema-theme` (тот же ключ в инлайн-скрипте `index.html`). Избранное — только `useFavorites`, ключ `iran-cinema-favorites`; шаринг в Telegram входит в эту зону. Имя аккаунта читает `useTelegram`. Если пользователя нет, на экране «Гость». Внешние ссылки открывает `useExternalLink`.

`strict: true`. На границах (`JSON.parse`, `localStorage`) тип — `unknown`, не `any`. `@ts-ignore` без причины не ставить. `verbatimModuleSyntax`: типы импортируются через `import type`. `erasableSyntaxOnly`: `enum` не использовать, вместо него `as const`.

Свои CSS-классы (`.btn`, `.card`, `.nav-link`) лежат в `@layer components`. Иначе они перекрывают утилиты Tailwind, включая `md:hidden`.

Dev-сервер слушает `127.0.0.1`. Без `server.host` Vite на Windows поднимается только на IPv6, и браузер по `127.0.0.1` его не видит.

Экспорт в Telegram идёт через `Telegram.WebApp.openTelegramLink`. Вне Telegram — `window.open(..., '_blank')`. Переход текущей вкладки на `t.me` из мини-приложения не используется.

Сети в приложении нет. Если появится запрос, отменять его через `AbortController` и держать явные `isLoading` и `error`.

## Готово, когда

- `npm run lint` без ошибок
- `npm run fmt:check` чистый
- `npx vue-tsc -b --pretty false` без ошибок (тот же шаг, что в `npm run build`)
- нет `any` и `@ts-ignore` без причины
- нет `v-if` и `v-for` на одном элементе

## Инструменты

oxlint, `.oxlintrc.json`: плагины `typescript`, `unicorn`, `oxc`, `vue`. Категория `correctness: "error"`. `rules` пустой — новое правило добавлять точечно и сразу упоминать здесь. env: `builtin`, `browser`, `node`. Игнор: `dist`, `public`. Запуск: `npm run lint`.

oxfmt, `.oxfmtrc.json`: одинарные кавычки, без точек с запятой, ширина строки 100. Игнор: `dist`, `public`. Запись: `npm run fmt`. Проверка: `npm run fmt:check`.

ESLint и Prettier не добавлять.

## Запуск

```
npm install
npm run dev
npm run lint
npm run fmt
npm run build
```

## Баги

Шаблон:

### [BUG-XXX] Заголовок

**Симптом:**
**Плохо:**
**Хорошо:**
**Причина:**
**Правило:**
**Теги:**

Сюда попадает повтор, который следующий проход по коду может сделать снова. Общие заметки по Vue — в конце файла, не в журнале.

### [BUG-001] Класс кнопки перекрывает `md:hidden`

**Симптом:** кнопка «Категории» видна на широком экране, хотя на ней стоит `md:hidden`.
**Плохо:** `.btn { display: inline-flex }` вне слоя, рядом с утилитой Tailwind.
**Хорошо:** те же классы внутри `@layer components` в `src/assets/main.css`.
**Причина:** неслойный CSS побеждает `@layer utilities` независимо от порядка в разметке.
**Правило:** свои классы писать в `@layer components`.
**Теги:** #css #tailwind

### [BUG-002] Vite на Windows не открывается по `127.0.0.1`

**Симптом:** `npm run dev` пишет, что сервер готов, браузер показывает ошибку сети.
**Плохо:** `defineConfig` без `server.host`. Процесс слушает только `[::1]:5173`.
**Хорошо:** `server: { host: '127.0.0.1', port: 5173 }` в `vite.config.ts`.
**Причина:** на Windows `localhost` у Vite уходит в IPv6, а часть клиентов ходит на IPv4.
**Правило:** dev-сервер явно слушает `127.0.0.1`.
**Теги:** #vite #windows

### [BUG-003] Экспорт избранного уводит из мини-приложения

**Симптом:** после «Экспорт в избранное Telegram» текущая вкладка открывает `t.me`, текст успеха пропадает.
**Плохо:** программно кликнуть `<a href="https://t.me/share/url?...">` без новой вкладки.
**Хорошо:** в Telegram — `WebApp.openTelegramLink`. Вне Telegram — `window.open(url, '_blank', 'noopener,noreferrer')` и успех только если окно открылось.
**Причина:** шаринг должен оставить мини-приложение на месте.
**Правило:** экспорт не навигирует текущий документ.
**Теги:** #telegram #favorites

## Заметки по Vue 3.5

Это не баги репозитория.

`watch` на объект не видит вложенное поле. Следить за примитивом: `watch(() => state.user.name, cb)`. `{ deep: true }` — только когда нужна вся глубина.

Слушатель `window` снимать в паре с установкой:

```ts
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))
```

Деструктуризация `reactive()` без `toRefs` отрывает значение от источника. К props в `<script setup>` на Vue 3.5 это не относится.
