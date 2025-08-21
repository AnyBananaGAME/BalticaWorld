import {
  BlockPosition,
  SignedBlockPosition,
  SubChunkPacket,
  SubChunkRequestPacket,
  SubChunkResult,
  UpdateBlockPacket,
  Vector3f,
  type LevelChunkPacket,
} from "@serenityjs/protocol";
import type { Client } from "baltica";
import { Chunk } from "./chunks/Chunk";
import { BlockPalette, BlockPermutation, SubChunk } from "@serenityjs/core";
import { BinaryStream } from "@serenityjs/binarystream";
import type { Player } from "../player";

export class World {
  public chunks: Map<string, Chunk>;

  constructor(public player: Player) {
    this.chunks = new Map();
    player.client.on("LevelChunkPacket", this.onLevelChunkPacket.bind(this));
    player.client.on("SubChunkPacket", this.onSubChunkPacket.bind(this));
    player.client.on("UpdateBlockPacket", this.onUpdateBlockPacket.bind(this));
  }

  public setChunk(chunk: Chunk) {
    this.chunks.set(`${chunk.x},${chunk.z}`, chunk);
  }

  public getBlock(
    position: Vector3f,
    layer: number = 0
  ): BlockPermutation | null {
    const blockPosition = BlockPosition.fromVector3f(position);
    const cx = blockPosition.x >> 4;
    const cz = blockPosition.z >> 4;
    const chunk = this.getChunk(cx, cz);
    if (!chunk) return null;
    const permutation = chunk.getPermutation(blockPosition, layer);
    return permutation;
  }

  public getChunk(x: number, z: number): Chunk | undefined {
    return this.chunks.get(`${x},${z}`);
  }

  public onUpdateBlockPacket(packet: UpdateBlockPacket) {
    const blockPosition = packet.position;
    const cx = blockPosition.x >> 4;
    const cz = blockPosition.z >> 4;
    const chunk = this.getChunk(cx, cz);
    if (!chunk) return;
    const permutation = BlockPermutation.permutations.get(
      packet.networkBlockId
    );
    if (!permutation) return;
    chunk.setPermutation(blockPosition, permutation);
  }

  public onSubChunkPacket(packet: SubChunkPacket) {
    if (packet.entries?.length > 0) {
      for (const entry of packet.entries) {
        const x = packet.origin.x + entry.offset.x;
        const y = packet.origin.y + entry.offset.y;
        const z = packet.origin.z + entry.offset.z;
        const cc = this.getChunk(x, z);
        if (entry.result === SubChunkResult.SUCCESS) {
          if (cc) {
            if (packet.cacheEnabled) {
              throw new Error("Cache not supported");
            } else {
              const subchunk = SubChunk.deserialize(
                new BinaryStream(entry.payload)
              );
              cc.subchunks.push(subchunk);
              // for (const layer of subchunk.layers) {
              //   for (const block of layer.palette) {
              //     console.log(BlockPermutation.permutations.get(block));
              //   }
              // }
              // console.log(subchunk);
            }
          }
        }
      }
    }
  }

  private onLevelChunkPacket(packet: LevelChunkPacket) {
    const chunk = Chunk.deserialize(
      packet.x,
      packet.z,
      packet.dimension,
      packet.data
    );
    this.setChunk(chunk);
    const maxSubChunkCount = packet.highestSubChunkCount;
    if (packet.subChunkCount < 0) {
      let offset = -4;
      const offsets: { x: number; y: number; z: number }[] = [];
      for (let i = offset; i < maxSubChunkCount; i++)
        offsets.push({ x: 0, z: 0, y: i });
      if (offsets.length > 0) {
        const request = new SubChunkRequestPacket();
        request.dimension = 0;
        request.position = new SignedBlockPosition(packet.x, 0, packet.z);
        request.offsets = offsets;
        const serialized = request.serialize();
        this.player.client.send(serialized);
      }
    }
  }
}
