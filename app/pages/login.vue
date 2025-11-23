<template>
  <div class="max-w-md mx-auto mt-12">
    <UCard>
      <template #header>
        <h2 class="text-2xl font-bold text-center">Вхід</h2>
      </template>

      <div class="space-y-4">
        <UFormField label="Email" required>
          <UInput 
            v-model="form.email" 
            type="email"
            placeholder="email@example.com"
            icon="i-ph-envelope"
          />
        </UFormField>

        <UFormField label="Пароль" required>
          <UInput 
            v-model="form.password" 
            type="password"
            placeholder="Введіть пароль"
            icon="i-ph-lock"
          />
        </UFormField>

        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          :title="error"
        />

        <UButton
          block
          size="xl"
          color="primary"
          label="Увійти"
          :loading="isLoading"
          @click="handleLogin"
        />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { login } = useAuth()
const router = useRouter()

const form = ref({
  email: '',
  password: ''
})

const error = ref<string | null>(null)
const isLoading = ref(false)

async function handleLogin() {
  console.log('handleLogin')
  console.log(form.value.email, form.value.password)
  if (!form.value.email || !form.value.password) {
    error.value = 'Будь ласка, заповніть всі поля'
    return
  }

  error.value = null
  isLoading.value = true

  try {
    console.log(form.value.email, form.value.password)
    await login(form.value.email, form.value.password)
    await router.push('/')
  } catch (err: any) {
    error.value = err.message || 'Помилка входу'
  } finally {
    isLoading.value = false
  }
}

// Redirect if already authenticated
const { isAuthenticated, fetchUser } = useAuth()
await fetchUser()
if (isAuthenticated.value) {
  await router.push('/')
}
</script>
