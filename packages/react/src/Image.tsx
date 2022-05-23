import { Contract } from '@ethersproject/contracts';
import { BaseProvider } from '@ethersproject/providers';
import BigNumber from 'bn.js';
import React, { useState, useEffect, useCallback, useMemo, CSSProperties, ReactChild } from 'react';

import { useAvatarEthersProvider } from './AvatarProvider';
import Blockies from './Blockies';
import Jazzicon from './Jazzicon';
import { storeCachedURI, getCachedUrl } from './cache';
import { getGatewayUrl } from './resolve';

const erc721Abi = [
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 _tokenId) external view returns (string)',
];

const erc1155Abi = [
  'function balanceOf(address _owner, uint256 _id) view returns (uint256)',
  'function uri(uint256 _id) view returns (string)',
];

export type ImageProps = {
  /**
   * The size of the avatar in pixels.
   */
  size: number;
  /**
   * The URI of the image to be resolved
   */
  uri?: string | null;
  /**
   * An Ethereum address
   */
  address?: string | null;
  /**
   * Custom CSS styles to apply to the <img /> tag
   */
  style?: CSSProperties;
  className?: string;
  /**
   * An API key for The Graph
   *
   * @deprecated
   */
  graphApiKey?: string;
  /**
   * An ethers provider
   */
  provider?: BaseProvider | null;
  /**
   * The kind of generated avatar to display if image isn't loaded
   */
  generatedAvatarType?: 'jazzicon' | 'blockies';
  /**
   * A default component to render if image isn't loaded
   */
  defaultComponent?: ReactChild | ReactChild[];
};

export default function Image({
  uri,
  style,
  className,
  size,
  address,
  provider,
  generatedAvatarType,
  defaultComponent,
}: ImageProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const avatarEthersProvider = useAvatarEthersProvider();
  const ethersProvider = useMemo(() => provider || avatarEthersProvider, [provider, avatarEthersProvider]);

  useEffect(() => {
    if (!uri && address) {
      const cachedUrl = getCachedUrl(address.toLowerCase());
      if (cachedUrl) {
        setUrl(cachedUrl);
      }
    }

    if (!uri) {
      return;
    }

    if (uri) {
      const cachedUrl = getCachedUrl(uri);
      if (cachedUrl) {
        setUrl(cachedUrl);
        return;
      }
    }

    if (uri && address) {
      const cachedUrl = getCachedUrl(`${address.toLowerCase()}/${uri}`);
      if (cachedUrl) {
        setUrl(cachedUrl);
        return;
      }
    }

    const match = new RegExp(/([a-z]+):\/\/(.*)/).exec(uri);
    const match721 = new RegExp(/eip155:1\/erc721:(\w+)\/(\w+)/).exec(uri);
    const match1155 = new RegExp(/eip155:1\/erc1155:(\w+)\/(\w+)/).exec(uri);

    if (match && match.length === 3) {
      const protocol = match[1];
      const id = match[2];

      switch (protocol) {
        case 'ar': {
          const baseUrl = 'https://arweave.net';

          fetch(`${baseUrl}/graphql`, {
            method: 'POST',
            headers: {
              'content-type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
              query: `
              {
                transactions(ids: ["${id}"]) {
                  edges {
                    node {
                      id
                      owner {
                        address
                      }
                    }
                  }
                }
              }
              `,
            }),
          })
            .then(d => d.json())
            .then(res => res.data.transactions.edges[0].node)
            .then(tx =>
              fetch(`${baseUrl}/graphql`, {
                method: 'POST',
                headers: {
                  'content-type': 'application/json;charset=UTF-8',
                },
                body: JSON.stringify({
                  query: `
                {
                  transactions(owners: ["${tx.owner.address}"], tags: { name: "Origin", values: ["${tx.id}"] }, sort: HEIGHT_DESC) {
                    edges {
                      node {
                        id
                      }
                    }
                  }
                }
                `,
                }),
              })
            )
            .then(res => res.json())
            .then(res => {
              if (res.data && res.data.transactions.edges.length > 0) {
                setUrl(`${baseUrl}/${res.data.transactions.edges[0].node.id}`);
              } else {
                setUrl(`${baseUrl}/${id}`);
              }
            })
            .catch(e => console.error(e)); // eslint-disable-line

          break;
        }
        case 'ipfs':
          setUrl(`https://gateway.ipfs.io/ipfs/${id}`);
          break;
        case 'ipns':
          setUrl(`https://gateway.ipfs.io/ipns/${id}`);
          break;
        case 'http':
        case 'https':
          setUrl(uri);
          break;
        default:
          setUrl(uri);
          break;
      }
    } else if (match721 && match721.length === 3) {
      const contractId = match721[1].toLowerCase();
      const tokenId = match721[2];
      const normalizedAddress = address?.toLowerCase();

      const erc721Contract = new Contract(contractId, erc721Abi, ethersProvider);

      (async () => {
        if (normalizedAddress) {
          const owner = await erc721Contract.ownerOf(tokenId);

          if (!owner || owner.toLowerCase() !== normalizedAddress) {
            throw new Error('ERC721 token not owned by address');
          }
        }

        const tokenURI = await erc721Contract.tokenURI(tokenId);
        const res = await fetch(getGatewayUrl(tokenURI, new BigNumber(tokenId).toString(16)));
        const data = (await res.json()) as { image: string };
        setUrl(getGatewayUrl(data.image));
      })();
    } else if (match1155 && match1155.length === 3) {
      const contractId = match1155[1].toLowerCase();
      const tokenId = match1155[2];

      const erc1155Contract = new Contract(contractId, erc1155Abi, ethersProvider);

      (async () => {
        if (address) {
          const balance: BigNumber = await erc1155Contract.balanceOf(address, tokenId);
          if (balance.isZero()) {
            throw new Error('ERC1155 token not owned by address');
          }
        }

        const tokenURI = await erc1155Contract.uri(tokenId);
        const res = await fetch(getGatewayUrl(tokenURI, new BigNumber(tokenId).toString(16)));
        const data = (await res.json()) as { image: string };
        setUrl(getGatewayUrl(data.image));
      })();
    } else {
      setUrl(getGatewayUrl(uri));
    }
  }, [uri, address, ethersProvider]);

  const onLoad = useCallback(() => {
    setLoaded(true);

    if (address && url) {
      storeCachedURI(address, url);
    }
  }, [address, url]);

  let avatarImg = null;

  const cssStyle = {
    display: loaded ? undefined : 'none',
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: `${size}px`,
    ...(style || {}),
  };

  if (url) {
    avatarImg = <img alt="avatar" style={cssStyle} className={className} src={url} onLoad={onLoad} />;
  }

  const defaultAvatar =
    (!url || !loaded) &&
    address &&
    (defaultComponent ||
      (generatedAvatarType === 'blockies' ? (
        <Blockies address={address} size={size} />
      ) : (
        <Jazzicon address={address} size={size} />
      )));

  return (
    <>
      {defaultAvatar}
      {avatarImg}
    </>
  );
}
