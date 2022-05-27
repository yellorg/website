import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import DuckiesContractBuild from '../../contracts/artifacts/contracts/Duckies.sol/Duckies.json';
import Web3 from 'web3';

const web3 = new Web3();

const generateShareableLinkWithRef = async (ref: string) => {
    const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY || '';
    const jwtPrivateKey = process.env.NEXT_PUBLIC_JWT_PRIVATE_KEY || '';
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
    const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_INFURA_ID);

    const rewardMessage = {
        id: '1',
        ref,
        amt: 10000,
    };

    const contract = new ethers.Contract(
        contractAddress,
        DuckiesContractBuild.abi,
        provider,
    );

    const rewardMessageHash = await contract.getMessageHash(rewardMessage);
    const signature = await web3.eth.accounts.sign(rewardMessageHash, privateKey);

    const payload = {
        message: rewardMessage,
        sig: signature,
    };

    const jwtToken = jwt.sign(payload, jwtPrivateKey);

    return jwtToken;
};



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const linkResponse = await generateShareableLinkWithRef(req.query.address as string);

    res.status(200).json({ token : linkResponse });
}
