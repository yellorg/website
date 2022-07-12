import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

export interface DuckiesPrizesList {
    collection?: string | React.ReactNode;
    imgPath?: string;
}

export const DuckiesPrizesList: DuckiesPrizesList[] = [
  {
    collection: "NFT COLLECTION #1",
    imgPath: "/images/components/duckies/duck.png",
  },
  {
    collection: (
      <div className="flex bottom-0 right-0 m-4 absolute inline-block">
        <span className="font-metro-semibold">SWAPPING FOR YELLOW </span>
        <LazyLoadImage
          srcSet={`${"/images/components/duckies/yellow-token.png"}`}
          threshold={30}
          width={25}
          height={25}
          className="mx-1"
        />
        <span className="font-metro-semibold">TOKENS</span>
      </div>
    ),
    imgPath: "/images/components/duckies/duckBusiness.png",
  },
  {
    collection: "UNIQUE LIMITED SEASON NFT",
    imgPath: "/images/components/duckies/duckPirate.png",
  },
];
