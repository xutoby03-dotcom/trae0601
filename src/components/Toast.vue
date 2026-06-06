<template>
  <Teleport to="body">
    <div v-if="visible" class="toast-container">
      <div class="toast" :class="type">
        <span class="toast-icon">{{ icon }}</span>
        <span class="toast-message">{{ message }}</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  message: String,
  type: {
    type: String,
    default: 'error'
  },
  duration: {
    type: Number,
    default: 2000
  }
})

const emit = defineEmits(['close'])

const visible = ref(false)

const icon = {
  error: '❌',
  success: '✅',
  warning: '⚠️',
  info: 'ℹ️'
}[props.type] || '❌'

watch(() => props.message, (val) => {
  if (val) {
    visible.value = true
    setTimeout(() => {
      visible.value = false
      emit('close')
    }, props.duration)
  }
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

.toast.error {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
}

.toast.success {
  background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
}

.toast.warning {
  background: linear-gradient(135deg, #ffd43b 0%, #fab005 100%);
  color: #333;
}

.toast.info {
  background: linear-gradient(135deg, #74c0fc 0%, #339af0 100%);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
