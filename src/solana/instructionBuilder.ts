// solana/instructionBuilder.ts
import { TransactionInstruction, PublicKey } from "@solana/web3.js";
import config from "../config/config.js";
const PUMP_FUN_PROGRAM_ID: PublicKey = new PublicKey(config.pumpFunProgramId);
interface InstructionParams {
  user: PublicKey;
  tokenMint: PublicKey;
  tokenAccount: PublicKey;
  amount: number;
  slippage: number;
}

function createBuyInstruction({
  user,
  tokenMint,
  tokenAccount,
  amount,
  slippage,
}: InstructionParams): TransactionInstruction {
  const data: Buffer = Buffer.alloc(10);
  data.writeUInt8(0, 0); // opcode 0 = buy
  data.writeBigUInt64LE(BigInt(amount), 1);
  data.writeUInt8(slippage, 9);

  const keys = [
    { pubkey: user, isSigner: true, isWritable: true },
    { pubkey: tokenMint, isSigner: false, isWritable: false },
    { pubkey: tokenAccount, isSigner: false, isWritable: true },
  ];

  return new TransactionInstruction({
    keys,
    programId: PUMP_FUN_PROGRAM_ID,
    data,
  });
}

function createSellInstruction({
  user,
  tokenMint,
  tokenAccount,
  amount,
  slippage,
}: InstructionParams): TransactionInstruction {
  const data: Buffer = Buffer.alloc(10);
  data.writeUInt8(1, 0); // opcode 1 = sell
  data.writeBigUInt64LE(BigInt(amount), 1);
  data.writeUInt8(slippage, 9);

  const keys = [
    { pubkey: user, isSigner: true, isWritable: true },
    { pubkey: tokenMint, isSigner: false, isWritable: false },
    { pubkey: tokenAccount, isSigner: false, isWritable: true },
  ];

  return new TransactionInstruction({
    keys,
    programId: PUMP_FUN_PROGRAM_ID,
    data,
  });
}

export { createBuyInstruction, createSellInstruction };
