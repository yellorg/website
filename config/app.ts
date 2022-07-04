export const appConfig = {
  appName: 'Duckies',
  blockchain: {
    mainChainId: +(process.env.NEXT_PUBLIC_MAIN_CHAIN_ID ?? 80001), // Polygon Testnet Mumbai
    supportedChainIds: [
      +(process.env.NEXT_PUBLIC_MAIN_CHAIN_ID ?? 80001), // 137: Polygon Mainnet, 80001: Polygon Testnet Mumbai
    ],
  },
  alertDisplayTime: '5',
  duckzSmartContractAddress: '0x7f0F3BEa976d62156A9658155DA5ce97F0E766ea'
}
