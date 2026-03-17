import { createSlice } from "@reduxjs/toolkit";
import type { Supervision } from "@/features/supervisions/types";

interface SupervisionState {
  list: Supervision[];
}

const initialState: SupervisionState = {
  list: [],
};

const supervisionSlice = createSlice({
  name: "supervision",
  initialState,
  reducers: {
    setSupervisions: (state, action) => {
      state.list = action.payload;
    },
  },
});

export const { setSupervisions } = supervisionSlice.actions;
export default supervisionSlice.reducer;
