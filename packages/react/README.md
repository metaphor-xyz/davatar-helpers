# @davatar/react
This library provides components that make it easy to display decentralized avatars in Web3 applications.

## Install

```
npm install --save @davatar/react

- or -

yarn add @davatar/react
```

## Components

### Davatar
The `<Davatar />` component takes an Ethereum address, the desired avatar size, and an optional Web3 provider and displays the avatar attached to the ENS reverse record assigned to the address, if it exists. Otherwise, it displays the Jazzicon for the address.

```jsx
// ...
  return (
    <Davatar
      size={24}
      address='0x00000000000000000000000'
      provider={provider} // optional
      graphApiKey={apiKey} // optional
      generatedAvatarType='jazzicon' // optional, 'jazzicon' or 'blockies'
    />
  );
// ...
```

### Image
The `<Image />` component takes an image URI, avatar size, and an optional Ethereum address, and displays the image from the URI. If the URI is undefined or null, and the address is specified, it displays a Jazzicon. It supports the following URI types:

- HTTP(S)
- IPFS/IPNS
- Arweave (ar://), with support for `Origin` "mutability" tags
- Data URLs

```jsx
// ...
  return (
    <Image
      size={24}
      address='0x00000000000000000000000'
      uri='ar://0dbf9uwer8gw7efrg9bwe08r9v90ew8'
      graphApiKey={apiKey} // optional
      generatedAvatarType='jazzicon' // optional, 'jazzicon' or 'blockies'
    />
  );
// ...
```

## Develop

```bash
> npm install
> cd example
> npm install
> npm start
```

# License
This project is MIT licensed. The LICENSE file is available at the top of the repository.

