This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## One-click run

[![Run on Google Cloud](https://deploy.cloud.run/button.svg)](https://deploy.cloud.run/?git_repo=https://github.com/yellorg/website.git)

## Deployment to K8s

To deploy the component to K8s, you should do the following:

1. Install Helm
2. Export all the env-vars
3. Run `.deploy/install.sh`
4. Enjoy

## Getting Started

First, run the development server:

```bash
npm install
npm run dev
```

Then, run **Prismic** local development server with slice machine which you can access at http://localhost:9999

```bash
npm run slicemachine
```

**Yellow Prismic** available on https://yellow.prismic.io/


## Deployment smart contract to Polygon mainnet

1. In contracts/.env you have to do next steps:
  - change `POLYGON_URL` to `https://polygon-rpc.com`
  - set your `PRIVATE_KEY` of metamask account
  - set `SIGNER_ACCOUNT` in .env
  - run `npx hardhat run scripts/deploy.ts --network matic`

2. In .env do next things:
  - set `NEXT_PUBLIC_POLYGON_URL` to `https://polygon-rpc.com`
  - set `NEXT_PUBLIC_CONTRACT_ADDRESS`
  - set `NEXT_PUBLIC_METAMASK_PRIVATE_KEY` to the private key of `SIGNER_ACCOUNT`
  - set `NEXT_PUBLIC_JWT_PRIVATE_KEY` to some secret string
  - set `NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID` to your Google Tag Manager ID

-----
