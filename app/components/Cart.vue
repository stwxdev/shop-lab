<template>
  <USlideover v-model="isOpen" direction="right" inset>
    <UButton 
      icon="i-ph-shopping-cart-duotone" 
      :label="`Відкрити корзину${totalItems > 0 ? ` (${totalItems})` : ''}`" 
      size="xl" 
      variant="subtle" 
      color="neutral"
      :badge="totalItems > 0 ? totalItems.toString() : undefined"
    />

    <template #content>
      <div class="flex flex-col h-full">
        <div class="flex-1 overflow-y-auto p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold">Кошик</h2>
            <UButton 
              icon="i-ph-x" 
              size="sm" 
              variant="ghost" 
              color="neutral"
              @click="isOpen = false"
            />
          </div>

          <div v-if="isEmpty" class="flex flex-col items-center justify-center py-12 text-center">
            <div class="text-6xl mb-4">🛒</div>
            <p class="text-gray-500 dark:text-gray-400 text-lg">Ваш кошик порожній</p>
          </div>

          <div v-else class="space-y-4">
            <div 
              v-for="item in cart" 
              :key="item.id"
              class="flex gap-4 p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
            >
              <img 
                :src="item.image" 
                :alt="item.name" 
                class="w-20 h-20 object-contain rounded-md bg-gray-100 dark:bg-gray-800 p-2"
              />
              
              <div class="flex-1 flex flex-col justify-between">
                <div>
                  <h3 class="font-semibold text-lg">{{ item.name }}</h3>
                  <p class="text-highlighted font-bold">{{ formatPrice(item.price, item.currency) }}</p>
                </div>

                <div class="flex items-center gap-3 mt-2">
                  <div class="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-md">
                    <UButton
                      icon="i-ph-minus"
                      size="xs"
                      variant="ghost"
                      color="neutral"
                      :disabled="item.quantity <= 1"
                      @click="updateQuantity(item.id, item.quantity - 1)"
                    />
                    <span class="px-2 min-w-[2rem] text-center">{{ item.quantity }}</span>
                    <UButton
                      icon="i-ph-plus"
                      size="xs"
                      variant="ghost"
                      color="neutral"
                      @click="updateQuantity(item.id, item.quantity + 1)"
                    />
                  </div>

                  <UButton
                    icon="i-ph-trash"
                    size="sm"
                    variant="ghost"
                    color="error"
                    @click="removeFromCart(item.id)"
                  />
                </div>
              </div>

              <div class="flex flex-col items-end justify-between">
                <p class="text-highlighted font-bold text-lg">
                  {{ formatPrice(item.price * item.quantity, item.currency) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!isEmpty" class="border-t border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <div class="flex justify-between items-center text-lg">
            <span class="font-semibold">Всього:</span>
            <span class="text-highlighted font-bold text-xl">
              {{ formatTotalPrice }}
            </span>
          </div>

          <UButton
            block
            size="xl"
            color="primary"
            variant="solid"
            label="Оформити замовлення"
            icon="i-ph-check"
            @click="handleCheckout"
          />

          <UButton
            block
            size="sm"
            color="error"
            variant="ghost"
            label="Очистити кошик"
            icon="i-ph-trash"
            @click="clearCart"
          />
        </div>
      </div>
    </template>
  </USlideover>

  <!-- Checkout Modal -->
  <UModal v-model:open="isCheckoutOpen">
    <template #content>
    <UCard>
      <template #header>
        <h3 class="text-xl font-bold">Оформлення замовлення</h3>
      </template>

      <div class="space-y-4">
        <UFormField label="Номер телефону" required>
          <UInput 
            v-model="checkoutForm.phone" 
            placeholder="+380501234567"
            icon="i-ph-phone"
          />
        </UFormField>

        <UFormField label="Адреса доставки" required>
          <UTextarea 
            v-model="checkoutForm.address" 
            placeholder="Введіть адресу доставки"
            :rows="3"
          />
        </UFormField>

        <UFormField label="Коментар (необов'язково)">
          <UTextarea 
            v-model="checkoutForm.comment" 
            placeholder="Додаткові побажання"
            :rows="3"
          />
        </UFormField>

        <div class="flex gap-2 pt-4">
          <UButton
            block
            color="primary"
            label="Підтвердити замовлення"
            :loading="isSubmitting"
            @click="submitOrder"
          />
          <UButton
            variant="ghost"
            label="Скасувати"
            @click="isCheckoutOpen = false"
          />
        </div>
      </div>
    </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const { cart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, isEmpty } = useCart()

const isOpen = ref(false)

const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat('uk-UA', { 
    style: 'currency', 
    currency: currency || 'USD' 
  }).format(price)
}

const formatTotalPrice = computed(() => {
  if (cart.value.length === 0) return formatPrice(0, 'USD')
  const currency = cart.value[0]?.currency || 'USD'
  return formatPrice(totalPrice.value, currency)
})

const isCheckoutOpen = ref(false)
const checkoutForm = ref({
  phone: '',
  address: '',
  comment: ''
})
const isSubmitting = ref(false)

async function handleCheckout() {
  if (cart.value.length === 0) return
  
  isCheckoutOpen.value = true
}

async function submitOrder() {
  if (!checkoutForm.value.phone || !checkoutForm.value.address) {
    alert('Будь ласка, заповніть телефон та адресу')
    return
  }

  isSubmitting.value = true
  
  try {
    const items = cart.value.map(item => {
      const productId = parseInt(item.id)
      if (isNaN(productId)) {
        throw new Error(`Invalid product ID: ${item.id}`)
      }
      return {
        productId,
        quantity: item.quantity,
        price: item.price
      }
    })

    await $fetch('/api/orders', {
      method: 'POST',
      body: {
        phone: checkoutForm.value.phone,
        address: checkoutForm.value.address,
        comment: checkoutForm.value.comment || undefined,
        items
      }
    })

    clearCart()
    isCheckoutOpen.value = false
    isOpen.value = false
    checkoutForm.value = { phone: '', address: '', comment: '' }
    
    alert('Замовлення успішно оформлено!')
  } catch (error: any) {
    alert('Помилка оформлення замовлення: ' + (error.data?.message || 'Невідома помилка'))
  } finally {
    isSubmitting.value = false
  }
}
</script>
