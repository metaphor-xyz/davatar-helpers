import React, { useState, useEffect, CSSProperties } from 'react';

import Jazzicon from './Jazzicon';

export interface Props {
  size: number;
  uri?: string | null;
  address?: string | null;
  style?: CSSProperties;
  className?: string;
}

export default function Avatar({ uri, style, className, size, address }: Props) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!uri) {
      return;
    }

    const match = new RegExp(/([a-z]+):\/\/(.*)/).exec(uri);
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
    } else {
      setUrl(uri);
    }
  }, [uri]);

  if (!url) {
    if (address) {
      return <Jazzicon address={address} size={size} />;
    } else {
      return null;
    }
  }

  const cssStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: `${size}px`,
    ...(style || {}),
  };

  return <img alt="avatar" style={cssStyle} className={className} src={url} />;
}
