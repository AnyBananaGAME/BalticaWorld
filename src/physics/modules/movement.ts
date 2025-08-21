import { InputData, type PlayerAuthInputPacket } from "@serenityjs/protocol";
import type { Physics } from "../physics";

export const MovementModule = (p: PlayerAuthInputPacket, physics: Physics) => {
  p.inputData.setFlag(InputData.Up, true);
};
