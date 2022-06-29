import React from 'react';
import classnames from 'classnames';
import { convertNumberToLiteral } from '../../../helpers/convertNumberToLiteral';
import { DuckiesConnectorModalWindow } from '../DuckiesConnectModalWindow';
import Image from 'next/image';
import * as ga from '../../../lib/ga';

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
    isLoading: boolean;
    isSingleBountyProcessing: boolean;
    setIsSingleBountyProcessing: (value: boolean) => void;
}

export const BountyRow: React.FC<BountyProps> = ({
    bounty,
    handleClaim,
    index,
    isLoading,
    isSingleBountyProcessing,
    setIsSingleBountyProcessing,
}: BountyProps) => {
    const [isOpenShow, setIsOpenShow] = React.useState<boolean>(false);
    const [isOpenClaim, setIsOpenClaim] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(false);

    const rowClassName = React.useMemo(() => {
        return classnames('flex w-full items-center justify-between border-b border-color-divider-color-40 px-1 py-2', {
            'bg-primary-cta-color-10': bounty.status === 'claim' && !((loading && isSingleBountyProcessing) || (isLoading && !isSingleBountyProcessing)),
        })
    }, [bounty.status, loading, isLoading, isSingleBountyProcessing]);

    const indexClassName = React.useMemo(() => {
        return classnames('py-1 px-[9.5px] text-base w-7 h-8 flex items-center justify-center font-bold rounded-sm mr-4 bg-neutral-control-color-30', {
            'bg-primary-cta-color-40': bounty.status === 'claim' && !((loading && isSingleBountyProcessing) || (isLoading && !isSingleBountyProcessing)),
        })
    }, [bounty.status, loading, isLoading, isSingleBountyProcessing]);

    const duckiesColor = React.useMemo(() => bounty.status === 'claim' ? '#ECAA00' : '#525252', [bounty.status]);

    const handleClaimReward = React.useCallback(async () => {
        setLoading(true);
        setIsSingleBountyProcessing(true);
        setIsOpenClaim(false);
        await handleClaim(bounty.fid);
        setLoading(false);
        setIsSingleBountyProcessing(false);
    }, [handleClaim, bounty.fid]);

    const handleSelectBountyId = React.useCallback(() => {
        setIsOpenShow(true);
        ga.event({
            action: "duckies_bounty_details_click",
            params: {
                bounty_id: bounty.fid,
            }
        });
    }, [bounty]);

    const renderBountyStatus = React.useMemo(() => {
        if ((loading && isSingleBountyProcessing) || (bounty.status === 'claim' && isLoading && !isSingleBountyProcessing)) {
            return (
                <div className="text-base text-system-yellow-60">
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
                    <div className="text-base text-system-green-60">
                        Claimed
                    </div>
                );
            default:
                return null;
        }
    }, [bounty, loading, isLoading, isSingleBountyProcessing]);

    const renderBounty = React.useMemo(() => {
        return (
            <div className={rowClassName}>
                <div className="flex flex-row items-center">
                    <div className={indexClassName}>
                        {index}
                    </div>
                    <div>
                        <div className="text-xl text-text-color-100">
                            {bounty.title}
                        </div>
                        <div onClick={handleSelectBountyId} className="text-base text-text-color-60 cursor-pointer w-fit flex items-center hover:text-text-color-100">
                            <span>Show more details</span>
                            <span className="cr-arrow" />
                        </div>
                    </div>
                </div>
                <div className="flex items-center text-2xl font-gilmer-medium text-text-color-100">
                    <div className="pr-[10px]">
                        {renderBountyStatus}
                    </div>
                    <div className="flex items-center justify-end w-[140px]">
                        <span className="mr-1">{convertNumberToLiteral(bounty.value)}</span>
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
        bounty.value,
        bounty.title,
        index,
        renderBountyStatus,
        duckiesColor,
        indexClassName,
        rowClassName,
        handleSelectBountyId,
    ]);

    const renderDetailsModalBody = React.useMemo(() => {
        return (
            <div className="flex flex-col w-full">
                <div className="bg-primary-cta-color-10 w-full flex justify-center py-3 mb-4">
                    <div className="text-text-color-100 text-2xl font-gilmer-bold flex items-center">
                        {bounty.value}
                        <svg className="ml-3" width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.51487 3.11111H0V24.8889H9.51487C15.9624 24.8889 20 20.2844 20 14C20 7.59111 15.8998 3.11111 9.51487 3.11111ZM9.42097 21.0311H4.25665V6.93778H9.42097C13.1768 6.93778 15.6808 9.76889 15.6808 13.9067C15.6808 18.1067 13.1768 21.0311 9.42097 21.0311Z" fill="#ECAA00" />
                            <path d="M3.92 0H7.04989V6.22222H3.92V0Z" fill="#ECAA00" />
                            <path d="M3.92 21.7778H7.04989V28H3.92V21.7778Z" fill="#ECAA00" />
                            <path d="M8.61484 0H11.7447V6.22222H8.61484V0Z" fill="#ECAA00" />
                            <path d="M8.61484 21.7778H11.7447V28H8.61484V21.7778Z" fill="#ECAA00" />
                        </svg>
                    </div>
                </div>
                <div className="text-text-color-100 text-sm text-center font-metro-regular font-medium mb-6">
                    {bounty.description}
                </div>
                <div className="flex items-center justify-center">
                    <div className="button button--outline button--secondary button--shadow-secondary" onClick={() => setIsOpenShow(false)}>
                        <span className="button__inner">OK</span>
                    </div>
                </div>
            </div>
        );
    }, [bounty]);

    const renderClaimRewardModalBody = React.useMemo(() => {
        return (
            <React.Fragment>
                <div className="text-text-color-100 text-base text-center font-metro-regular font-semibold mb-1">
                    Amount to claim for completed<br/>
                    &quot;{bounty.title}&quot;<br/>
                    bounty
                </div>
                <div className="bg-primary-cta-color-10 w-full flex justify-center py-3 mb-4">
                    <div className="text-text-color-100 text-2xl font-gilmer-bold flex items-center">
                        {bounty.value}
                        <svg className="ml-3" width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.51487 3.11111H0V24.8889H9.51487C15.9624 24.8889 20 20.2844 20 14C20 7.59111 15.8998 3.11111 9.51487 3.11111ZM9.42097 21.0311H4.25665V6.93778H9.42097C13.1768 6.93778 15.6808 9.76889 15.6808 13.9067C15.6808 18.1067 13.1768 21.0311 9.42097 21.0311Z" fill="#ECAA00" />
                            <path d="M3.92 0H7.04989V6.22222H3.92V0Z" fill="#ECAA00" />
                            <path d="M3.92 21.7778H7.04989V28H3.92V21.7778Z" fill="#ECAA00" />
                            <path d="M8.61484 0H11.7447V6.22222H8.61484V0Z" fill="#ECAA00" />
                            <path d="M8.61484 21.7778H11.7447V28H8.61484V21.7778Z" fill="#ECAA00" />
                        </svg>
                    </div>
                </div>
                <div className="text-text-color-100 text-sm text-center font-metro-regular font-medium mb-6">
                    {bounty.description}
                </div>
                <div className="flex items-center justify-center">
                    <div className="button button--outline button--secondary button--shadow-secondary" onClick={handleClaimReward}>
                        <span className="button__inner">Claim reward</span>
                    </div>
                </div>
            </React.Fragment>
        );
    }, [bounty, handleClaimReward]);

    const renderLoadingModalBody = React.useMemo(() => {
        return (
            <React.Fragment>
                <div className="text-text-color-100 text-sm text-center font-metro-regular font-medium mb-6">
                    In order for the on-chain transaction to be executed please wait a couple of minutes. Time may vary depending on the queue & gas.
                </div>
                <div className="flex items-center justify-center">
                    <div className="button button--outline button--secondary button--shadow-secondary" onClick={() => setIsOpenClaim(false)}>
                        <span className="button__inner">Confirm</span>
                    </div>
                </div>
            </React.Fragment>
        );
    }, []);

    const renderModalBody = React.useMemo(() => {
        return (
            <div className="flex flex-col w-full">
                <div className="flex justify-center mb-4">
                    <Image width="156px" height="156px" src="/images/components/duckies/duckDetective.png" alt="duck-no-rewards" />
                </div>
                {(isLoading || isSingleBountyProcessing) ? renderLoadingModalBody : renderClaimRewardModalBody}
            </div>
        );
    }, [isLoading, renderLoadingModalBody, renderClaimRewardModalBody, isSingleBountyProcessing]);

    const renderModal = React.useMemo(() => {
        return (
            <DuckiesConnectorModalWindow
                isOpen={isOpenShow}
                headerContent={bounty.title}
                bodyContent={renderDetailsModalBody}
                setIsOpen={setIsOpenShow}
            />
        );
    }, [isOpenShow, bounty.title, renderDetailsModalBody]);

    const renderClaimModal = React.useMemo(() => {
        return (
            <DuckiesConnectorModalWindow
                isOpen={isOpenClaim}
                headerContent="Claim reward"
                bodyContent={renderModalBody}
                setIsOpen={setIsOpenClaim}
            />
        );
    }, [isOpenClaim, renderModalBody]);

    return (
        <React.Fragment>
            {renderBounty}
            {renderModal}
            {renderClaimModal}
        </React.Fragment>
    );
}
