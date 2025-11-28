
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PositionState {
  positions: string[]; 
}

const initialState: PositionState = {
    positions: [],
};

const departmentSlice = createSlice({
  name: 'position',
  initialState,
  reducers: {
    setPosition: (state, action: PayloadAction<string[]>) => {
      state.positions = action.payload;
    },
  },
});



export const { setPosition } = departmentSlice.actions;
export default departmentSlice.reducer;
