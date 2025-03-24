function decodeTokenInfo(data: Buffer) {
  if (data.length < 90) {
    throw new Error("Invalid token info account data");
  }
  const name = data.slice(32, 64).toString("utf8").replace(/\0/g, "");
  const symbol = data.slice(64, 74).toString("utf8").replace(/\0/g, "");
  const priceLamports = data.readBigUInt64LE(74);
  const liquidityLamports = data.readBigUInt64LE(82);
  return {
    name,
    symbol,
    price: Number(priceLamports) / 1e9,
    liquidity: Number(liquidityLamports) / 1e9,
  };
}

export { decodeTokenInfo };
