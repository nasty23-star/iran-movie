# Skills — Vue 3 + TS + Vite

> Читать перед задачей. После фикса бага (>15 мин) — дописывать в «Баги».
> Стек: Vue 3 (Composition API, `<script setup>`), TypeScript, Vite, oxlint, oxfmt.

## Карта проекта

- `src/views` — экраны. Собирают данные из composables и передают их вниз.
- `src/layouts` — оболочка приложения. Может вызывать composables шапки, меню, темы.
- `src/components` — представление. Не читают `localStorage`, каталог, Telegram. Получают состояние пропсами, сообщают о действиях через `emit` / `defineModel`.
- `src/composables` — состояние и поведение. Экраны не дублируют эту логику.
- `src/types` — общие типы.
- `src/data` — JSON. Читает только `useCatalog`.
- `src/router` — конфиг роутера.
- `src/assets` — стили, изображения.
- `scripts/` — вспомогательные скрипты сборки.

---

## Как я работаю

1. Перед задачей — просматриваю раздел «Баги» (не повторять).
2. Перед PR — пробегаю «Правила» и «Best practices».
3. После фикса бага — запись в «Баги».
4. После архитектурного решения — запись в «Решения».

## Definition of Done

- [ ] `npm run lint` — без ошибок
- [ ] `npm run fmt` — формат чистый
- [ ] `npm run typecheck` (`vue-tsc --noEmit`) — типы чистые
- [ ] Нет `any`, нет `@ts-ignore` без обоснования
- [ ] Props/emits типизированы (`defineProps<T>()`, `defineEmits<{ name: [payload] }>()`)
- [ ] Нет `v-if` + `v-for` на одном элементе
- [ ] Проверено, что не повторяю баг из журнала

---

## Слои

- `src/views` — экраны. Собирают данные из composables и передают их вниз.
- `src/layouts` — оболочка приложения. Может вызывать composables шапки, меню и темы.
- `src/components` — представление. Не читают `localStorage`, каталог и Telegram. Получают состояние пропсами, сообщают о действиях через `emit` или `defineModel`.
- `src/composables` — состояние и поведение. Экраны не дублируют эту логику у себя.
- `src/types` — общие типы.
- `src/data` — JSON. Его читает только `useCatalog`.

## Компоненты

- Только `<script setup lang="ts">`. Options API, mixins и `defineComponent` не используются.
- Пропсы описываются интерфейсом и `defineProps<Props>()`.
- События: `defineEmits<{ name: [payload] }>()`.
- Двусторонние поля формы — через `defineModel`.
- В шаблоне нет ветвлений сложнее проверки и вывода. Подписи, рейтинги и адреса считаются в `computed` или функциях скрипта.
- Корневое состояние компонента не объявляется через `reactive`.

### Порядок блоков в `<script setup>`

1. `import` (сначала внешние, потом внутренние)
2. `defineOptions` (если нужен `name`)
3. `defineProps` / `defineEmits` / `defineSlots`
4. `defineModel`
5. `ref` / `shallowRef`
6. `computed`
7. `watch` / `watchEffect`
8. функции
9. lifecycle (`onMounted`, `onUnmounted`)
10. `defineExpose` (редко)

## Composables

- Файл называется `use*.ts`, функция — `use*`. Один файл — одна задача.
- Общее состояние живёт в модульных `ref` и `shallowRef`, чтобы каждый вызов делил один источник.
- Списки — в `shallowRef`. Производные значения — в `computed`. Поля форм и флаги — в `ref`.
- Функция возвращает объект с явным типом.
- `onMounted`, `onUnmounted` и `watch` ставятся внутри composable, который владеет этим состоянием.
- Composable с подпиской на жизненный цикл вызывается одним хозяином.
- `any` не используется.

## Данные и постоянство

- Каталог и «Мои рекомендации» загружаются в `useCatalog` и проверяются на границе JSON.
- Тема пишется только в `useTheme`, ключ `iran-cinema-theme`.
- Избранное пишется только в `useFavorites`, ключ `iran-cinema-favorites`.
- Имя аккаунта Telegram читает `useTelegram`.
- Переход по внешней ссылке и экспорт списка в Telegram делают `useExternalLink` и `useFavorites`.

## TypeScript

- `strict: true`, `noUncheckedIndexedAccess: true`.
- `unknown` вместо `any` на границах (API, JSON.parse, postMessage).
- DTO с бэка — валидировать на границе.
- `enum` не использовать — `as const` объекты + `typeof`.
- Индексные типы — `Record<string, T>`, не `{ [k: string]: T }`.

## Асинхронность

- Всегда `try/catch` или `.catch()`.
- Отмена запросов при unmount через `AbortController`.
- Явный `isLoading` / `error`, не «магические» флаги.

## Инструменты

### oxlint (`.oxlintrc.json`)

- Плагины: `typescript`, `unicorn`, `oxc`, `vue`.
- Категории: `correctness: "error"`. Остальные категории выключены.
- `rules: {}` — набор правил пуст; новые правила добавлять точечно и осознанно.
- env: `builtin`, `browser`, `node`.
- Игнор: `dist`, `public`.
- Запуск: `npm run lint`.

### oxfmt (`.oxfmtrc.json`)

- Стиль: **single quotes**, **без точек с запятой**, ширина строки **100**.
- Игнор: `dist`, `public`.
- Запуск: `npm run fmt` (форматирование). Для проверки без записи — `npx oxfmt --check`.

### Прочее

- Не добавлять ESLint/Prettier — дублирование и конфликты с oxlint/oxfmt.
- Новое правило линтера — сначала в `.oxlintrc.json`, потом упомянуть здесь.
- Проверка типов — `vue-tsc --noEmit` (добавить в `package.json` как `typecheck`, если ещё нет).

## Запуск

`pnpm install`
`pnpm run dev`
`pnpm run lint`
`pnpm run fmt`
`pnpm run build`

---

## Баги

> Шаблон:
>
> ### [BUG-XXX] Заголовок
>
> **Симптом:**
> **Плохо:**
> **Хорошо:**
> **Причина:**
> **Правило:**
> **Теги:**

### [BUG-001] Деструктуризация props теряет реактивность

**Симптом:** значение в шаблоне не обновляется при изменении prop.
**Плохо:** `const { title } = defineProps<{ title: string }>()`
**Хорошо:** `const props = defineProps<...>()` + `props.title`.
**Причина:** деструктуризация забирает значение, а не ссылку.
**Правило:** props не деструктурировать.
**Теги:** #reactivity #props

### [BUG-002] `watch` не видит вложенное изменение

**Симптом:** изменение `state.user.name` не триггерит watch.
**Фикс:** `watch(() => state.user.name, cb)` или `{ deep: true }` осознанно.
**Правило:** watch на примитив, если возможно.
**Теги:** #watch #reactivity

### [BUG-003] Утечка listener

**Симптом:** компонент жив после unmount.
**Фикс:**

```ts
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))
```
