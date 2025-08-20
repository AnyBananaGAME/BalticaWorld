import { LevelChunkPacket } from "@serenityjs/protocol";
import * as fs from "node:fs";
import { Chunk } from "./Chunk";
const buffer = Buffer.from(fs.readFileSync("chunk.bin"));

const packet = new LevelChunkPacket(buffer).deserialize();
const chunk = Chunk.deserialize(
  packet.x,
  packet.z,
  packet.dimension,
  packet.data
);

console.log(chunk);
