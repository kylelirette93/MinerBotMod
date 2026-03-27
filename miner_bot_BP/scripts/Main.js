import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    const { player, target } = event;
    if (target.typeId === "miner_bot_bp:robot") {
        player.sendMessage("Interaction event fired");
        system.runTimeout(() => {
            player.sendMessage("Opening UI...");
            showActionForm(player);
        }, 3);
    }
});
function showActionForm(player) {
    const form = new ActionFormData()
        .title("Miner Bot")
        .body("What should I do for you?")
        .button("Find Resource")
        .button("Open Inventory")
        .button("Dismiss");
    form.show(player).then((result) => {
        if (result.canceled)
            return;
        player.sendMessage(`You selected: ${result.selection}`);
    }).catch((error) => {
        console.warn("UI Error: " + error);
    });
}
