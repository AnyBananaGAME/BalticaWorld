import { Emitter, type Client } from "baltica";
import type { World } from "../world/world";
import {
  ClientPredictedVehicle,
  InputData,
  InputMode,
  InputTransaction,
  InteractionMode,
  PlayerActionPacket,
  PlayerAuthInputData,
  PlayerAuthInputPacket,
  PlayerAuthItemStackRequest,
  PlayerBlockActions,
  PlayMode,
  Rotation,
  Vector2f,
  Vector3f,
} from "@serenityjs/protocol";
import { MovementModule, SneakingModule } from "./modules";
import type { Player } from "../player";

interface PhysicsProps {
  packet: PlayerAuthInputPacket;
  startSneaking: void;
  stopSneaking: void;
}

export type Controls = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sneak: boolean;
};

export class Physics extends Emitter<PhysicsProps> {
  public client: Client;
  public world: World;

  private walkSpeed: number = 0.1;
  private playerHeight: number = 1.62001037597656;
  private interval: NodeJS.Timeout | null = null;
  public rotation: Rotation = new Rotation(0, 0, 0);
  public position: Vector3f = new Vector3f(0, 0, 0);
  public motion: Vector2f = new Vector2f(0, 0);
  public inputData: PlayerAuthInputData = new PlayerAuthInputData(0n);
  public interactRotation: Vector2f = new Vector2f(0, 0);
  public tick: bigint = 0n;
  public delta: Vector3f = new Vector3f(0, 0, 0);

  public inputTransaction: InputTransaction | null = null;
  public itemStackRequest: PlayerAuthItemStackRequest | null = null;
  public blockActions: PlayerBlockActions | null = null;
  public predictedVehicle: ClientPredictedVehicle | null = null;

  public analogueMotion: Vector2f = new Vector2f(0, 0);
  public cameraOrientation: Vector3f = new Vector3f(0, 0, 0);
  public rawMoveVector: Vector2f = new Vector2f(0, 0);

  public controls: Controls = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sneak: false,
  };
  public lastControls: Controls = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sneak: false,
  };
  constructor(public player: Player) {
    super();
    this.client = player.client;
    this.world = player.world;

    this.client.on("StartGamePacket", (packet) => {
      this.rotation.headYaw = packet.yaw;
      this.rotation.pitch = packet.pitch;
      this.rotation.yaw = packet.yaw;
      this.position = packet.playerPosition;
    });

    this.client.on("UpdateAbilitiesPacket", (packet) => {
      if (packet.abilities.length > 0) {
        const ability = packet.abilities[0]!;
        this.walkSpeed = ability.walkSpeed ?? 0.1;
      }
    });

    this.client.on("CorrectPlayerMovePredictionPacket", (packet) => {
      console.log(
        `Should be ${packet.position.x}:${packet.position.y}:${packet.position.z}: But we have ${this.position.x}:${this.position.y}:${this.position.z}`
      );
      this.delta = packet.positionDelta;
      this.position = packet.position;
    });

    this.client.on("SetActorMotionPacket", (packet) => {
      if (packet.runtimeId !== this.client.startGameData.runtimeEntityId)
        return;
      this.motion = packet.motion;
      console.log(packet);
      // this.rotation.headYaw = packet.headYaw;
    });
  }

  public simulate() {
    this.interval = setInterval(() => {
      this.inputData.setFlag(InputData.BlockBreakingDelayEnabled, true);
      this.inputData.setFlag(InputData.VerticalCollision, true);

      const p = new PlayerAuthInputPacket();
      p.rotation = new Vector2f(this.rotation.pitch, this.rotation.yaw);
      p.position = this.position;
      p.motion = this.motion;
      p.headYaw = this.rotation.headYaw;
      p.inputData = new PlayerAuthInputData(this.inputData.flags);
      p.inputMode = InputMode.Touch;
      p.playMode = PlayMode.Normal;
      p.interactionMode = InteractionMode.Touch;
      p.interactRotation = this.interactRotation;
      p.inputTick = this.tick;
      p.positionDelta = this.delta;
      p.inputTransaction = this.inputTransaction;
      p.blockActions = this.blockActions;
      p.predictedVehicle = this.predictedVehicle;
      p.analogueMotion = this.analogueMotion;
      p.cameraOrientation = this.cameraOrientation;
      p.rawMoveVector = this.rawMoveVector;

      SneakingModule(p, this);
      MovementModule(p, this);

      this.lastControls = { ...this.controls };
      this.emit("packet", p);
      const serialized = p.serialize();
      this.client.send(serialized);
      this.tick++;
    }, 50);
  }

  public lookAt(position: Vector3f, aimWithHead: boolean = true) {
    const offset = new Vector3f(
      position.x - this.position.x,
      position.y - this.position.y,
      position.z - this.position.z
    );

    const tanOutput = 90 - Math.atan(offset.x / offset.z) * (180 / Math.PI);
    let thetaOffset = 270;
    if (offset.z < 0) {
      thetaOffset = 90;
    }
    const yaw = thetaOffset + tanOutput;
    if (aimWithHead) {
      const bDiff = Math.sqrt(offset.x * offset.x + offset.z * offset.z);
      const dy = this.position.y - position.y;
      this.rotation.pitch = Math.atan(dy / bDiff) * (180 / Math.PI);
    }
    this.rotation.yaw = yaw;
    this.rotation.headYaw = yaw;
  }
}
