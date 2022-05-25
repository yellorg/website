import classnames from 'classnames';
import React from 'react';

interface DuckiesConnectorModalWindowProps {
    isOpen: boolean;
    headerContent: string;
    bodyContent: JSX.Element;
    setIsOpen: (value: boolean) => void;
};

export const DuckiesConnectorModalWindow = (props: DuckiesConnectorModalWindowProps) => {
    const wrapperClass = classnames(`mw-modal-window__wrapper`, {
        'mw-modal-window__wrapper--opened': props.isOpen,
    });

    const modalClass = classnames('mw-modal-window', {
        'mw-modal-window--opened': props.isOpen,
    });

    const wrapClass = classnames('mw-modal-window__wrap', {
        'mw-modal-window__wrap--opened': props.isOpen,
    });

    const closeModal = () => {
        props.setIsOpen(false)
    };

    return (
        <>
            <div onClick={closeModal} className={wrapperClass} />
            <div className={wrapClass}>
                <div className={modalClass}>
                    <div className="mw-modal-window__header">
                        <h4>{props.headerContent}</h4>
                        <div onClick={closeModal} className="mw-modal-window__header-cancel">X</div>
                    </div>
                    <div className="mw-modal-window__body">
                        {props.bodyContent}
                    </div>
                </div>
            </div>
        </>
    );
};
