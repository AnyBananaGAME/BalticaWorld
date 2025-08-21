import { Player } from "./player";
// import { Client } from "baltica";
// import { World } from "./world/world";
import { Debugger } from "./tools/debugger";
// import { Physics } from "./physics/physics";

// const client = new Client({
//   address: "193.180.211.84",
// });

// const world = new World(client);
// const physics = new Physics(client, world);

// client.connect().then(() => {
//   physics.simulate();
// });

const player = new Player();
const debug = new Debugger(player.client, player.world, player.physics);
