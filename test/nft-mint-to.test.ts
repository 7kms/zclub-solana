import * as Web3 from '@solana/web3.js';

import { NFT, SPL, signAndEncodeTransaction, MetadataJson } from '../src';
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
  let mint_nft_address: Web3.PublicKey;
  let keypair1 = Web3.Keypair.generate();
  let keypair2 = Web3.Keypair.generate();
  console.log(`keypair1.publickey=${keypair1.publicKey.toBase58()}`);
  console.log(`keypair2.publickey=${keypair2.publicKey.toBase58()}`);
  jest.setTimeout(10000000);

  beforeAll(async () => {
    // nft can be only test on the public network. because localhost network has no metadata relevant programId
    connection = new Web3.Connection(Web3.clusterApiUrl('devnet'), 'confirmed');
    await requestAirdrop(connection, keypair1.publicKey, 1);
  });

  test('mint collection NFT', async () => {
    // console.log(keypair1.publicKey.toBase58());
    const metadata = generateMetadata(keypair1.publicKey.toBase58());
    collection_nft_address = await mintANFT(
      connection,
      keypair1,
      keypair1.publicKey,
      metadata,
    );

    const metadata2 = await NFT.getMetadata(connection, collection_nft_address);
    expect(metadata2.mint).toEqual(collection_nft_address.toBase58());

    expect(metadata2.data.name).toEqual(expect.stringMatching(metadata.name));
  });

  test('mint nft to keypair2', async () => {
    mint_nft_address = await mintANFT(
      connection,
      keypair1,
      keypair2.publicKey,
      generateMetadata(
        keypair1.publicKey.toBase58(),
        collection_nft_address.toBase58(),
      ),
    );
    expect(
      await SPL.getBalance(connection, mint_nft_address, keypair1.publicKey),
    ).toEqual(BigInt(0));
    const allInfo = await SPL.getAllTokenBalance(
      connection,
      keypair2.publicKey,
    );
    expect(allInfo[mint_nft_address.toBase58()]).toEqual(BigInt(1));
  });
});
