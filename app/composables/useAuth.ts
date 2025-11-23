export interface User {
  id: number
  email: string
  name: string | null
  role: 'MANAGER' | 'WAREHOUSE'
}

export const useAuth = () => {
  const user = useState<User | null>('user', () => null)

  const login = async (email: string, password: string) => {
    try {
      const response = await $fetch<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      user.value = response.user
      return response.user
    } catch (error: any) {
      throw new Error(error.data?.message || 'Помилка входу')
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST'
      })
      user.value = null
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const fetchUser = async () => {
    try {
      const response = await $fetch<{ user: User }>('/api/auth/me')
      user.value = response.user
      return response.user
    } catch (error) {
      user.value = null
      return null
    }
  }

  const isAuthenticated = computed(() => user.value !== null)
  const isManager = computed(() => user.value?.role === 'MANAGER')
  const isWarehouse = computed(() => user.value?.role === 'WAREHOUSE')

  return {
    user: readonly(user),
    login,
    logout,
    fetchUser,
    isAuthenticated,
    isManager,
    isWarehouse
  }
}
