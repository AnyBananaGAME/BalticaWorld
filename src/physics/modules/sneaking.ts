import { InputData, type PlayerAuthInputPacket } from "@serenityjs/protocol";
import type { Physics } from "../physics";

export const SneakingModule = (p: PlayerAuthInputPacket, physics: Physics) => {
  if (!physics.lastControls.sneak && physics.controls.sneak) {
    physics.emit("startSneaking");
    p.inputData.setFlag(InputData.Sneaking, true);
    p.inputData.setFlag(InputData.StartSneaking, true);
    p.inputData.setFlag(InputData.SneakDown, true);
    p.inputData.setFlag(InputData.WantDown, true);
    p.inputData.setFlag(InputData.SneakPressedRaw, true);
    p.inputData.setFlag(InputData.SneakCurrentRaw, true);
  } else if (physics.controls.sneak && physics.lastControls.sneak) {
    p.inputData.setFlag(InputData.Sneaking, true);
    p.inputData.setFlag(InputData.SneakDown, true);
    p.inputData.setFlag(InputData.WantDown, true);
    p.inputData.setFlag(InputData.SneakCurrentRaw, true);
  } else if (physics.lastControls.sneak && !physics.controls.sneak) {
    physics.emit("stopSneaking");
    p.inputData.setFlag(InputData.StopSneaking, true);
    p.inputData.setFlag(InputData.SneakReleasedRaw, true);
  }
};
