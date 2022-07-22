import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import DuckiesContractBuild from '../../../../contracts/artifacts/contracts/Duckies.sol/Duckies.json';

const generateJWTWithRef = async (ref: string) => {
    const jwtPrivateKey = process.env.NEXT_PUBLIC_JWT_PRIVATE_KEY || '';
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

    const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_POLYGON_URL);

    const contract = new ethers.Contract(
        contractAddress,
        DuckiesContractBuild.abi,
        provider,
    );

    const decimals = await contract.decimals();

    const payload = {
        ref,
        amt: 10000 * 10 ** decimals,
    };

    const jwtToken = jwt.sign(payload, jwtPrivateKey);

    return jwtToken;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const linkResponse = await generateJWTWithRef(req.query.address as string);

    res.status(200).json({ token: linkResponse });
}
