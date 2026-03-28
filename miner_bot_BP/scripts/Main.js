import { world, system, ItemStack, MolangVariableMap } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { AudioManager } from "./AudioManager.js";
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
function showActionForm(player, target) {
    const form = new ActionFormData()
        .title("Miner Bot")
        .body("What should I do for you?")
        .button("Follow Me")
        .button("Find Something for Me")
        .button("Open Inventory")
        .button("Wait Here")
        .button("Dismiss");
    form.show(player).then((result) => {
        if (result.canceled)
            return;
        if (result.selection === 0) {
            target.triggerEvent("my:follow_event");
            const tameable = target.getComponent("minecraft:tameable");
            if (tameable) {
                tameable.tame(player);
                player.sendMessage("The robot is now following you.");
            }
        }
        else if (result.selection === 1) {
            player.sendMessage("Miner Bot: Okay! I'm gonna go find something for you! Be back in 30");
            target.triggerEvent("my:find_item_event");
            AudioManager.playSound(player, player.location, "random.orb");
            system.runTimeout(() => {
                target.teleport(player.location, { dimension: player.dimension });
                const inventory = target.getComponent("minecraft:inventory");
                // Grab random item from target's inventory and give it to player.
                if (inventory && inventory.container) {
                    const items = ["minecraft:iron_ingot", "minecraft:raw_iron", "minecraft:coal", "minecraft:diamond"];
                    const randomItem = items[Math.floor(Math.random() * items.length)];
                    inventory.container.addItem(new ItemStack(randomItem, 1));
                }
                player.sendMessage("Miner Bot: I'm back! Check my inventory.");
                player.dimension.spawnParticle("minecraft:sparker_particle", target.location, new MolangVariableMap());
            }, 600);
        }
        else if (result.selection === 2) {
            showInventoryForm(player, target);
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
function showInventoryForm(player, target) {
    const inventory = target.getComponent("minecraft:inventory");
    // Guard clause if inventory is null.
    if (!inventory || !inventory.container) {
        player.sendMessage("Miner bot storage not found..");
        return;
    }
    const container = inventory.container;
    const inventoryForm = new ActionFormData()
        .title("Miner Bot Inventory")
        .body("Select an item you'd like to take.");
    // array to track number of slots.
    const itemSlots = [];
    // Get item name to display in form.
    for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);
        if (item) {
            const itemName = splitId(item.typeId);
            inventoryForm.button(`${itemName} (x${item.amount})`);
            itemSlots.push(i);
        }
    }
    // If the inventory is empty, the robot will tell the player.
    if (itemSlots.length === 0) {
        player.sendMessage("I'm empty handed right now");
        return;
    }
    inventoryForm.show(player).then((result) => {
        // If the selection was invalid or canceled, do nothing.
        if (result.canceled || result.selection === undefined)
            return;
        const selectedSlot = itemSlots[result.selection];
        const itemToGive = container.getItem(selectedSlot);
        if (itemToGive) {
            const playerInventory = player.getComponent("minecraft:inventory");
            if (playerInventory && playerInventory.container) {
                // Add item to player inventory.
                playerInventory.container.addItem(itemToGive);
                // Remove item from slot that was chosen.
                container.setItem(selectedSlot, undefined);
                player.sendMessage(`Recieved: ${splitId(itemToGive.typeId)}`);
                // Refresh the UI.
                showInventoryForm(player, target);
            }
        }
    });
}
function splitId(string) {
    const itemName = string.split(":")[1].replace(/_/g, " ");
    return itemName;
}
