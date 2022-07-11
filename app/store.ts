import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { alertsReducer } from '../features/alerts/alertsSlice';
import { globalsReducer } from '../features/globals/globalsSlice';

export * from '../features/alerts/alertsSlice';
export * from '../features/globals/globalsSlice';

export const store = configureStore({
    reducer: {
        alerts: alertsReducer,
        globals: globalsReducer,
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
