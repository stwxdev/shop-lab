<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Управління товарами</h1>
      <UButton
        icon="i-ph-plus"
        label="Додати товар"
        @click="isCreateModalOpen = true"
      />
    </div>

    <div v-if="pending" class="flex justify-center py-12">
      <UIcon name="i-ph-spinner" class="animate-spin text-4xl" />
    </div>

    <div v-else class="space-y-4">
      <UCard v-for="product in products" :key="product.id">
        <div class="flex gap-4">
          <img 
            :src="product.image" 
            :alt="product.name"
            class="w-24 h-24 object-contain rounded-md bg-gray-100 dark:bg-gray-800 p-2"
          />
          <div class="flex-1">
            <h3 class="text-xl font-bold">{{ product.name }}</h3>
            <p class="text-gray-500">{{ product.category.name }}</p>
            <p class="text-highlighted font-bold text-lg mt-1">{{ product.price }} UAH</p>
          </div>
          <div class="flex gap-2">
            <UButton
              icon="i-ph-pencil"
              variant="outline"
              @click="editProduct(product)"
            />
            <UButton
              icon="i-ph-trash"
              variant="outline"
              color="error"
              @click="deleteProduct(product.id)"
            />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Create/Edit Modal -->
    <UModal v-model="isCreateModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-xl font-bold">{{ editingProduct ? 'Редагувати товар' : 'Додати товар' }}</h3>
        </template>

        <div class="space-y-4">
          <UFormField label="Назва" required>
            <UInput v-model="productForm.name" />
          </UFormField>

          <UFormField label="Категорія" required>
            <USelect
              v-model="productForm.categoryId"
              :options="categoryOptions"
            />
          </UFormField>

          <UFormField label="Ціна (UAH)" required>
            <UInput 
              v-model.number="productForm.price" 
              type="number"
              step="0.01"
            />
          </UFormField>

          <UFormField label="Зображення (URL)" required>
            <UInput v-model="productForm.image" />
          </UFormField>

          <UFormField label="Опис">
            <UTextarea v-model="productForm.description" rows="3" />
          </UFormField>

          <div class="flex gap-2 pt-4">
            <UButton
              block
              color="primary"
              label="Зберегти"
              :loading="isSubmitting"
              @click="saveProduct"
            />
            <UButton
              variant="ghost"
              label="Скасувати"
              @click="isCreateModalOpen = false"
            />
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const { isManager, fetchUser } = useAuth()
const router = useRouter()

await fetchUser()

if (!isManager.value) {
  throw createError({
    statusCode: 403,
    message: 'Доступ заборонено'
  })
}

const { data: products, pending, refresh } = await useFetch('/api/products', {
  default: () => []
})

const { data: categories } = await useFetch('/api/categories', {
  default: () => []
})

const categoryOptions = computed(() => 
  categories.value.map((cat: any) => ({
    label: cat.name,
    value: cat.id
  }))
)

const isCreateModalOpen = ref(false)
const editingProduct = ref<any>(null)
const isSubmitting = ref(false)

const productForm = ref({
  name: '',
  categoryId: null as number | null,
  price: 0,
  image: '',
  description: ''
})

function editProduct(product: any) {
  editingProduct.value = product
  productForm.value = {
    name: product.name,
    categoryId: product.categoryId,
    price: product.price,
    image: product.image,
    description: product.description || ''
  }
  isCreateModalOpen.value = true
}

function resetForm() {
  editingProduct.value = null
  productForm.value = {
    name: '',
    categoryId: null,
    price: 0,
    image: '',
    description: ''
  }
}

async function saveProduct() {
  if (!productForm.value.name || !productForm.value.categoryId || !productForm.value.image || !productForm.value.price) {
    alert('Будь ласка, заповніть всі обов\'язкові поля')
    return
  }

  isSubmitting.value = true

  try {
    if (editingProduct.value) {
      await $fetch(`/api/products/${editingProduct.value.id}`, {
        method: 'PUT',
        body: productForm.value
      })
    } else {
      await $fetch('/api/products', {
        method: 'POST',
        body: productForm.value
      })
    }

    await refresh()
    isCreateModalOpen.value = false
    resetForm()
  } catch (error: any) {
    alert('Помилка: ' + (error.data?.message || 'Невідома помилка'))
  } finally {
    isSubmitting.value = false
  }
}

async function deleteProduct(id: number) {
  if (!confirm('Ви впевнені, що хочете видалити цей товар?')) {
    return
  }

  try {
    await $fetch(`/api/products/${id}`, {
      method: 'DELETE'
    })
    await refresh()
  } catch (error: any) {
    alert('Помилка: ' + (error.data?.message || 'Невідома помилка'))
  }
}
</script>
