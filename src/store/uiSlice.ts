import { createSlice  } from '@reduxjs/toolkit'
import type {PayloadAction} from '@reduxjs/toolkit';

interface UiState {
  lastVisitedOrgId: string | null
}

const initialState: UiState = {
  lastVisitedOrgId: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLastVisitedOrgId(state, action: PayloadAction<string>) {
      state.lastVisitedOrgId = action.payload
    },
  },
})

export const { setLastVisitedOrgId } = uiSlice.actions
export default uiSlice.reducer
