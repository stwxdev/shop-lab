export interface CartItem {
  id: string
  name: string
  image: string
  price: number
  currency: string
  quantity: number
}

export const useCart = () => {
  const cart = useState<CartItem[]>('cart', () => [])

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    const existingItem = cart.value.find(i => i.id === item.id)
    
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.value.push({ ...item, quantity: 1 })
    }
  }

  const removeFromCart = (id: string) => {
    const index = cart.value.findIndex(item => item.id === id)
    if (index > -1) {
      cart.value.splice(index, 1)
    }
  }

  const updateQuantity = (id: string, quantity: number) => {
    const item = cart.value.find(i => i.id === id)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(id)
      } else {
        item.quantity = quantity
      }
    }
  }

  const clearCart = () => {
    cart.value = []
  }

  const totalItems = computed(() => {
    return cart.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  })

  const isEmpty = computed(() => cart.value.length === 0)

  return {
    cart: readonly(cart),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isEmpty
  }
}
