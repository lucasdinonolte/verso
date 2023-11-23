export const hexToBuffer = (hexString) =>
  Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
    .buffer;
