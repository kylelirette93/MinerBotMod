"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@minecraft/server");
const server_ui_1 = require("@minecraft/server-ui");
function showActionForm(log, targetLocation) {
    const playerList = server_1.world.getPlayers();
    if (playerList.length >= 1) {
        const form = new server_ui_1.ActionFormData()
            .title("Test Title")
            .body("Body text here!")
            .button("btn 1")
            .button("btn 2")
            .button("btn 3")
            .button("btn 4")
            .button("btn 5");
        form.show(playerList[0]).then((result) => {
            if (result.canceled) {
                log("Player exited out of the dialog. Note that if the chat window is up, dialogs are automatically canceled.");
                return -1;
            }
            else {
                log("Your result was: " + result.selection);
            }
        });
    }
}
