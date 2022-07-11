import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GlobalsState {
    isRewardsClaimProcessing: boolean;
}

export const initialGlobalsState: GlobalsState = {
    isRewardsClaimProcessing: false,
};

const globalsSlice = createSlice({
    name: 'alerts',
    initialState: initialGlobalsState,
    reducers: {
        setIsRewardsClaimProcessing(state, action: PayloadAction<boolean>) {
            state.isRewardsClaimProcessing = action.payload;
        },
    },
});

export const { setIsRewardsClaimProcessing } = globalsSlice.actions;
export const globalsReducer = globalsSlice.reducer;
export default globalsSlice.reducer;
