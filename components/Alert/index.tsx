import * as React from 'react';
import {
    CheckCircleIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
    XCircleIcon,
    XIcon,
} from '@heroicons/react/outline';
import classNames from 'classnames';

type AlertType = 'success' | 'error' |'info' | 'warn';

interface AlertProps {
    type: AlertType;
    title: string;
    message: string;
    onClose?: () => void;
    onCloseByClick?: () => void;
    alertDisplayTime: string;
}

export const Alert: React.FC<AlertProps> = ({
    type,
    title,
    message,
    onClose,
    onCloseByClick,
    alertDisplayTime,
}: AlertProps) => {
    const handleCloseAlert = React.useCallback(() => {
        onCloseByClick?.();
    }, [onCloseByClick]);

    React.useEffect(() => {
        setTimeout(() => {
            onClose?.();
        }, +alertDisplayTime * 1000);
    }, []);

    const cxAlertIcon = React.useMemo(() => {
        return classNames('cr-alert__type-icon',
            type === 'success' && 'success',
            type === 'error' && 'error',
            type === 'info' && 'info',
            type === 'warn' && 'warn',
        );
    }, [type]);

    const renderAlertIcon = React.useMemo(() => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon className={cxAlertIcon} />;
            case 'error':
                return <XCircleIcon className={cxAlertIcon} />;
            case 'info':
                return <InformationCircleIcon className={cxAlertIcon} />;
            case 'warn':
                return <ExclamationCircleIcon className={cxAlertIcon} />;
            default:
                return null;
        }
    }, [type, cxAlertIcon]);

    return (
        <div className="cr-alert">
            <div className="cr-alert__type">
                {renderAlertIcon}
            </div>
            <div className="cr-alert__body">
                <p className="cr-alert__body-title">
                    {title}
                </p>
                <p className="cr-alert__body-message">
                    {message}
                </p>
            </div>
            <div className="cr-alert__close">
                <XIcon className="cr-alert__close-icon" onClick={handleCloseAlert} />
            </div>
        </div>
    );
};
