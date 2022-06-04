import React from 'react';
import { Alert } from '../Alert';
import { appConfig } from '../../config/app';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { deleteAlert, deleteAlertByIndex } from '../../features/alerts/alertsSlice';

export const Alerts = () => {
    const alerts = useAppSelector(state => state.alerts.alerts);
    const alertDisplayTime = React.useMemo(() => appConfig.alertDisplayTime, []);

    const dispatch = useAppDispatch();

    const handleCloseAlert = React.useCallback(() => {
        dispatch(deleteAlert());
    }, []);

    const handleCloseAlertByClick = React.useCallback(async (alertIndex: number) => {
        dispatch(deleteAlertByIndex(alertIndex));
    }, []);

    const renderAlerts = React.useMemo(() => {
        return alerts.map((alert: any, index: number) => {
            const alertProps = {
                alertDisplayTime,
                type: alert.type,
                title: alert.title,
                message: alert.message,
                onClose: handleCloseAlert,
                onCloseByClick: () => handleCloseAlertByClick(index),
            };

            return (
                <div className="cr-alerts__alert" key={index}>
                    <Alert {...alertProps} />
                </div>
            );
        });
    }, [alerts]);

    return (
        <div className="cr-alerts">
            {renderAlerts}
        </div>
    );
};
