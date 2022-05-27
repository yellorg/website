import React from 'react'

const Bounty = ({ slice }) => {
  return slice.items.map((bounty, index) => {
    return (
        <div id={`bounty_${bounty.fid}`} className="table-row" key={`bounty-${index}`}>
            <div className="table-row-key">
                <div className="table-row-key-title">
                    {bounty.title}
                </div>
                <div className="table-row-key-subtitle">
                    {bounty.description}
                </div>
            </div>
            <div className="table-row-value">
                <span>{bounty.value.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
                <svg width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.51487 3.11111H0V24.8889H9.51487C15.9624 24.8889 20 20.2844 20 14C20 7.59111 15.8998 3.11111 9.51487 3.11111ZM9.42097 21.0311H4.25665V6.93778H9.42097C13.1768 6.93778 15.6808 9.76889 15.6808 13.9067C15.6808 18.1067 13.1768 21.0311 9.42097 21.0311Z" fill="#525252"/>
                    <path d="M3.92 0H7.04989V6.22222H3.92V0Z" fill="#525252"/>
                    <path d="M3.92 21.7778H7.04989V28H3.92V21.7778Z" fill="#525252"/>
                    <path d="M8.61484 0H11.7447V6.22222H8.61484V0Z" fill="#525252"/>
                    <path d="M8.61484 21.7778H11.7447V28H8.61484V21.7778Z" fill="#525252"/>
                </svg>
            </div>
        </div>
    );
  });
}

export default Bounty
