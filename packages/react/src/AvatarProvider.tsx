import { getDefaultProvider, BaseProvider } from '@ethersproject/providers';
import React, { useContext, useMemo } from 'react';

import { JsonRpcMulticallProvider } from './JsonRpcMulticallProvider';

export type AvatarContextType = {
  /**
   * An ethers provider
   */
  provider: BaseProvider;
};

const AvatarContext = React.createContext<AvatarContextType>(null!);

export type AvatarProviderProps = {
  /**
   * An ethers provider
   */
  provider?: BaseProvider;
  /**
   * If true, ethers lookups will be batched in multicalls
   * for more efficient RPC calls
   */
  batchLookups?: boolean;
} & React.PropsWithChildren<unknown>;

export function AvatarProvider({ provider, batchLookups, children }: AvatarProviderProps) {
  const finalProvider = useMemo(
    () => (provider && batchLookups ? new JsonRpcMulticallProvider(provider) : provider || getDefaultProvider()),
    [batchLookups, provider]
  );

  return <AvatarContext.Provider value={{ provider: finalProvider }}>{children}</AvatarContext.Provider>;
}

export function useAvatarEthersProvider() {
  const avatarContext = useContext(AvatarContext);

  if (!avatarContext) {
    return getDefaultProvider();
  }

  return avatarContext.provider;
}
