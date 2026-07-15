import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist'
import { storage } from './storage'
import { patientApi } from './patientApi'
import uiReducer from './uiSlice'
import familyReducer from './familySlice'

const rootReducer = combineReducers({
  ui: uiReducer,
  family: familyReducer,
  [patientApi.reducerPath]: patientApi.reducer,
})

const persistedReducer = persistReducer(
  {
    key: 'patient-app',
    storage,
    // Cache patient data + ui/family prefs locally; nothing else needs persisting.
    whitelist: ['ui', 'family', patientApi.reducerPath],
  },
  rootReducer,
)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE],
      },
    }).concat(patientApi.middleware),
})

export const persistor = persistStore(store)

// Powers refetchOnFocus / refetchOnReconnect in patientApi.
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
