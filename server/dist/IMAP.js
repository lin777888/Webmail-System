"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = void 0;
const ImapClient = require("emailjs-imap-client");
const mailparser_1 = require("mailparser");
// Disable certificate validation (less secure, but needed for some servers).
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// The worker that will perform IMAP operations.
class Worker {
    constructor(inServerInfo) {
        console.log("IMAP.Worker.constructor", inServerInfo);
        Worker.serverInfo = inServerInfo;
    }
    connectToServer() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new ImapClient.default(Worker.serverInfo.imap.host, Worker.serverInfo.imap.port, { auth: Worker.serverInfo.imap.auth });
            client.logLevel = client.LOG_LEVEL_NONE;
            client.onerror = (inError) => {
                console.log("IMAP.Worker.listMailboxes(): Connection error", inError);
            };
            yield client.connect();
            console.log("IMAP.Worker.listMailboxes(): Connected");
            return client;
        });
    }
    listMailboxes() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("IMAP.Worker.listMailboxes()");
            const client = yield this.connectToServer();
            const mailboxes = yield client.listMailboxes();
            yield client.close();
            const finalMailboxes = [];
            const iterateChildren = (inArray) => {
                inArray.forEach((inValue) => {
                    if (inValue.name !== "[Gmail]") {
                        finalMailboxes.push({
                            name: inValue.name,
                            path: inValue.path
                        });
                    }
                    iterateChildren(inValue.children);
                });
            };
            iterateChildren(mailboxes.children);
            return finalMailboxes;
        });
    }
    listMessages(inCallOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("IMAP.Worker.listMessages()", inCallOptions);
            const client = yield this.connectToServer();
            const mailbox = yield client.selectMailbox(inCallOptions.mailbox);
            console.log(`IMAP.Worker.listMessages(): Message count = ${mailbox.exists}`);
            if (mailbox.exists === 0) {
                yield client.close();
                return [];
            }
            const messages = yield client.listMessages(inCallOptions.mailbox, "1:*", ["uid", "envelope"]);
            yield client.close();
            const finalMessages = [];
            messages.forEach((inValue) => {
                finalMessages.push({
                    id: inValue.uid,
                    date: inValue.envelope.date,
                    from: inValue.envelope.from[0].address,
                    to: inValue.envelope.to[0].address,
                    subject: inValue.envelope.subject
                });
            });
            return finalMessages;
        });
    }
    /**
     * Gets the message body, preferring HTML content when available.
     *
     * @param  inCallOptions An object implementing the ICallOptions interface.
     * @return               The message body (HTML if available, otherwise plain text).
     */
    getMessageBody(inCallOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("IMAP.Worker.getMessageBody()", inCallOptions);
            const client = yield this.connectToServer();
            const messages = yield client.listMessages(inCallOptions.mailbox, inCallOptions.id, ["body[]"], { byUid: true });
            const parsed = yield (0, mailparser_1.simpleParser)(messages[0]["body[]"]);
            yield client.close();
            // Prefer HTML content when available, fallback to plain text
            return parsed.html || parsed.text;
        });
    }
    deleteMessage(inCallOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("IMAP.Worker.deleteMessage()", inCallOptions);
            const client = yield this.connectToServer();
            yield client.deleteMessages(inCallOptions.mailbox, inCallOptions.id, { byUid: true });
            yield client.close();
        });
    }
}
exports.Worker = Worker;
//# sourceMappingURL=IMAP.js.map