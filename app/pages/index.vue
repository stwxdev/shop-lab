<template>
    <div>
        <div class="mb-6">
            <h1 class="text-3xl font-bold mb-4">Каталог товарів</h1>
            
            <div class="flex gap-4 mb-4 flex-wrap">
                <UButton
                    v-for="category in categories"
                    :key="category.id"
                    :variant="selectedCategory === category.id ? 'solid' : 'outline'"
                    :color="selectedCategory === category.id ? 'primary' : 'neutral'"
                    @click="selectedCategory = category.id"
                >
                    {{ category.name }}
                </UButton>
                <UButton
                    v-if="selectedCategory"
                    variant="ghost"
                    color="neutral"
                    @click="selectedCategory = null"
                >
                    Всі категорії
                </UButton>
            </div>
        </div>

        <div v-if="pending" class="flex justify-center py-12">
            <UIcon name="i-ph-spinner" class="animate-spin text-4xl" />
        </div>

        <div v-else-if="error" class="text-center py-12">
            <p class="text-error">Помилка завантаження товарів</p>
        </div>

        <div v-else-if="products.length === 0" class="text-center py-12">
            <p class="text-gray-500">Товари не знайдені</p>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <Product
                v-for="product in filteredProducts"
                :key="product.id"
                :id="product.id.toString()"
                :image="product.image"
                :name="product.name"
                :price="product.price"
                currency="UAH"
                :category="product.category.name"
                :badge="undefined"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
interface Product {
  id: number
  name: string
  categoryId: number
  price: number
  image: string
  description: string | null
  category: {
    id: number
    name: string
  }
}

interface Category {
  id: number
  name: string
  description: string | null
}

const selectedCategory = ref<number | null>(null)

const { data: products, pending, error } = await useFetch<Product[]>('/api/products', {
    default: () => []
})

const { data: categories } = await useFetch<Category[]>('/api/categories', {
    default: () => []
})

const filteredProducts = computed(() => {
    if (!selectedCategory.value) {
        return products.value || []
    }
    return (products.value || []).filter((p: Product) => p.categoryId === selectedCategory.value)
})
</script>