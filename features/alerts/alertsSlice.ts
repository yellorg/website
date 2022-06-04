import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DispatchAlertPayload {
    type: string;
    title: string;
    message: string;
}

export interface AlertsState {
    alerts: DispatchAlertPayload[];
}

export const initialAlertsState: AlertsState = {
    alerts: [],
};

const alertsSlice = createSlice({
    name: 'alerts',
    initialState: initialAlertsState,
    reducers: {
        dispatchAlert(state, action: PayloadAction<DispatchAlertPayload>) {
            state.alerts.push(action.payload);
        },
        deleteAlert(state) {
            state.alerts.splice(0, 1);
        },
        deleteAlertByIndex(state, action: PayloadAction<number>) {
            state.alerts.splice(action.payload, 1);
        }
    },
});

export const { dispatchAlert, deleteAlert, deleteAlertByIndex } = alertsSlice.actions;
export const alertsReducer = alertsSlice.reducer;
export default alertsSlice.reducer;
