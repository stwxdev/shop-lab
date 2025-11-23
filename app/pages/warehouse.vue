<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Черга замовлень</h1>

    <div v-if="pending" class="flex justify-center py-12">
      <UIcon name="i-ph-spinner" class="animate-spin text-4xl" />
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-12">
      <p class="text-gray-500">Немає нових замовлень</p>
    </div>

    <div v-else class="space-y-4">
      <UCard v-for="order in orders" :key="order.id">
        <template #header>
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-xl font-bold">Замовлення #{{ order.id }}</h3>
              <p class="text-sm text-gray-500">{{ new Date(order.createdAt).toLocaleString('uk-UA') }}</p>
            </div>
            <UBadge color="primary" variant="soft">Нове</UBadge>
          </div>
        </template>

        <div class="space-y-4">
          <div>
            <h4 class="font-semibold mb-2">Контактна інформація:</h4>
            <p><strong>Телефон:</strong> {{ order.phone }}</p>
            <p><strong>Адреса:</strong> {{ order.address }}</p>
            <p v-if="order.comment"><strong>Коментар:</strong> {{ order.comment }}</p>
          </div>

          <div>
            <h4 class="font-semibold mb-2">Товари:</h4>
            <div class="space-y-2">
              <div 
                v-for="item in order.orderItems" 
                :key="item.id"
                class="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded"
              >
                <div class="flex items-center gap-2">
                  <img 
                    :src="item.product.image" 
                    :alt="item.product.name"
                    class="w-12 h-12 object-contain rounded bg-white dark:bg-gray-700 p-1"
                  />
                  <div>
                    <p class="font-medium">{{ item.product.name }}</p>
                    <p class="text-sm text-gray-500">Кількість: {{ item.quantity }}</p>
                  </div>
                </div>
                <p class="font-bold">{{ (item.price * item.quantity).toFixed(2) }} UAH</p>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-4 border-t">
            <p class="text-lg font-bold">
              Всього: {{ totalPrice(order).toFixed(2) }} UAH
            </p>
          </div>
        </div>

        <template #footer>
          <UButton
            block
            color="success"
            label="Перевести в статус 'Оброблене'"
            icon="i-ph-check"
            :loading="processingOrder === order.id"
            @click="processOrder(order.id)"
          />
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isWarehouse, fetchUser } = useAuth()
const router = useRouter()

await fetchUser()

if (!isWarehouse.value) {
  throw createError({
    statusCode: 403,
    message: 'Доступ заборонено'
  })
}

const { data: orders, pending, refresh } = await useFetch('/api/orders', {
  default: () => []
})

const processingOrder = ref<number | null>(null)

function totalPrice(order: any): number {
  return order.orderItems.reduce((sum: number, item: any) => 
    sum + (item.price * item.quantity), 0
  )
}

async function processOrder(id: number) {
  processingOrder.value = id

  try {
    await $fetch(`/api/orders/${id}/process`, {
      method: 'POST'
    })
    await refresh()
  } catch (error: any) {
    alert('Помилка: ' + (error.data?.message || 'Невідома помилка'))
  } finally {
    processingOrder.value = null
  }
}
</script>
