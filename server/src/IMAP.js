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
    /**
     * Constructor.
     */
    constructor(inServerInfo) {
        console.log("IMAP.Worker.constructor", inServerInfo);
        Worker.serverInfo = inServerInfo;
    } /* End constructor. */
    /**
     * Connect to the SMTP server and return a client object for operations to use.
     *
     * @return An ImapClient instance.
     */
    connectToServer() {
        return __awaiter(this, void 0, void 0, function* () {
            // noinspection TypeScriptValidateJSTypes
            const client = new ImapClient.default(Worker.serverInfo.imap.host, Worker.serverInfo.imap.port, { auth: Worker.serverInfo.imap.auth });
            client.logLevel = client.LOG_LEVEL_NONE;
            client.onerror = (inError) => {
                console.log("IMAP.Worker.listMailboxes(): Connection error", inError);
            };
            yield client.connect();
            console.log("IMAP.Worker.listMailboxes(): Connected");
            return client;
        });
    } /* End connectToServer(). */
    /**
     * Returns a list of all (top-level) mailboxes.
     *
     * @return An array of objects, on per mailbox, that describes the mailbox.
     */
    listMailboxes() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("IMAP.Worker.listMailboxes()");
            const client = yield this.connectToServer();
            const mailboxes = yield client.listMailboxes();
            yield client.close();
            // Translate from emailjs-imap-client mailbox objects to app-specific objects.  At the same time, flatten the list
            // of mailboxes via recursion.
            const finalMailboxes = [];
            const iterateChildren = (inArray) => {
                inArray.forEach((inValue) => {
                    finalMailboxes.push({
                        name: inValue.name,
                        path: inValue.path
                    });
                    iterateChildren(inValue.children);
                });
            };
            iterateChildren(mailboxes.children);
            return finalMailboxes;
        });
    } /* End listMailboxes(). */
    /**
     * Lists basic information about messages in a named mailbox.
     *
     * @param inCallOptions An object implementing the ICallOptions interface.
     * @return              An array of objects, one per message.
     */
    listMessages(inCallOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("IMAP.Worker.listMessages()", inCallOptions);
            const client = yield this.connectToServer();
            // We have to select the mailbox first.  This gives us the message count.
            const mailbox = yield client.selectMailbox(inCallOptions.mailbox);
            console.log(`IMAP.Worker.listMessages(): Message count = ${mailbox.exists}`);
            // If there are no messages then just return an empty array.
            if (mailbox.exists === 0) {
                yield client.close();
                return [];
            }
            // Okay, there are messages, let's get 'em!  Note that they are returned in order by uid, so it's FIFO.
            // noinspection TypeScriptValidateJSTypes
            const messages = yield client.listMessages(inCallOptions.mailbox, "1:*", ["uid", "envelope"]);
            yield client.close();
            // Translate from emailjs-imap-client message objects to app-specific objects.
            const finalMessages = [];
            messages.forEach((inValue) => {
                finalMessages.push({
                    id: inValue.uid,
                    date: inValue.envelope.date,
                    from: inValue.envelope.from[0].address,
                    subject: inValue.envelope.subject
                });
            });
            return finalMessages;
        });
    } /* End listMessages(). */
    /**
     * Gets the plain text body of a single message.
     *
     * @param  inCallOptions An object implementing the ICallOptions interface.
     * @return               The plain text body of the message.
     */
    getMessageBody(inCallOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("IMAP.Worker.getMessageBody()", inCallOptions);
            const client = yield this.connectToServer();
            // noinspection TypeScriptValidateJSTypes
            const messages = yield client.listMessages(inCallOptions.mailbox, inCallOptions.id, ["body[]"], { byUid: true });
            const parsed = yield (0, mailparser_1.simpleParser)(messages[0]["body[]"]);
            yield client.close();
            return parsed.text;
        });
    } /* End getMessageBody(). */
    /**
     * Deletes a single message.
     *
     * @param inCallOptions An object implementing the ICallOptions interface.
     */
    deleteMessage(inCallOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("IMAP.Worker.deleteMessage()", inCallOptions);
            const client = yield this.connectToServer();
            yield client.deleteMessages(inCallOptions.mailbox, inCallOptions.id, { byUid: true });
            yield client.close();
        });
    } /* End deleteMessage(). */
} /* End class. */
exports.Worker = Worker;
