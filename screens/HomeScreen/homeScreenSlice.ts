import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface HomeScreenState {
  message: string;
}

const initialState: HomeScreenState = {
  message: "Hello Pakistan",
};

const homeScreenSlice = createSlice({
  name: "hello", 
  initialState,
  reducers: {
    setMessage: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
  },
});

export const selectMessage = (state: { hello: HomeScreenState }) => state.hello.message;

export const { setMessage } = homeScreenSlice.actions;
export default homeScreenSlice.reducer;