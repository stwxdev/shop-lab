<template>
    <UCard class="overflow-hidden" variant="subtle" :ui="{ body: 'pt-1 p-3 sm:p-3 sm:pt-1', header: 'p-3 pb-0 sm:p-3 sm:pb-0', footer: 'p-3 sm:p-3' }">
        <template #header>
            <div class="relative dark:bg-muted light:bg-accented rounded-md">
                <UBadge class="absolute top-0 right-0 mt-1 mr-1" v-if="badge" :label="badge" variant="soft" color="primary" />
                <div class="p-8">
                    <img :src="image" :alt="name" class="w-full h-full size-1 object-contain" />
                </div>
            </div>
        </template>

        <div class="flex flex-col items-start justify-between gap-1">
            <div class="flex">
                <h3 class="text-highlighted bold text-xl">{{ formattedPrice }}</h3>
            </div>
            <p class="font-medium">{{ name }}</p>
            <p v-if="category" class="text-sm text-gray-500">{{ category }}</p>
        </div>

        <template #footer>
            <div class="flex gap-2">
                <UButton icon="i-ph-shopping-cart-duotone" size="xl" color="neutral" variant="solid" block @click="onAddToCart">
                    Add to cart
                </UButton>
            </div>
        </template>
    </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
    id?: string
    image: string
    name: string
    price: number
    currency?: string
    brand?: string
    badge?: string
    category?: string
}>()

const emit = defineEmits<{
    (e: 'add-to-cart'): void
}>()

const { addToCart } = useCart()

const currency = computed(() => props.currency ?? 'USD')
const brand = computed(() => props.brand ?? '—')
const badge = computed(() => props.badge)

const productId = computed(() => props.id ?? `${props.name}-${props.price}`)

const formattedPrice = computed(() =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.value }).format(props.price)
)

function onAddToCart() {
    addToCart({
        id: productId.value,
        name: props.name,
        image: props.image,
        price: props.price,
        currency: currency.value
    })
    emit('add-to-cart')
}
</script>