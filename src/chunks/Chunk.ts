import { BinaryStream, Uint64 } from "@serenityjs/binarystream";
import { Chunk as SerenityChunk, SubChunk } from "@serenityjs/core";
import type { DimensionType } from "@serenityjs/protocol";

export class Chunk extends SerenityChunk {
  static override deserialize(
    x: number,
    z: number,
    dimension: DimensionType,
    payload: Buffer,
    nbt = false
  ): Chunk {
    const subchunks: Array<SubChunk> = [];
    const stream = new BinaryStream(payload);

    for (let index = 0; index < Chunk.MAX_SUB_CHUNKS; ++index) {
      const header = stream.buffer[stream.offset];

      if (header !== 8 && header !== 9) break;
      subchunks[index] = SubChunk.deserialize(stream, nbt);
    }

    const biomes = [];
    for (let i = -4; stream.buffer[stream.offset + 1]; i++) {
      let last: Array<number> | null = null;

      if (stream.buffer[stream.offset + 1] === 0xff) {
        stream.readUint8();
      } else {
        const T = Chunk.readBiome(stream);
        last = T;
        biomes.push(T);
      }
    }
    const debug = false;
    if (debug)
      console.log(
        `Remaining Buffer after reading chunk ${
          stream.buffer.length - stream.offset
        }`
      );
    return new Chunk(x, z, dimension, subchunks);
  }

  static readBiome(stream: BinaryStream): Array<number> {
    const palette: Array<number> = [];

    const type = stream.readUint8();
    const usesNetworkHashes = type & 1;
    // console.log(usesNetworkHashes);
    if (usesNetworkHashes !== 1) throw new Error("Invalid biome palette type");
    const bitsPerBlock = type >> 1;

    if (bitsPerBlock === 0) {
      const value = stream.readVarInt() >> 1;
      palette.push(value);
      return palette;
    }

    const storage = Chunk.readPalette(stream, bitsPerBlock);
    // console.log(storage);

    const biomePaletteLength = stream.readVarInt() >> 1;
    for (let i = 0; i < biomePaletteLength; i++) {
      const value = stream.readVarInt() >> 1;
      palette.push(value);
    }
    return palette;
  }

  static readPalette(stream: BinaryStream, bitsPerBlock: number): Buffer {
    const wByteSize = 4;
    const wBitSize = wByteSize * 8;
    const size = 4096; // 4 GB.

    const bpWorld = Math.floor(wBitSize / bitsPerBlock);
    const wC = Math.ceil(size / bpWorld);

    return stream.read(wC * wByteSize);
  }
}
