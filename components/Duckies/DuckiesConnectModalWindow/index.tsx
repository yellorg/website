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
                        <div className="mw-modal-window__header-title">
                            {props.headerContent}
                        </div>
                        <div onClick={closeModal} className="mw-modal-window__header-cancel">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 13L13 1M1 1L13 13" stroke="#AAAAAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <div className="mw-modal-window__body">
                        {props.bodyContent}
                    </div>
                </div>
            </div>
        </>
    );
};
