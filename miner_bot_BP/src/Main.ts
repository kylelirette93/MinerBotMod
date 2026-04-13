import { world, system } from "@minecraft/server";
import { RobotActionUI } from "./RobotActionUI.js";

world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    const { player, target } = event;

    if (target.typeId === "miner_bot_bp:robot") {
        if (target.getDynamicProperty("isFetching") === true) {
            player.sendMessage("Miner Bot: I'm busy right now! Be back soon.");
            return;
        }

        system.runTimeout(() => {
            player.sendMessage("Opening UI...");
            const robotActionUI = new RobotActionUI();
            robotActionUI.showActionForm(player, target);
        }, 3);
    }
});

// When world is reloaded, reset the fetching property for all robots so its not stuck 
// in a wierd state.
world.afterEvents.entityLoad.subscribe((event) => {
    const entity = event.entity;
    if (entity.typeId === "miner_bot_bp:robot") {
        entity.setDynamicProperty("isFetching", false);
        
    }
})