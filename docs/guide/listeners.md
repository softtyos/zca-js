# Lắng nghe Sự kiện WebSocket (`api.listener`)

Hệ thống `api.listener` duy trì kết nối WebSocket thời gian thực với Zalo Server và phát ra các sự kiện đã được giải mã đầy đủ:

```ts
api.listener.on("message", (msg) => {
    console.log(msg.threadId, msg.data.uidFrom, msg.data.content);
});

api.listener.on("reaction", (reaction) => {
    console.log(reaction.threadId, reaction.data.uidFrom, reaction.data.content);
});

api.listener.on("undo", (undoEvent) => {
    console.log(undoEvent.threadId, undoEvent.data);
});

api.listener.on("seen_messages", (seen) => {
    console.log(seen);
});

api.listener.on("group_event", (event) => {
    console.log(event.type, event.groupId, event.data);
});

api.listener.on("sync_event", (syncEvent) => {
    console.log(syncEvent.phase, syncEvent.decryptedPayload);
});

api.listener.on("call_event", (callEvent) => {
    console.log(callEvent.subCmd, callEvent.callId, callEvent.fromUid);
});

api.listener.on("voice2text_event", (v2t) => {
    console.log(v2t.data.req_id, v2t.data.text);
});

api.listener.on("oa_message", (oaMsg) => {
    console.log(`[OA ${oaMsg.oaData?.kind}] ${oaMsg.data.dName}: ${oaMsg.oaData?.text}`);
});

api.listener.on("oa_event", (oaEvt) => {
    console.log(`[OA Event] act=${oaEvt.act}, isBlocked=${oaEvt.isBlocked}, oaIds=${oaEvt.oaIds.join(",")}`);
});

api.listener.start({ retryOnClose: true });
```
