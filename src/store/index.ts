import { combineReducers, configureStore } from '@reduxjs/toolkit'
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

const rootReducer = combineReducers({
  ui: uiReducer,
  [patientApi.reducerPath]: patientApi.reducer,
})

const persistedReducer = persistReducer(
  {
    key: 'patient-app',
    storage,
    // Cache patient data + ui prefs locally; nothing else needs persisting.
    whitelist: ['ui', patientApi.reducerPath],
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

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
