import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    setCart:    (state, action) => { state.items = action.payload },
    clearCart:  (state)         => { state.items = [] }
  }
})

export const { setCart, clearCart } = cartSlice.actions
export default cartSlice.reducer