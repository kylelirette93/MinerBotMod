import { world, system, Player, Vector3 } from "@minecraft/server";

export class AudioManager {
    static playSound(player: Player, location: Vector3, soundId: string) {
        player.dimension.playSound(soundId, location, { pitch: 0.8, volume: 1.0 });
    }
}