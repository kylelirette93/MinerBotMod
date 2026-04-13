import { system, Player, Entity } from "@minecraft/server";
import { ActionFormData, ActionFormResponse } from "@minecraft/server-ui";
import { AudioManager } from "./AudioManager.js"; 
import { ParticleManager } from "./ParticleManager.js";
import { Inventory } from "./Inventory.js";
import { InventoryUI } from "./InventoryUI.js";

export class RobotActionUI {
    isFetching: boolean = false;
    showActionForm(player: Player, target: Entity): void {

    // Creates a form with options for the player to choose from.
    const form = new ActionFormData()
        .title("Miner Bot")
        .body("What should I do for you?")
        .button("Follow Me")
        .button("Find Something for Me")
        .button("Open Inventory")
        .button("Wait Here")
        .button("Dismiss");

    form.show(player).then((result: ActionFormResponse) => {
        if (result.canceled) return;
        
        if (result.selection === 0) {
            target.triggerEvent("my:follow_event");

            const movementComponent = target.getComponent("minecraft:movement");
            if (movementComponent) {
            movementComponent.setCurrentValue(0.2);
            }

            system.runTimeout(() => {
                const tameable = target.getComponent("minecraft:tameable");
            if (tameable) {
                tameable.tame(player);
                player.sendMessage("The robot is now following you.");
            }}, 3);      
        }
        else if (result.selection === 1) {
            target.setDynamicProperty("isFetching", true);
            player.sendMessage("Miner Bot: Okay! I'm gonna go find something for you! Be back in 30");

            // Capture data for particles and sound, that way if something changes with player it won't affect the teleportation.
            const capturedDimension = player.dimension;
            const capturedLocation = player.location;
            const capturedRotation = player.getRotation().y;
            
            const movementComponent = target.getComponent("minecraft:movement");
            if (movementComponent) 
            {
                movementComponent.setCurrentValue(0.2);
            }
            // Trigger event for robot to find item.
            target.triggerEvent("my:find_item_event");
            
            // Run a timeout while robot is fetching item.
            system.runTimeout(() => {
                if (!target || !target.isValid) {
                    // If target is not valid, stop execution.
                    target.setDynamicProperty("isFetching", false);
                    return;
                }
                
                // Set teleport location to previously captured location.
                const teleportLocation = {
                    x: capturedLocation.x + 2,
                    y: capturedLocation.y,
                    z: capturedLocation.z + 2
                };

                // Teleport the robot to player, with rotation facing player.
                target.teleport(teleportLocation, {
                    dimension: capturedDimension,
                    rotation: { x: 0, y: capturedRotation }
                });

                // Returns movement to normal and follows player after scouting is finished.
                target.triggerEvent("my:return_from_scouting");
                
                Inventory.addItemToEntity(target);

                // Indicate to player that robot has returned, with feedback.
                if (player && player.isValid) {
                    player.sendMessage("Miner Bot: I'm back! Check my inventory.");
                    AudioManager.playSound(player, capturedLocation, "random.levelup");
                    ParticleManager.playParticles(target, "minecraft:scute_particles", 5);
            }

            target.setDynamicProperty("isFetching", false);
        }, 600);
    }
        else if (result.selection === 2) {
            // Opens inventory UI.
            const movementComponent = target.getComponent("minecraft:movement");
            if (movementComponent) 
            {
                movementComponent.setCurrentValue(0.4);
            }
            InventoryUI.showInventoryForm(player, target);
        }
        else if (result.selection === 3) {
            // Triggers event that removes follow behavior.
            target.triggerEvent("my:stop_follow_event");
            const movementComponent = target.getComponent("minecraft:movement");
            if (movementComponent) 
            {
                movementComponent.setCurrentValue(0);
            }
            player.sendMessage("The robot is waiting.");
        }
        else if (result.selection === 4) {
            // Cancel selection and do nothing.
        }
        player.sendMessage(`You selected: ${result.selection}`);
    }).catch((error) => {
        console.warn("UI Error: " + error);
    });
}
}