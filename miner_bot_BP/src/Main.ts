import { world, system, Player, Entity, EntityComponent } from "@minecraft/server";
import { ActionFormData, ActionFormResponse } from "@minecraft/server-ui";

world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    const { player, target } = event;

    if (target.typeId === "miner_bot_bp:robot") {
        player.sendMessage("Interaction event fired");

        system.runTimeout(() => {
            player.sendMessage("Opening UI...");
            showActionForm(player, target);
        }, 3);
    }
});

function showActionForm(player: Player, target: Entity): void {
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

            const tameable = target.getComponent("minecraft:tameable");
            if (tameable) {
                tameable.tame(player);
                player.sendMessage("The robot is now following you.");
            }
        }
        else if (result.selection === 1) {
            
        }
        else if (result.selection === 2) {

        }
        else if (result.selection === 3) {
            target.triggerEvent("my:stop_follow_event");
            player.sendMessage("The robot is waiting.");
        }
        else if (result.selection === 4) {
            
        }
        player.sendMessage(`You selected: ${result.selection}`);
    }).catch((error) => {
        console.warn("UI Error: " + error);
    });
}