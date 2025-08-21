import { Client } from "baltica";
import { World } from "./world/world";
import { Physics } from "./physics/physics";
import { Packet } from "@sanctumterra/raknet";
import { RespawnPacket, RespawnState, Vector3f } from "@serenityjs/protocol";

export class Player {
  public client: Client;
  public world: World;
  public physics: Physics;

  constructor() {
    this.client = new Client({
      address: "193.180.211.84",
    });
    this.world = new World(this);
    this.physics = new Physics(this);
    this.client.connect().then(() => {
      this.physics.simulate();
    });
    this.listen();
  }

  private listen() {
    let status = 0;

    this.client.on("NetworkStackLatencyPacket", (p) => {
      console.log(p);
    });
    this.client.on("RespawnPacket", (packet) => {
      // console.log(packet);
      const p = new RespawnPacket();
      p.runtimeEntityId = this.client.startGameData.runtimeEntityId;

      if (packet.state === RespawnState.ServerSearchingForSpawn) {
        p.position = new Vector3f(0, 0, 0);
        p.state = RespawnState.ClientReadyToSpawn;
        const des = p.serialize();
        this.client.send(des);
        p.position = packet.position;
        p.state = RespawnState.ClientReadyToSpawn;
        const des2 = p.serialize();
        this.client.send(des2);
      } else if ((packet.state = RespawnState.ServerReadyToSpawn)) {
        p.position = packet.position;
        p.state = RespawnState.ClientReadyToSpawn;
        const des2 = p.serialize();
        this.client.send(des2);
      }

      // if (
      //   packet.state === RespawnState.ServerSearchingForSpawn ||
      //   packet.state === RespawnState.ServerReadyToSpawn
      // ) {
      //   if (status === 1) {
      //     p.position = new Vector3f(0, 0, 0); // this.physics.position;
      //     p.state = RespawnState.ClientReadyToSpawn;
      //     status++;
      //   }
      //   if (status === 0) {
      //     p.position = packet.position.subtract(new Vector3f(0.5, 0.38, 0.5)); // this.physics.position;
      //     p.state = RespawnState.ServerReadyToSpawn;
      //     status--;
      //   }
      // } else {
      //   console.log(packet);
      // }
    });
  }
}
