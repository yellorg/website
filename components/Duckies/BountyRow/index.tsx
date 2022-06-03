import React from 'react';
import classnames from 'classnames';
import { convertNumberToLiteral } from '../../../helpers/convertNumberToLiteral';
import { DuckiesConnectorModalWindow } from '../DuckiesConnectModalWindow';
import Image from 'next/image';

export interface BountyItem {
    fid: string;
    description: string;
    limit: number;
    title: string;
    triggerPhrase: string;
    value: number;
    status: string;
}

interface BountyProps {
    bounty: BountyItem;
    handleClaim: (id: string) => void;
    index: number;
}

export const BountyRow: React.FC<BountyProps> = ({ bounty, handleClaim, index }: BountyProps) => {
    const [isOpenShow, setIsOpenShow] = React.useState<boolean>(false);
    const [isOpenClaim, setIsOpenClaim] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(false);

    const rowClassName = React.useMemo(() => {
        return classnames('table-row table-row-bounty', {
            'cr-bounty-row': bounty.status === 'claim' && !loading,
        })
    }, [bounty.status, loading]);

    const indexClassName = React.useMemo(() => {
        return classnames('table-row-key-index ', {
            'table-row-key-index--active': bounty.status === 'claim' && !loading,
        })
    }, [bounty.status, loading]);

    const duckiesColor = React.useMemo(() => bounty.status === 'claim' ? '#ECAA00' : '#525252', [bounty.status]);

    const handleClaimReward = React.useCallback(async () => {
        setLoading(true);
        setIsOpenClaim(false);
        await handleClaim(bounty.fid);
        setLoading(false);
    }, [handleClaim, bounty.fid]);

    const handleSelectBountyId = (id: string | number) => {
        setIsOpenShow(true);
    };

    const renderBountyStatus = React.useMemo(() => {
        if (loading) {
            return (
                <div className="cr-bounty-processing">
                    Processing...
                </div>
            );
        }

        switch (bounty.status) {
            case 'claim':
                return (
                    <div onClick={() => setIsOpenClaim(true)} className="button button--outline button--secondary button--shadow-secondary">
                        <span className="button__inner">Claim</span>
                    </div>
                );
            case 'claimed':
                return (
                    <div className="cr-bounty-claimed">
                        Claimed
                    </div>
                );
            default:
                return null;
        }
    }, [bounty, loading]);

    const renderBounty = React.useMemo(() => {
        return (
            <div className={rowClassName}>
                <div className="table-row-key flex-row">
                    <div className={indexClassName}>
                        {index}
                    </div>
                    <div>
                        <div className="table-row-key-title">
                            {bounty.title}
                        </div>
                        <div onClick={() => handleSelectBountyId(bounty.fid)} className="table-row-key-subtitle">
                            <span>Show more details</span>
                            <span className="cr-arrow" />
                        </div>
                    </div>
                </div>
                <div className="table-row-value">
                    <div className="cr-bounty-column-status">
                        {renderBountyStatus}
                    </div>
                    <div className="cr-bounty-column-amount">
                        <span>{convertNumberToLiteral(bounty.value)}</span>
                        <svg width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.51487 3.11111H0V24.8889H9.51487C15.9624 24.8889 20 20.2844 20 14C20 7.59111 15.8998 3.11111 9.51487 3.11111ZM9.42097 21.0311H4.25665V6.93778H9.42097C13.1768 6.93778 15.6808 9.76889 15.6808 13.9067C15.6808 18.1067 13.1768 21.0311 9.42097 21.0311Z" fill={duckiesColor}/>
                            <path d="M3.92 0H7.04989V6.22222H3.92V0Z" fill={duckiesColor}/>
                            <path d="M3.92 21.7778H7.04989V28H3.92V21.7778Z" fill={duckiesColor}/>
                            <path d="M8.61484 0H11.7447V6.22222H8.61484V0Z" fill={duckiesColor}/>
                            <path d="M8.61484 21.7778H11.7447V28H8.61484V21.7778Z" fill={duckiesColor}/>
                        </svg>
                    </div>
                </div>
            </div>
        );
    }, [
        bounty.fid,
        bounty.value,
        bounty.title,
        index,
        renderBountyStatus,
        duckiesColor,
        indexClassName,
        rowClassName,
    ]);

    const renderModalBody = React.useMemo(() => {
        return (
            <div className="cr-bounty-modal__body">
                <div className="cr-bounty-modal__body-price">
                    <div className="cr-bounty-modal__body-price-value">
                        {bounty.value}
                        <svg width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.51487 3.11111H0V24.8889H9.51487C15.9624 24.8889 20 20.2844 20 14C20 7.59111 15.8998 3.11111 9.51487 3.11111ZM9.42097 21.0311H4.25665V6.93778H9.42097C13.1768 6.93778 15.6808 9.76889 15.6808 13.9067C15.6808 18.1067 13.1768 21.0311 9.42097 21.0311Z" fill="#ECAA00" />
                            <path d="M3.92 0H7.04989V6.22222H3.92V0Z" fill="#ECAA00" />
                            <path d="M3.92 21.7778H7.04989V28H3.92V21.7778Z" fill="#ECAA00" />
                            <path d="M8.61484 0H11.7447V6.22222H8.61484V0Z" fill="#ECAA00" />
                            <path d="M8.61484 21.7778H11.7447V28H8.61484V21.7778Z" fill="#ECAA00" />
                        </svg>
                    </div>
                </div>
                <div className="cr-bounty-modal__body-description">
                    {bounty.description}
                </div>
                <div className="cr-bounty-modal__body-buttons buttons-justify-center">
                    <div className="button button--outline button--secondary button--shadow-secondary" onClick={() => setIsOpenShow(false)}>
                        <span className="button__inner">OK</span>
                    </div>
                </div>
            </div>
        );
    }, [bounty]);

    const renderClaimModalBody = React.useMemo(() => {
        return (
            <div className="cr-bounty-modal__body">
                <div className="cr-bounty-modal__body-image">
                    <Image width="156px" height="156px" src="/images/components/duckies/duckDetective.svg" alt="duck-no-rewards" />
                </div>
                <div className="cr-bounty-modal__body-subtitle">
                    Amount to claim for completed<br/>
                    &quot;{bounty.title}&quot;<br/>
                    bounty
                </div>
                <div className="cr-bounty-modal__body-price">
                    <div className="cr-bounty-modal__body-price-value">
                        {bounty.value}
                        <svg width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.51487 3.11111H0V24.8889H9.51487C15.9624 24.8889 20 20.2844 20 14C20 7.59111 15.8998 3.11111 9.51487 3.11111ZM9.42097 21.0311H4.25665V6.93778H9.42097C13.1768 6.93778 15.6808 9.76889 15.6808 13.9067C15.6808 18.1067 13.1768 21.0311 9.42097 21.0311Z" fill="#ECAA00" />
                            <path d="M3.92 0H7.04989V6.22222H3.92V0Z" fill="#ECAA00" />
                            <path d="M3.92 21.7778H7.04989V28H3.92V21.7778Z" fill="#ECAA00" />
                            <path d="M8.61484 0H11.7447V6.22222H8.61484V0Z" fill="#ECAA00" />
                            <path d="M8.61484 21.7778H11.7447V28H8.61484V21.7778Z" fill="#ECAA00" />
                        </svg>
                    </div>
                </div>
                <div className="cr-bounty-modal__body-description">
                    {bounty.description}
                </div>
                <div className="cr-bounty-modal__body-buttons buttons-justify-center">
                    <div className="button button--outline button--secondary button--shadow-secondary" onClick={handleClaimReward}>
                        <span className="button__inner">Claim reward</span>
                    </div>
                </div>
            </div>
        );
    }, [bounty, handleClaimReward]);

    const renderModal = React.useMemo(() => {
        return (
            <DuckiesConnectorModalWindow
                isOpen={isOpenShow}
                headerContent={bounty.title}
                bodyContent={renderModalBody}
                setIsOpen={setIsOpenShow}
            />
        );
    }, [isOpenShow, bounty.title, renderModalBody]);

    const renderClaimModal = React.useMemo(() => {
        return (
            <DuckiesConnectorModalWindow
                isOpen={isOpenClaim}
                headerContent="Claim reward"
                bodyContent={renderClaimModalBody}
                setIsOpen={setIsOpenClaim}
            />
        );
    }, [isOpenClaim, renderClaimModalBody]);

    return (
        <React.Fragment>
            {renderBounty}
            {renderModal}
            {renderClaimModal}
        </React.Fragment>
    );
}
