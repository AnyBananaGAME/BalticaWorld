import { Client } from "baltica";
import { World } from "./world";
import { Debugger } from "./tools/debugger";
import { Physics } from "./physics/physics";

const client = new Client({
  address: "193.180.211.84",
});

const world = new World(client);
const physics = new Physics(client, world);

const debug = new Debugger(client, world, physics);

client.connect().then(() => {
  physics.simulate();
});
