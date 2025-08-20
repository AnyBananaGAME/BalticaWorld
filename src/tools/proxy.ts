import { Bridge } from "baltica";

const bridge = new Bridge({
  destination: {
    address: "193.180.211.84",
    port: 19132,
  },
});

bridge.start();
