import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    value: { token: null, user: null },
};

export const bodySlice = createSlice({
    name: 'body',
    initialState,
    reducers: {
       
        saveBody: (state, action) => {
            state.value.name = action.payload.name;
            state.value.orbit = action.payload.orbit;
            state.value.size = action.payload.size;
        },
    },
});

export const { saveBody } = bodySlice.actions;
export default bodySlice.reducer;

