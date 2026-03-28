import { world, system, Entity, Dimension, Vector3, MolangVariableMap } from "@minecraft/server";

export class ParticleManager {
    static playParticles(entity: Entity, particleId: String, distance: number = 1.0): void {
        // Position the particle system slightly in front of entity based on rotation.
        const viewVector = entity.getViewDirection();
        const loc = entity.location;

        const spawnPos: Vector3 = {
            x: loc.x + (viewVector.x * distance),
            y: loc.y + (viewVector.y * distance) + 1.2, // Offset to play particle near head of robot.
            z: loc.z + (viewVector.z * distance)
        }
        entity.dimension.spawnParticle(
            particleId.toString(),
            spawnPos,
            new MolangVariableMap()
            );
    }
}