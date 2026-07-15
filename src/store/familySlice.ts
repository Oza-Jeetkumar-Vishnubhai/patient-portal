import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface FamilyState {
  // null = viewing the signed-in user's own data
  activePhone: string | null
}

const initialState: FamilyState = {
  activePhone: null,
}

const familySlice = createSlice({
  name: 'family',
  initialState,
  reducers: {
    setActivePhone(state, action: PayloadAction<string | null>) {
      state.activePhone = action.payload
    },
  },
})

export const { setActivePhone } = familySlice.actions
export default familySlice.reducer
