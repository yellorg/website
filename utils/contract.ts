import web3 from './web3';
import CampaignFactory from '../contracts/artifacts/contracts/Duckies.json';

// console.log(JSON.parse(CampaignFactory).abi);

const instance = typeof web3.eth !== 'undefined' && new web3.eth.Contract(
    CampaignFactory.abi,
    '0x0f91d28Fdc5E0EF0846913440Eb9b917cebb37f9',
);

export default instance;
