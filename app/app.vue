<template>
  <UApp>
    <UHeader title="Онлайн магазин">
      <template #right>
        <div class="flex items-center gap-4">
          <template v-if="isAuthenticated">
            <div class="flex items-center gap-2">
              <UBadge 
                :label="user?.role === 'MANAGER' ? 'Менеджер' : 'Склад'"
                color="primary"
                variant="soft"
              />
              <UButton
                v-if="isManager"
                variant="ghost"
                label="Управління товарами"
                to="/manager"
              />
              <UButton
                v-if="isWarehouse"
                variant="ghost"
                label="Черга замовлень"
                to="/warehouse"
              />
              <UButton
                variant="ghost"
                icon="i-ph-sign-out"
                label="Вийти"
                @click="handleLogout"
              />
            </div>
          </template>
          <template v-else>
            <UButton
              variant="ghost"
              icon="i-ph-sign-in"
              label="Вхід"
              to="/login"
            />
          </template>
          <Cart />
        </div>
      </template>
    </UHeader>

    <UMain>
      <UContainer>
        <NuxtPage />
      </UContainer>
    </UMain>
  </UApp>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const { user, isAuthenticated, isManager, isWarehouse, logout, fetchUser } = useAuth()

await fetchUser()

async function handleLogout() {
  await logout()
  await navigateTo('/')
}
</script>
