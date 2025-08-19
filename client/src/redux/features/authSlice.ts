// authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
}

const initToken = localStorage.getItem('token');

const initialState: AuthState = {
  isAuthenticated: initToken? true : false,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = true;
      state.token = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
    },
    checkToken: (state) => {
      const token = localStorage.getItem('token');
      if (token) {
        state.isAuthenticated = true;
        state.token = token;
      }
    },
  },
});

export const { login, logout, checkToken } = authSlice.actions;
export const selectAuthState = (state: { auth: AuthState }) => state.auth;
export default authSlice.reducer;
