import { world, system } from "@minecraft/server";
import { RobotActionUI } from "./RobotActionUI.js";

world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    const { player, target } = event;

    if (target.typeId === "miner_bot_bp:robot") {
        if (RobotActionUI.isFetching) {
            player.sendMessage("Miner Bot: I'm busy right now! Be back soon.");
            return;
        }

        system.runTimeout(() => {
            player.sendMessage("Opening UI...");
            RobotActionUI.showActionForm(player, target);
        }, 3);
    }
});