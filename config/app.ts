export const appConfig = {
  appName: 'Duckies',
  blockchain: {
    mainChainId: +(process.env.NEXT_PUBLIC_MAIN_CHAIN_ID ?? 80001), // Polygon Testnet Mumbai
    supportedChainIds: [
      +(process.env.NEXT_PUBLIC_MAIN_CHAIN_ID ?? 80001), // 137: Polygon Mainnet, 80001: Polygon Testnet Mumbai
    ],
  },
  alertDisplayTime: '5',
  duckiesSmartContractAddress: '0xa455FFf21BEfC44978dDf8761fbbD6c0Cf110EC4'
}
