import { logger } from "@vendetta";
import { registerCommand } from "@vendetta/commands";
import { findByProps } from "@vendetta/metro";

enum ApplicationCommandOptionType {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP,
    STRING,
    INTEGER,
    BOOLEAN,
    USER6,
    CHANNEL,
    ROLE,
    MENTIONABLE,
    NUMBER,
    ATTACHMENT
}

export default {
    onLoad: () => {
        let commands = [];
        const ClydeUtils = findByProps("sendBotMessage");
        const inviteModule = findByProps("createFriendInvite");

        commands.push(registerCommand({
            name: "invitecreate",
            displayName: "invitecreate",
            description: "Generates a friend invite link.",
            displayDescription: "Generates a friend invite link.",
            type: ApplicationCommandType.CHAT,
            //@ts-ignore
            applicationId: -1,
            inputType: ApplicationCommandInputType.BUILT_IN,
            execute: async (_, ctx) => {
                const createInvite = await inviteModule.createFriendInvite();
                const message = `
                        discord.gg/${createInvite.code} ·
                        Expires: <t:${new Date(createInvite.expires_at).getTime() / 1000}:R> ·
                        Max uses: \`${createInvite.max_uses}\`
                    `.trim().replace(/\s+/g, " ")
    
                ClydeUtils.sendBotMessage(ctx.channel.id, message);
            }
        }));

        commands.push(registerCommand({
            name: "viewinvites",
            displayName: "viewinvites",
            description: "View your current friend invite links that you've made.",
            displayDescription: "View your current friend invite links that you've made.",
            type: ApplicationCommandType.CHAT,
            //@ts-ignore
            applicationId: -1,
            inputType: ApplicationCommandInputType.BUILT_IN,
            execute: async (_, ctx) => {
                const invites = await inviteModule.getAllFriendInvites();
                const friendInviteList = invites.map(i =>
                    `_discord.gg/${i.code}_ ·
                    Expires: <t:${new Date(i.expires_at).getTime() / 1000}:R> ·
                    Times used: \`${i.uses}/${i.max_uses}\``.trim().replace(/\s+/g, " ")
                );

                ClydeUtils.sendBotMessage(ctx.channel.id, friendInviteList.join("\n") || "You have no active friend invites!");
            }
        }));

        commands.push(registerCommand({
            name: "revokeinvites",
            displayName: "revokeinvites",
            description: "Revoke all your friend invite links.",
            displayDescription: "Revoke all your friend invite links.",
            type: ApplicationCommandType.CHAT,
            //@ts-ignore
            applicationId: -1,
            inputType: ApplicationCommandInputType.BUILT_IN,
            execute: async (_, ctx) => {
                await findByProps("createFriendInvite").revokeFriendInvites();

                ClydeUtils.sendBotMessage(ctx.channel.id, "All friend invites have been revoked.");
            }
        }));

        logger.log("FriendInvites has been initialized.");
    },
    onUnload: () => {
        logger.log("FriendInvites has been stopped.");
    }
}