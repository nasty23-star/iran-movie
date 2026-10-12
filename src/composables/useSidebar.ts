import { onMounted, onUnmounted, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useRoute } from 'vue-router'

export interface UseSidebar {
  open: Ref<boolean>
  toggle: () => void
  close: () => void
}

export function useSidebar(): UseSidebar {
  const route = useRoute()
  const open = ref(false)

  function toggle() {
    open.value = !open.value
  }

  function close() {
    open.value = false
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') close()
  }

  watch(() => route.path, close)
  onMounted(() => window.addEventListener('keydown', onKeydown))
  onUnmounted(() => window.removeEventListener('keydown', onKeydown))

  return { open, toggle, close }
}
