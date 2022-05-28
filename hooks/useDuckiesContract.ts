import useContract from './useContract';
import useWallet from './useWallet';
import { useMemo } from 'react';
import { ethers } from 'ethers';
import DuckiesContractBuild from '../contracts/artifacts/contracts/Duckies.sol/Duckies.json';

export default function useDuckiesContract() {
    const { chain, signer } = useWallet();

    const provider = useMemo(() => {
        return new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_INFURA_URL);
    }, [chain]);

    const duckiesContract = useContract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
        DuckiesContractBuild.abi,
        signer ? signer.provider : provider,
    );

    return duckiesContract;
};

