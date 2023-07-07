import * as Web3 from '@solana/web3.js';

import {
  NFT,
  SPL,
  signAndEncodeTransaction,
  MetadataJson,
  Account,
} from '../src';
import { requestAirdrop } from './util';

const generateMetadata = (
  creatorAddress: string,
  collectionAddress?: string,
) => {
  return {
    name: collectionAddress
      ? `Activity Dev #${Math.floor(Math.random() * 100)}`
      : 'Activity Collection',
    symbol: '',
    uri: '',
    sellerFeeBasisPoints: 400,
    creators: [
      {
        share: 100,
        address: creatorAddress,
      },
    ],
    collection: collectionAddress
      ? { key: collectionAddress, verified: false }
      : undefined,
  } as MetadataJson;
};

const mintANFT = async (
  connection: Web3.Connection,
  payer: Web3.Keypair,
  destination: Web3.PublicKey,
  metaJSON: MetadataJson,
) => {
  const { encodedSignature, mint } = await NFT.mint(
    connection,
    payer,
    destination,
    metaJSON,
    Web3.Keypair.generate(),
  );
  await connection.confirmTransaction(
    await connection.sendEncodedTransaction(encodedSignature),
  );
  return mint;
};
describe('NFT TEST', () => {
  let connection: Web3.Connection;

  let collection_nft_address: Web3.PublicKey;
  let nft_address: Web3.PublicKey;

  let keypair1 = Web3.Keypair.generate();
  let keypair2 = Web3.Keypair.generate();

  // let keypair1 = Account.getKeypairFromBs58PrivateKey(
  //   '4P9nvL24ND8MPw6ANN4Hf4ifiaY3F5ntJvPwDhU2smNHEybEUtkSpUnmqbvqzF9fYMogRGQiFSnCGvwJi6KnXzaa',
  // );
  // let keypair2 = Account.getKeypairFromBs58PrivateKey(
  //   'HsRhMyz4e3tNN3MkgcVL9mvCNrTaP8yF3Ech9hZYJwmyuYBJJs69SLPXDDDCYYhayeDEH1cCZ9mQcRETRQfxDVT',
  // );
  console.log(`keypair1.publickey=${keypair1.publicKey.toBase58()}`);
  console.log(`keypair1.private=${Account.getBs58PrivateKey(keypair1)}`);
  console.log(`keypair2.publickey=${keypair2.publicKey.toBase58()}`);
  console.log(`keypair2.private=${Account.getBs58PrivateKey(keypair2)}`);
  jest.setTimeout(10000000);

  beforeAll(async () => {
    // nft can be only test on the public network. because localhost network has no metadata relevant programId
    connection = new Web3.Connection(Web3.clusterApiUrl('devnet'), 'confirmed');
    await requestAirdrop(connection, keypair1.publicKey, 1);
  });

  // describe('NFT without collection', () => {
  //   it('mint nft', async () => {
  //     // console.log(keypair1.publicKey.toBase58());
  //     const metadata = generateMetadata(keypair1.publicKey.toBase58());
  //     collection_nft_address = await mintANFT(
  //       connection,
  //       keypair1,
  //       keypair1.publicKey,
  //       metadata,
  //     );

  //     const metadata2 = await NFT.getMetadata(
  //       connection,
  //       collection_nft_address,
  //     );
  //     expect(metadata2.mint).toEqual(collection_nft_address.toBase58());

  //     expect(metadata2.data.name).toEqual(expect.stringMatching(metadata.name));
  //   });
  //   it('burn nft', async () => {
  //     const encodedTx = await NFT.burn(
  //       connection,
  //       keypair1,
  //       keypair1,
  //       collection_nft_address,
  //     );
  //     await connection.confirmTransaction(
  //       await connection.sendEncodedTransaction(encodedTx.encodedSignature),
  //     );
  //     console.log(`burned: ${encodedTx.encodedSignature}`);
  //   });
  //   // it('transfer nft', async () => {
  //   //   // console.log(keypair1.publicKey.toBase58());
  //   //   const encodedTx = await NFT.transfer(
  //   //     connection,
  //   //     keypair1,
  //   //     keypair1,
  //   //     collection_nft_address,
  //   //     keypair1.publicKey,
  //   //   );
  //   //   await connection.confirmTransaction(
  //   //     await connection.sendEncodedTransaction(encodedTx.encodedSignature),
  //   //   );
  //   //   console.log(`transferd: ${encodedTx.encodedSignature}`);
  //   // });
  // });

  describe('NFT with collection', () => {
    it('mint collection nft', async () => {
      // console.log(keypair1.publicKey.toBase58());
      const metadata = generateMetadata(keypair1.publicKey.toBase58());
      collection_nft_address = await mintANFT(
        connection,
        keypair1,
        keypair1.publicKey,
        metadata,
      );

      const metadata2 = await NFT.getMetadata(
        connection,
        collection_nft_address,
      );
      expect(metadata2.mint).toEqual(collection_nft_address.toBase58());

      expect(metadata2.data.name).toEqual(expect.stringMatching(metadata.name));
    });
    it('mint normal nft', async () => {
      // console.log(keypair1.publicKey.toBase58());
      const metadata = generateMetadata(
        keypair1.publicKey.toBase58(),
        collection_nft_address.toBase58(),
      );
      nft_address = await mintANFT(
        connection,
        keypair1,
        keypair1.publicKey,
        metadata,
      );

      const metadata2 = await NFT.getMetadata(connection, nft_address);
      expect(metadata2.mint).toEqual(nft_address.toBase58());

      expect(metadata2.data.name).toEqual(expect.stringMatching(metadata.name));
    });
    it('burn nft', async () => {
      const encodedTx = await NFT.burn(
        connection,
        keypair1,
        keypair1,
        nft_address,
      );
      await connection.confirmTransaction(
        await connection.sendEncodedTransaction(encodedTx.encodedSignature),
      );
      console.log(`burned: ${encodedTx.encodedSignature}`);
    });
  });
});
