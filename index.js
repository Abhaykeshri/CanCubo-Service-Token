require("dotenv").config();

const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");

const {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID,
} = require("@metaplex-foundation/mpl-token-metadata");

const fs = require("fs");

const connection = new Connection(
  process.env.RPC_URL,
  "confirmed"
);

const secretKey = JSON.parse(
  fs.readFileSync(process.env.KEYPAIR_PATH, "utf-8")
);

const wallet = Keypair.fromSecretKey(new Uint8Array(secretKey));

const mint = new PublicKey(process.env.MINT_ADDRESS);

(async () => {
  try {
    console.log("Attaching metadata...");

    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      PROGRAM_ID
    );

    const tx = new Transaction().add(
      createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataPDA,
          mint,
          mintAuthority: wallet.publicKey,
          payer: wallet.publicKey,
          updateAuthority: wallet.publicKey,
        },
        {
          createMetadataAccountArgsV3: {
            data: {
              name: "CanCubo Service Token",
              symbol: "CCST",
              uri: process.env.METADATA_URI,
              sellerFeeBasisPoints: 0,
              creators: null,
              collection: null,
              uses: null,
            },
            isMutable: true,
            collectionDetails: null,
          },
        }
      )
    );

    const sig = await sendAndConfirmTransaction(
      connection,
      tx,
      [wallet]
    );

    console.log("✅ Metadata attached!");
    console.log("TX:", sig);
  } catch (err) {
    console.error("❌ ERROR:", err);
  }
})();
