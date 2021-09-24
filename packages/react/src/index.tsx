import { Web3Provider, getDefaultProvider } from '@ethersproject/providers';
import React, { useEffect, useState, ReactChild } from 'react';

import Image from './Image';

export { default as Image } from './Image';

export interface DavatarProps {
  size: number;
  address: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider?: any;
  graphApiKey?: string;
  generatedAvatarType?: 'jazzicon' | 'blockies';
  defaultComponent?: ReactChild | ReactChild[];
}

export default function Davatar({
  size,
  address,
  provider,
  graphApiKey,
  generatedAvatarType,
  defaultComponent,
}: DavatarProps) {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    const eth = provider ? new Web3Provider(provider) : getDefaultProvider();
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
      defaultComponent={defaultComponent}
    />
  );
}
