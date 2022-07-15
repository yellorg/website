import React from 'react';
import useDuckiesContract from './useDuckiesContract';
import useWallet from './useWallet';

export default function useAffiliates() {
    const [affiliates, setAffiliates] = React.useState<number[]>([0, 0, 0, 0, 0]);

    const duckiesContract = useDuckiesContract();
    const { active, account, signer } = useWallet();

    const getAffiliates = React.useCallback(async() => {
        if (account && signer) {
            const affiliatesCount = await duckiesContract?.connect(signer).getAffiliatesCount();

            setAffiliates(affiliatesCount);
        }
    }, [account, duckiesContract, signer]);

    const getAffiliatesCountOnLevel = React.useCallback((level: string, value: string): boolean => {
        return affiliates[+level - 1] < +value ? false : true;
    }, [affiliates]);

    const getAffiliatesRuleCompleted = React.useCallback((level: string, key: string, value: string): boolean => {
        switch (key) {
            case 'count':
                const [_, levelNumber] = level.split('-');

                return getAffiliatesCountOnLevel(levelNumber, value);
            default:
                return false;
        }
    }, [getAffiliatesCountOnLevel]);

    React.useEffect(() => {
        if (active && account) {
            getAffiliates();
        } else {
            setAffiliates([0, 0, 0, 0, 0]);
        }
    }, [active, account, getAffiliates]);

    return {
        affiliates,
        getAffiliatesRuleCompleted,
    };
}
