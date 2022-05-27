import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import DuckiesContractBuild from '../../contracts/artifacts/contracts/Duckies.sol/Duckies.json';
import Web3 from 'web3';

const getTX = async (token: string, account: string) => {
    const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY || '';
    const jwtPrivateKey = process.env.NEXT_PUBLIC_JWT_PRIVATE_KEY || '';
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

    const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_INFURA_ID);
    const web3 = new Web3(new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_INFURA_ID || ''));

    const decodedJWT = jwt.verify(token, jwtPrivateKey);
    const contract = new ethers.Contract(
        contractAddress,
        DuckiesContractBuild.abi,
        provider,
    );

    const currentBlock = await (provider as any).getBlock();

    const rewardMessage = {
        id: 'referral',
        ref: (decodedJWT as any).ref as string,
        amt: (decodedJWT as any).amt as number,
        blockExpiration: currentBlock.number + 20,
    };

    const rewardMessageHash = await contract.getMessageHash(rewardMessage);
    const signature = await web3.eth.accounts.sign(rewardMessageHash, privateKey);

    return {
        message: rewardMessage,
        signature: signature.signature,
    };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const tx = await getTX(req.query.token as string, req.query.account as string);

        res.status(200).json(tx);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
