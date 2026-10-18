<script setup lang="ts">
import { ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { useTelegram } from '@/composables/useTelegram'
import { useTelegramChrome } from '@/composables/useTelegramChrome'
import type { AppStep } from '@/composables/useTelegramChrome'
import { useTheme } from '@/composables/useTheme'
import EntryView from '@/views/EntryView.vue'
import IntroView from '@/views/IntroView.vue'

const { displayName, username } = useTelegram()
const { theme, toggleTheme } = useTheme()
const step = ref<AppStep>('entry')

function enter() {
  step.value = 'intro'
}

function skip() {
  step.value = 'app'
}

function backToEntry() {
  step.value = 'entry'
}

useTelegramChrome({ step, enter, skip, backToEntry })
</script>

<template>
  <Transition name="fade" mode="out-in">
    <EntryView
      v-if="step === 'entry'"
      key="entry"
      :name="displayName"
      :username="username"
      :theme="theme"
      @enter="enter"
      @toggle-theme="toggleTheme"
    />
    <IntroView
      v-else-if="step === 'intro'"
      key="intro"
      :theme="theme"
      @skip="skip"
      @toggle-theme="toggleTheme"
    />
    <MainLayout v-else key="app" />
  </Transition>
</template>
