import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { storage } from '@/services/storage'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(storage.users.getCurrent())

  const isLoggedIn = computed(() => !!currentUser.value)
  const isManager = computed(() => currentUser.value?.role === 'manager')
  const isStaff = computed(() => currentUser.value?.role === 'staff')

  function login(username: string, password: string): User | null {
    const user = storage.users.login(username, password)
    if (user) {
      currentUser.value = user
      storage.users.setCurrent(user)
    }
    return user
  }

  function logout() {
    currentUser.value = null
    storage.users.setCurrent(null)
  }

  return {
    currentUser,
    isLoggedIn,
    isManager,
    isStaff,
    login,
    logout
  }
})
