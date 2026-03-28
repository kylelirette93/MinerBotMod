export class AudioManager {
    static playSound(player, location, soundId) {
        player.dimension.playSound(soundId, location, { pitch: 0.8, volume: 1.0 });
    }
}
