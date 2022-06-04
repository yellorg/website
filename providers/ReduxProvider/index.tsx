import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../app/store';

export const ReduxProvider = ({ children }: any): JSX.Element => {
    return (
        <Provider store={store}>
            {children}
        </Provider>
    );
};
