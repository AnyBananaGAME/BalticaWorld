import { Logger } from "@sanctumterra/raknet";
import { TextPacket, TextPacketType, Vector3f } from "@serenityjs/protocol";
import type { Client } from "baltica";
import fs from "fs";
import type { World } from "../world/world";
import type { Physics } from "../physics/physics";
import { BlockIdentifier, BlockPermutation } from "@serenityjs/core";

export class Debugger {
  constructor(
    public client: Client,
    public world: World,
    public physics: Physics
  ) {
    this.client.on("TextPacket", this.onTextPacket.bind(this));
    this.client.on("StartGamePacket", (packet) => {
      console.log(packet.playerPosition);
    });

    let old = new Vector3f(0, 0, 0);
    this.client.on("MovePlayerPacket", (packet) => {
      if (
        old.x !== packet.position.x ||
        old.y !== packet.position.y ||
        old.z !== packet.position.z
      ) {
        // this.physics.lookAt(packet.position);
      }
      old = packet.position;
    });

    this.client.on("UpdateBlockPacket", (packet) => {
      if (
        BlockPermutation.permutations.get(packet.networkBlockId)?.type
          .identifier === BlockIdentifier.OakLog
      ) {
        this.physics.lookAt(
          new Vector3f(packet.position.x, packet.position.y, packet.position.z)
        );
      }
    });
  }

  private onTextPacket(packet: TextPacket) {
    if (packet.needsTranslation) {
      packet.buffer = Buffer.from([0]);
      fs.writeFileSync(
        process.cwd() + "/translations/" + Date.now() + ".json",
        JSON.stringify(packet)
      );
      return Logger.error("Transation is not implemented.", packet);
    }
    Logger.chat(packet.message);

    if (packet.source === this.client.username) return;
    if (packet.message.includes("sneak")) {
      this.sendMessage("Sneaking ig");
      this.physics.controls.sneak = !this.physics.controls.sneak;
      return;
    }

    const x = packet.message.split(" ")[0] as string;
    const y = packet.message.split(" ")[1] as string;
    const z = packet.message.split(" ")[2] as string;

    const parsedX = parseInt(x);
    const parsedY = parseInt(y);
    const parsedZ = parseInt(z);

    if (isNaN(parsedX) || isNaN(parsedY) || isNaN(parsedZ)) {
      Logger.error("Invalid coordinates", { x, y, z });
      return;
    }

    const block = this.world.getBlock(
      new Vector3f(parseInt(x), parseInt(y), parseInt(z))
    );
    if (!block) return this.sendMessage("Block not found");
    this.sendMessage(`Block at ${x} ${y} ${z} is ${block.type.identifier}`);
    Logger.info(`Parsed coordinates: ${parsedX}, ${parsedY}, ${parsedZ}`);
  }

  public sendMessage(message: string) {
    const text = new TextPacket();
    text.message = message;
    text.needsTranslation = false;
    text.parameters = [];
    text.platformChatId = "";
    text.source = this.client.username;
    text.type = TextPacketType.Chat;
    text.xuid = this.client.profile.xuid.toString();
    text.filtered = "";
    this.client.send(text.serialize());
  }
}
