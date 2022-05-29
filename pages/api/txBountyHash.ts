import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import DuckiesContractBuild from '../../contracts/artifacts/contracts/Duckies.sol/Duckies.json';
import Web3 from 'web3';

const getBountyTransactionObject = async (token: string, account: string) => {
    const privateKey = process.env.NEXT_PUBLIC_METAMASK_PRIVATE_KEY || '';
    const jwtPrivateKey = process.env.NEXT_PUBLIC_JWT_PRIVATE_KEY || '';
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

    const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_INFURA_URL);
    const web3 = new Web3(new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_INFURA_URL || ''));

    console.log('private key', privateKey);
    console.log('jwtPrivateKey', jwtPrivateKey);
    console.log('contractAddress', contractAddress);

    const decodedJWT = jwt.verify(token, jwtPrivateKey);
    const contract = new ethers.Contract(
        contractAddress,
        DuckiesContractBuild.abi,
        provider,
    );

    const currentBlock = await (provider as any).getBlock();

    const rewardMessage = {
        id: (decodedJWT as any).ref as string,
        amt: (decodedJWT as any).amt as number,
        limit: (decodedJWT as any).limit as number,
        blockExpiration: currentBlock.number + 12,
        ref: '0x0000000000000000000000000000000000000000',
    };

    const nonce = await web3.eth.getTransactionCount(account);
    const rewardMessageHash = await contract.getMessageHash(rewardMessage);
    const signature = await web3.eth.accounts.sign(rewardMessageHash, privateKey);

    const iface = new ethers.utils.Interface(DuckiesContractBuild.abi);
    const data = iface.encodeFunctionData('reward', [[rewardMessage.id, rewardMessage.ref, rewardMessage.amt, rewardMessage.blockExpiration, rewardMessage.limit], signature.signature]);

    const initialTransaction = {
        from: account,
        nonce,
        to: contractAddress,
        data,
    };
    console.log(initialTransaction);
    const estimatedGas = await web3.eth.estimateGas(initialTransaction);

    const transaction = {
        ...initialTransaction,
        gasLimit: estimatedGas,
    };

    return {
        transaction,
    };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const tx = await getBountyTransactionObject(req.query.token as string, req.query.account as string);

        res.status(200).json(tx);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
