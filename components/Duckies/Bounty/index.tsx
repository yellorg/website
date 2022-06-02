import React, { useState } from 'react'
import { convertNumberToLiteral } from '../../../helpers/convertNumberToLiteral'
import { DuckiesConnectorModalWindow } from '../DuckiesConnectModalWindow'
 
const FAKE_BOUNTY = [
    {
        "fid": "id-1",
        "title": "Recruit 25 Affiliates level 1",
        "description": "With more friends you recruit",
        "status": "claim",
        "value": 70000
    },
    {
        "fid": "id-2",
        "title": "Comment this Tweet",
        "description": "React & Bootstrap Framework",
        "status": "process",
        "value": 135000
    },
    {
        "fid": "id-3",
        "title": "Design your pixel art Ducky",
        "description": "Bootstrap Framework",
        "status": "claimed",
        "value": 1230000
    },
    {
        "fid": "id-4",
        "title": "Create a DAO for your affiliates",
        "description": "Tailwind, React",
        "status": "claim",
        "value": 440000
    },
    {
        "fid": "id-5",
        "title": "Clap on this medium article",
        "description": "Vue Js, Tailwind",
        "status": "process",
        "value": 1394
    },
    {
        "fid": "id-6",
        "title": "Recruit 25 Affiliates level 1",
        "description": "With more friends you recruit",
        "status": "claim",
        "value": 141241
    },
    {
        "fid": "id-7",
        "title": "Comment this Tweet",
        "description": "React & Bootstrap Framework",
        "status": "process",
        "value": 2332
    },
    {
        "fid": "id-8",
        "title": "Design your pixel art Ducky",
        "description": "Bootstrap Framework",
        "status": "claimed",
        "value": 241251251
    },
    {
        "fid": "id-9",
        "title": "Create a DAO for your affiliates",
        "description": "Tailwind, React",
        "status": "claim",
        "value": 1232131
    },
    {
        "fid": "id-10",
        "title": "Clap on this medium article",
        "description": "Vue Js, Tailwind",
        "status": "process",
        "value": 1394
    },
    {
        "fid": "id-11",
        "title": "Create a DAO for your affiliates",
        "description": "Tailwind, React",
        "status": "claim",
        "value": 3223232
    },
    {
        "fid": "id-12",
        "title": "Clap on this medium article",
        "description": "Vue Js, Tailwind",
        "value": 22
    }
];

const Bounty = ({ slice } : any) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedBountyId, setSelectedBountyId] = useState<string | number>(-1);

    const rowClassName = (status: string) => status === 'claim' ? 'table-row cr-bounty-row table-row-bounty' : 'table-row table-row-bounty';
    const indexClassName = (status: string) => status === 'claim' ? 'table-row-key-index table-row-key-index--active' : 'table-row-key-index';

    const handleClaim = (id: string | number) => {
        console.log('handleClaim:', id);
    };

    const handleSelectBountyId = (id: string | number) => {
        setIsOpen(true);
        setSelectedBountyId(id);
    };

    const renderBountyStatus = (status: string, id: string | number) => {
        switch (status) {
            case 'claim':
                return (
                    <div onClick={() => handleClaim(id)} className="button button--outline button--secondary button--shadow-secondary">
                        <span className="button__inner">Claim</span>
                    </div>
                );
            case 'process':
                return (
                    <div className="cr-bounty-processing">
                        Processing ...
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
    };

    const renderBounties = () => {
        // by default slice.items;
        return FAKE_BOUNTY.map((bounty: any, index: number) => {
            const amount = bounty.value || 0;
            const duckiesColor = bounty.status === 'claim' ? '#ECAA00' : '#525252'

            return (
                <div id={`bounty_${bounty.fid}`} className={rowClassName(bounty.status)} key={`bounty-${index}`}>
                    <div className="table-row-key flex-row">
                        <div className={indexClassName(bounty.status)}>
                            {index}
                        </div>
                        <div>
                            <div className="table-row-key-title">
                                {bounty.title}
                            </div>
                            <div onClick={() => handleSelectBountyId(bounty.fid)} className="table-row-key-subtitle">
                                {/* {bounty.description} */}
                                <span>Show more details</span>
                                <span className="cr-arrow" />
                            </div>
                        </div>
                    </div>
                    <div className="table-row-value">
                        <div className="cr-bounty-column-status">
                            {renderBountyStatus(bounty.status, bounty.fid)}
                        </div>
                        <div className="cr-bounty-column-amount">
                            <span>{convertNumberToLiteral(amount)}</span>
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
        });
    }

    return (
        <>
            {renderBounties()}
            <DuckiesConnectorModalWindow
                isOpen={isOpen}
                headerContent="title"
                bodyContent={<div>Body</div>}
                setIsOpen={setIsOpen}
            />
        </>
    );

}

export const components = {
	bounty: Bounty,
};

export default Bounty
