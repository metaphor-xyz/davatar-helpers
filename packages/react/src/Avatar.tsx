import { Web3Provider, getDefaultProvider, BaseProvider } from '@ethersproject/providers';
import React, { useEffect, useState, ReactChild, CSSProperties } from 'react';

import Image from './Image';

export type AvatarProps = {
  /**
   * The size of the avatar in pixels.
   */
  size: number;
  /**
   * An Ethereum address
   */
  address: string;
  /**
   * An ethers or web3.js provider
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider?: any;
  /**
   * An API key for The Graph
   *
   * @deprecated
   */
  graphApiKey?: string;
  /**
   * The kind of generated avatar to display if no avatar
   */
  generatedAvatarType?: 'jazzicon' | 'blockies';
  /**
   * A default component to render if there is no avatar
   */
  defaultComponent?: ReactChild | ReactChild[];
  /**
   * Custom CSS styles to apply to the avatar <img /> tag
   */
  style?: CSSProperties;
};

export default function Avatar({ size, address, provider, generatedAvatarType, defaultComponent, style }: AvatarProps) {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [ethersProvider, setEthersProvider] = useState<BaseProvider | null>(null);

  useEffect(() => {
    let eth = getDefaultProvider();
    let chainId = null;
    let isEthers = false;

    // carlos: Only use the provided provider if ENS is actually on that chain
    if (provider) {
      if (provider.currentProvider?.chainId) {
        chainId = parseInt(provider.currentProvider.chainId);
      } else if (provider.network?.chainId) {
        isEthers = true;
        chainId = provider.network.chainId;
      }

      if ([1, 3, 4, 5].includes(chainId)) {
        eth = isEthers ? (provider as BaseProvider) : new Web3Provider(provider.currentProvider);
      } else {
        chainId = 1;
      }
    }

    setEthersProvider(eth);

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
      provider={ethersProvider}
      generatedAvatarType={generatedAvatarType}
      defaultComponent={defaultComponent}
      style={style}
    />
  );
}
