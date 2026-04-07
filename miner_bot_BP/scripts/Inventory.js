import { ItemStack } from "@minecraft/server";
export class Inventory {
    static addItemToEntity(entity) {
        const inventory = entity.getComponent("minecraft:inventory");
        if (inventory && inventory.container) {
            const items = ["minecraft:iron_ingot", "minecraft:raw_iron", "minecraft:coal", "minecraft:diamond"];
            const randomItem = items[Math.floor(Math.random() * items.length)];
            inventory.container.addItem(new ItemStack(randomItem, 1));
        }
    }
    static getInventory(entity) {
        return entity.getComponent("minecraft:inventory") || null;
    }
}
