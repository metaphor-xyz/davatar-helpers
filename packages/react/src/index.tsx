import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';

import Image from './Image';

export { default as Image } from './Image';

export interface DavatarProps {
  size: number;
  address: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider?: any;
  graphApiKey?: string;
  generatedAvatarType?: 'jazzicon' | 'blockies';
}

export default function Davatar({ size, address, provider, graphApiKey, generatedAvatarType }: DavatarProps) {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    const eth = provider ? new ethers.providers.Web3Provider(provider) : ethers.getDefaultProvider();
    eth.lookupAddress(address).then(ensName => {
      if (ensName) {
        eth.getResolver(ensName).then(resolver => {
          resolver.getText('avatar').then(avatar => {
            if (avatar && avatar.length > 0) {
              setAvatarUri(avatar);
            }
          });
        });
      }
    });
  }, [address, provider]);

  return (
    <Image
      size={size}
      address={address}
      uri={avatarUri}
      graphApiKey={graphApiKey}
      generatedAvatarType={generatedAvatarType}
    />
  );
}
