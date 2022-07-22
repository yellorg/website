import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import DuckiesContractBuild from '../../../../contracts/artifacts/contracts/Duckies.sol/Duckies.json';
import Web3 from 'web3';
import { createClient } from '../../../../prismicio';

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_POLYGON_URL || ''));
const privateKey = process.env.NEXT_PUBLIC_METAMASK_PRIVATE_KEY || '';
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_POLYGON_URL);
const contract = new ethers.Contract(contractAddress, DuckiesContractBuild.abi, provider);
const client = createClient();

const getMessage = async (bountyID: string, bounties: any, decimals: number, currentBlock: number) => {
    const bountyToClaim = bounties.data.slices[0].items.find((item: any) => item.fid === bountyID);

    if (bountyToClaim) {
        const rewardMessage = {
            id: bountyID,
            ref: '0x0000000000000000000000000000000000000000',
            amt: +bountyToClaim?.value * (10 ** decimals),
            blockExpiration: currentBlock + 24,
            limit: bountyToClaim?.limit,
        };
        const rewardMessageHash = await contract.getMessageHash(rewardMessage);
        const signature = await web3.eth.accounts.sign(rewardMessageHash, privateKey);

        return {
            message: rewardMessage,
            signature: signature.signature,
        };
    }

    return undefined;
};

const getBountyTransactionObject = async (bountiesIDs: string[], account: string) => {
    const bounties = await client.getSingle('bounties');
    const decimals = await contract.decimals();
    const currentBlock = await (provider as any).getBlock();

    let messagesObjectToClaim = [];

    for (const bounty of bountiesIDs) {
        const message = await getMessage(bounty, bounties, decimals, currentBlock.number);

        if (message) {
            messagesObjectToClaim.push(message);
        }
    }

    const messagesToClaim = messagesObjectToClaim.map((message: any) => {
        return [
            [
                message.message.id,
                message.message.ref,
                message.message.amt,
                message.message.blockExpiration,
                message.message.limit,
            ],
            message.signature,
        ];
    });

    const iface = new ethers.utils.Interface(DuckiesContractBuild.abi);
    const data = iface.encodeFunctionData('claimRewards', [messagesToClaim]);
    const nonce = await web3.eth.getTransactionCount(account);

    const initialTransaction = {
        from: account,
        nonce,
        to: contractAddress,
        data,
    };
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
        const bountyIDs = (req.query.bountyIDs as string).split(',');
        const tx = await getBountyTransactionObject(bountyIDs, req.query.account as string);

        res.status(200).json(tx);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}
