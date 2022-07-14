import useContract from './useContract';
import useWallet from './useWallet';
import { ethers } from 'ethers';
import DuckiesContractBuild from '../contracts/artifacts/contracts/Duckies.sol/Duckies.json';

const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_POLYGON_URL);

export default function useDuckiesContract() {
    const { signer } = useWallet();

    const duckiesContract = useContract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
        DuckiesContractBuild.abi,
        signer ? signer.provider : provider,
    );

    return duckiesContract;
};
