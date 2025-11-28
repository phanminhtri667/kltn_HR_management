// toastSlice.js
import { createSlice } from '@reduxjs/toolkit';

export const toastSlice = createSlice({
  name: 'toast',
  initialState: {
    visible: false,
    severity: '',
    summary: '',
    detail: '',
    life: 3000,
  },
  reducers: {
    showToast: (state, action) => {
      state.visible = true;
      state.severity = action.payload.severity;
      state.summary = action.payload.summary;
      state.detail = action.payload.detail;
      state.life = action.payload.life;
    },
    hideToast: state => {
      state.visible = false;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
