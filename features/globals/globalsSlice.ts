import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GlobalsState {
    isRewardsClaimProcessing: boolean;
    isPhoneOtpCompleted: boolean;
}

export const initialGlobalsState: GlobalsState = {
    isRewardsClaimProcessing: false,
    isPhoneOtpCompleted: false,
};

const globalsSlice = createSlice({
    name: 'alerts',
    initialState: initialGlobalsState,
    reducers: {
        setIsRewardsClaimProcessing(state, action: PayloadAction<boolean>) {
            state.isRewardsClaimProcessing = action.payload;
        },
        setIsPhoneOtpCompleted(state, action: PayloadAction<boolean>) {
            state.isPhoneOtpCompleted = action.payload;
        }
    },
});

export const { setIsRewardsClaimProcessing, setIsPhoneOtpCompleted } = globalsSlice.actions;
export const globalsReducer = globalsSlice.reducer;
export default globalsSlice.reducer;
