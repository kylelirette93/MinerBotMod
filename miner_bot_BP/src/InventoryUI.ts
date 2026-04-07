import { Entity, Player, EntityInventoryComponent, Container } from "@minecraft/server";
import { ActionFormData, ActionFormResponse } from "@minecraft/server-ui";
import { Inventory } from "./Inventory.js";

export class InventoryUI {
        static showInventoryForm(player: Player, target: Entity) {
        const inventory = Inventory.getInventory(target);
    
        // Guard clause if inventory is null.
        if (!inventory || !inventory.container) {
            player.sendMessage("Miner bot storage not found..");
            return;
        }
    
        const container: Container = inventory.container;
        const inventoryForm = new ActionFormData()
            .title("Miner Bot Inventory")
            .body("Select an item you'd like to take.");
        
            // array to track number of slots.
            const itemSlots: number[] = [];
    
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
    
            inventoryForm.show(player).then((result: ActionFormResponse) => {
                // If the selection was invalid or canceled, do nothing.
                if (result.canceled || result.selection === undefined) return;
    
                const selectedSlot = itemSlots[result.selection];
                const itemToGive = container.getItem(selectedSlot);
    
                if (!itemToGive) {
                    player.sendMessage("That item is no longer there.");
                    this.showInventoryForm(player, target);
                    return;
                }
    
                else {
                    const playerInventory = player.getComponent("minecraft:inventory") as EntityInventoryComponent;
    
                    if (playerInventory && playerInventory.container) {
                        // Add item to player inventory.
                        playerInventory.container.addItem(itemToGive);
                        // Remove item from slot that was chosen.
                        container.setItem(selectedSlot, undefined);
                        player.sendMessage(`Recieved: ${splitId(itemToGive.typeId)}`);
                        // Refresh the UI.
                        this.showInventoryForm(player, target);
                    }
                }
            })
    }
}
// Helper function to split item ID and format for UI.
function splitId(string: String): String {
    const itemName = string.split(":")[1].replace(/_/g, " ");
    return itemName;
} 