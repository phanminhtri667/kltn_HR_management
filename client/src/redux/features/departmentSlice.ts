
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DepartmentState {
  departments: string[]; // Thay đổi kiểu dữ liệu tùy theo cấu trúc 
}

const initialState: DepartmentState = {
  departments: [],
};

const departmentSlice = createSlice({
  name: 'department',
  initialState,
  reducers: {
    setDepartment: (state, action: PayloadAction<string[]>) => {
      state.departments = action.payload;
    },
  },
});



export const { setDepartment } = departmentSlice.actions;
export default departmentSlice.reducer;
