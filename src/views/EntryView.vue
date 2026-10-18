<script setup lang="ts">
import ThemeToggle from '@/components/ThemeToggle.vue'
import type { ThemeName } from '@/composables/useTheme'
import { useNativeChrome } from '@/composables/useTelegramChrome'

defineProps<{
  name: string
  username: string
  theme: ThemeName
}>()

const emit = defineEmits<{
  enter: []
  toggleTheme: []
}>()

const { nativeChrome } = useNativeChrome()

function onEnter() {
  emit('enter')
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
      <p class="text-sm font-semibold tracking-wide text-accent uppercase">Иранское кино</p>
      <h1 class="font-display text-4xl leading-tight text-balance md:text-5xl">
        Здравствуйте, {{ name }}
      </h1>
      <p v-if="username" class="text-muted">Аккаунт @{{ username }}</p>
      <p class="max-w-xl text-lg leading-8 text-muted">
        Мини-приложение Telegram: каталог иранского кино, номинации, личный топ и избранное.
      </p>
      <div v-if="!nativeChrome">
        <button type="button" class="btn btn-primary" @click="onEnter">Войти</button>
      </div>
    </div>
  </section>
</template>
