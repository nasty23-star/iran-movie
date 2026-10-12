<script setup lang="ts">
import ThemeToggle from '@/components/ThemeToggle.vue'
import type { ThemeName } from '@/composables/useTheme'

defineProps<{
  theme: ThemeName
}>()

const emit = defineEmits<{
  skip: []
  toggleTheme: []
}>()

function onSkip() {
  emit('skip')
}

function onToggleTheme() {
  emit('toggleTheme')
}
</script>

<template>
  <section class="gate">
    <div class="flex justify-end">
      <ThemeToggle :theme="theme" @toggle="onToggleTheme" />
    </div>
    <div class="gate-body">
      <p class="text-sm font-semibold tracking-wide text-accent uppercase">Короткая справка</p>
      <h1 class="font-display text-4xl leading-tight text-balance">Почему иранское кино</h1>
      <p class="text-lg leading-8">
        Иранское кино говорит тихо и всё равно собирает залы по всему миру. Длинный план, ребёнок в
        кадре, разговор в машине и зеркало вместо лозунга: так Киаростами, Фархади, Панахи и Маджиди
        обсуждают справедливость, семью и достоинство.
      </p>
      <p class="text-lg leading-8 text-muted">
        Эта школа дважды получала «Оскар» за лучший фильм на иностранном языке и регулярно забирает
        главные призы Канн, Венеции и Берлина. Ограничение здесь не глушит речь, а собирает форму.
      </p>
      <div>
        <button type="button" class="btn btn-primary" @click="onSkip">Пропустить</button>
      </div>
    </div>
  </section>
</template>
