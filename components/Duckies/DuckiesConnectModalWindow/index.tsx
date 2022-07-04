import classnames from 'classnames';
import React from 'react';

interface DuckiesConnectorModalWindowProps {
    isOpen: boolean;
    headerContent: string;
    bodyContent: JSX.Element;
    setIsOpen: (value: boolean) => void;
};

export const DuckiesConnectorModalWindow = (props: DuckiesConnectorModalWindowProps) => {
    const wrapperClass = classnames('flex items-center justify-center fixed left-0 top-0 min-h-screen transition-all ease-in-out duration-200 w-full z-[999] bg-black/50', {
        'opacity-100 visible': props.isOpen,
        'opacity-0 hidden': !props.isOpen,
    });

    const modalClass = classnames('bg-body-background-color text-text-color-100 relative transition-all ease-in-out duration-200 py-[18px] px-6 w-[360px] border-2 border-text-color-100', {
        'opacity-100 visible m-3 scale-100': props.isOpen,
        'opacity-0 hidden': !props.isOpen
    });

    const wrapClass = classnames('flex items-center justify-center left-0 top-0 min-h-screen fixed transition-all ease-in-out duration-200 w-full z-[999]', {
        'opacity-100 visible': props.isOpen,
        'opacity-0 hidden': !props.isOpen,
    });

    const closeModal = () => {
        props.setIsOpen(false)
    };

    return (
        <>
            <div onClick={closeModal} className={wrapperClass} />
            <div className={wrapClass}>
                <div className={modalClass}>
                    <div className="flex items-center justify-center relative">
                        <div className="text-2xl font-semibold font-gilmer-medium max-w-[80%] text-center">
                            {props.headerContent}
                        </div>
                        <div onClick={closeModal} className="flex cursor-pointer absolute right-0 top-[10px]">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 13L13 1M1 1L13 13" stroke="#AAAAAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <div className="flex items-center justify-center mt-4 max-h-screen overflow-y-auto pb-4">
                        {props.bodyContent}
                    </div>
                </div>
            </div>
        </>
    );
};
