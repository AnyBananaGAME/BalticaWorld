import { InputData } from "@serenityjs/protocol";
import { Bridge } from "baltica";
import { InputDataLogger, logInputData } from "./utils/input-data-logger.js";

const bridge = new Bridge({
  destination: {
    address: "",
    port: 19132,
  },
});

bridge.start();

// Log all available InputData flags when the proxy starts
console.log("=== InputData Proxy Started ===");
logInputData.allFlags();

// Store previous input data for change detection
let previousInputData: any = null;

bridge.on("connect", (player) => {
  console.log("Player connected - InputData logging enabled");

  player.on("serverBound-PlayerAuthInputPacket", (packet) => {
    const inputData = packet.packet.inputData;

    // Get currently active flags
    const activeFlags = InputDataLogger.getActiveFlags(inputData);

    // Only log when there are active flags (to reduce spam)
    if (activeFlags.length > 0) {
      console.log("=".repeat(50));
      console.log(`Tick: ${packet.packet.inputTick}`);

      // Option 1: Log only active flags (compact)
      logInputData.active(inputData, "  ");

      // Option 2: Log changes from previous state
      logInputData.changes(previousInputData, inputData, "  ");

      // Option 3: Log summary
      logInputData.summary(inputData, "  ");

      // Uncomment below for more detailed logging:

      // Option 4: Log all flags with their states
      // logInputData.all(inputData, "  ");

      // Option 5: Create detailed report
      // console.log(InputDataLogger.createReport(inputData));

      console.log("");
    }

    // Store for next comparison
    previousInputData = inputData;
  });

  player.on("clientBound-RespawnPacket", (p) => {
    console.log(p);
  });
  player.on("serverBound-RespawnPacket", (p) => {
    console.log(p);
  });
});
