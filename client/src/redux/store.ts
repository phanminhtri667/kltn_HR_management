// store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import departmentReducer from './features/departmentSlice';
import positionReducer from './features/positionSlice';
import toastReducer from './features/toastSlice';
const store = configureStore({
  reducer: {
    auth: authReducer,
    departments: departmentReducer,
    position: positionReducer,
    toast: toastReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
