import React from 'react';

export default function Spinner(props: any): JSX.Element {
    return (
        <div role="status" className="spinner-border" {...props}>
            <span className="visually-hidden">Loading...</span>
        </div>
    );
};
