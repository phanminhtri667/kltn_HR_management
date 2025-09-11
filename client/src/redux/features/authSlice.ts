// authSlice.ts
// import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// interface AuthState {
//   isAuthenticated: boolean;
//   token: string | null;
// }

// const initToken = localStorage.getItem('token');

// const initialState: AuthState = {
//   isAuthenticated: initToken? true : false,
//   token: null,
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     login: (state, action: PayloadAction<string>) => {
//       state.isAuthenticated = true;
//       state.token = action.payload;
//     },
//     logout: (state) => {
//       state.isAuthenticated = false;
//       state.token = null;
//     },
//     checkToken: (state) => {
//       const token = localStorage.getItem('token');
//       if (token) {
//         state.isAuthenticated = true;
//         state.token = token;
//       }
//     },
//   },
// });

// export const { login, logout, checkToken } = authSlice.actions;
// export const selectAuthState = (state: { auth: AuthState }) => state.auth;
// export default authSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: any | null;
}

const tokenInStorage = localStorage.getItem('token');
const userInStorage = localStorage.getItem('user');

const initialState: AuthState = {
  isAuthenticated: !!tokenInStorage,
  token: tokenInStorage,
  user: userInStorage ? JSON.parse(userInStorage) : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string; user: any }>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    checkToken: (state) => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (token && user) {
        state.isAuthenticated = true;
        state.token = token;
        state.user = JSON.parse(user);
      }
    },
  },
});

export const { login, logout, checkToken } = authSlice.actions;
export const selectAuthState = (state: { auth: AuthState }) => state.auth;
export default authSlice.reducer;
