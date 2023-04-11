import { logger } from "@vendetta";
import { registerCommand } from "@vendetta/commands";
import { findByProps } from "@vendetta/metro";

let commands = [];

export default {
    onLoad: () => {
        try {
            const ClydeUtils = findByProps("sendBotMessage");
            const inviteModule = findByProps("getAllFriendInvites");
            const api = findByProps("get", "post")

            commands.push(registerCommand({
                name: "invite create",
                displayName: "invite create",
                description: "Generates a friend invite link.",
                displayDescription: "Generates a friend invite link.",
                type: 1,
                //@ts-ignore
                applicationId: -1,
                inputType: 1,
                execute: async (_, ctx) => {
                    if (!findByProps("getCurrentUser").getCurrentUser().phone) 
                        return ClydeUtils.sendBotMessage(ctx.channel.id, "You need to have a phone number connected to your account to create a friend invite!");
                    
                    const uuid = findByProps("v4").v4()
                    const createInvite = await api.post({
                        url: "/friend-finder/find-friends",
                        body: {
                            modified_contacts: {
                                [uuid]: [1, "", ""]
                            },
                            phone_contact_methods_count: 1
                        }
                    }).then(res =>
                        inviteModule.createFriendInvite({
                            code: res.body.invite_suggestions[0][3],
                            recipient_phone_number_or_email: uuid,
                            contact_visibility: 1,
                            filter_visibilities: [],
                            filtered_invite_suggestions_index: 1
                        })
                    );
                    const message = `
                        https://discord.gg/${createInvite.code} ·
                        Expires: <t:${new Date(createInvite.expires_at).getTime() / 1000}:R> ·
                    `.trim().replace(/\s+/g, " ")

                    ClydeUtils.sendBotMessage(ctx.channel.id, message);
                }
            }));

            commands.push(registerCommand({
                name: "view invites",
                displayName: "view invites",
                description: "View your current friend invite links that you've made.",
                displayDescription: "View your current friend invite links that you've made.",
                type: 1,
                //@ts-ignore
                applicationId: -1,
                execute: async (_, ctx) => {
                    const invites = await inviteModule.getAllFriendInvites();
                    const friendInviteList = invites.map(i =>
                        `_https://discord.gg/${i.code}_ ·
                    Expires: <t:${new Date(i.expires_at).getTime() / 1000}:R> ·
                    Times used: \`${i.uses}/${i.max_uses}\``.trim().replace(/\s+/g, " ")
                    );

                    ClydeUtils.sendBotMessage(ctx.channel.id, friendInviteList.join("\n") || "You have no active friend invites!");
                }
            }));

            commands.push(registerCommand({
                name: "revoke invites",
                displayName: "revoke invites",
                description: "Revoke all your friend invite links.",
                displayDescription: "Revoke all your friend invite links.",
                type: 1,
                //@ts-ignore
                applicationId: -1,
                inputType: 1,
                execute: async (_, ctx) => {
                    await inviteModule.revokeFriendInvites();

                    ClydeUtils.sendBotMessage(ctx.channel.id, "All friend invites have been revoked.");
                }
            }));

            logger.log("FriendInvites has been initialized.");
        } catch (e) {
            logger.error(e.stack);
        }
    },
    onUnload: () => {
        logger.log("FriendInvites has been stopped.");
        for (const unregisterCommands of commands) unregisterCommands();
    }
}
