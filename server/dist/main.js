"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Node imports.
const path_1 = __importDefault(require("path"));
// Library imports.
const express_1 = __importDefault(require("express"));
// App imports.
const ServerInfo_1 = require("./ServerInfo");
const IMAP = __importStar(require("./IMAP"));
const SMTP = __importStar(require("./SMTP"));
const Contacts = __importStar(require("./Contacts"));
// Previous imports remain the same
const multer_1 = __importDefault(require("multer"));
// Configure multer for handling file uploads
const upload = (0, multer_1.default)({
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});
// Our Express app.
const app = (0, express_1.default)();
// Handle JSON in request bodies.
app.use(express_1.default.json());
// Serve the client.
app.use("/", express_1.default.static(path_1.default.join(__dirname, "../../client/dist")));
// Enable CORS so that we can call the API even from anywhere.
app.use(function (inRequest, inResponse, inNext) {
    inResponse.header("Access-Control-Allow-Origin", "*");
    inResponse.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
    inResponse.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
    inNext();
});
// ---------- RESTful endpoint operations begin. ----------
// Get list of mailboxes.
app.get("/mailboxes", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("GET /mailboxes (1)");
    try {
        const imapWorker = new IMAP.Worker(ServerInfo_1.serverInfo);
        const mailboxes = yield imapWorker.listMailboxes();
        console.log("GET /mailboxes (1): Ok", mailboxes);
        inResponse.json(mailboxes);
    }
    catch (inError) {
        console.log("GET /mailboxes (1): Error", inError);
        inResponse.send("error");
    }
}));
// Get list of messages in a mailbox (does NOT include bodies).
app.get("/mailboxes/:mailbox", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Decode the mailbox name from URL-encoded format
        const mailboxName = decodeURIComponent(inRequest.params.mailbox);
        console.log("GET /mailboxes/:mailbox", mailboxName);
        // Initialize IMAP worker with server info
        const imapWorker = new IMAP.Worker(ServerInfo_1.serverInfo);
        // Fetch messages from the specified mailbox
        const messages = yield imapWorker.listMessages({
            mailbox: mailboxName
        });
        console.log("GET /mailboxes/:mailbox: Ok", messages);
        // Respond with the list of messages
        inResponse.json(messages);
    }
    catch (inError) {
        console.error("GET /mailboxes/:mailbox: Error", inError);
        // Respond with an error message and status
        inResponse.status(500).send({ error: "Failed to retrieve messages" });
    }
}));
// Get a message's plain text body.
app.get("/messages/:mailbox/:id", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("GET /messages (3)", inRequest.params.mailbox, inRequest.params.id);
    try {
        const imapWorker = new IMAP.Worker(ServerInfo_1.serverInfo);
        const messageBody = yield imapWorker.getMessageBody({
            mailbox: inRequest.params.mailbox,
            id: parseInt(inRequest.params.id, 10)
        });
        console.log("GET /messages (3): Ok", messageBody);
        inResponse.send(messageBody);
    }
    catch (inError) {
        console.log("GET /messages (3): Error", inError);
        inResponse.send("error");
    }
}));
// Delete a message.
app.delete("/messages/:mailbox/:id", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("DELETE /messages");
    try {
        const imapWorker = new IMAP.Worker(ServerInfo_1.serverInfo);
        yield imapWorker.deleteMessage({
            mailbox: inRequest.params.mailbox,
            id: parseInt(inRequest.params.id, 10)
        });
        console.log("DELETE /messages: Ok");
        inResponse.send("ok");
    }
    catch (inError) {
        console.log("DELETE /messages: Error", inError);
        inResponse.send("error");
    }
}));
// Send a message.
app.post("/messages", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("POST /messages", inRequest.body);
    try {
        const smtpWorker = new SMTP.Worker(ServerInfo_1.serverInfo);
        yield smtpWorker.sendMessage(inRequest.body);
        console.log("POST /messages: Ok");
        inResponse.send("ok");
    }
    catch (inError) {
        console.log("POST /messages: Error", inError);
        inResponse.send("error");
    }
}));
// List contacts.
app.get("/contacts", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("GET /contacts");
    try {
        const contactsWorker = new Contacts.Worker();
        const contacts = yield contactsWorker.listContacts();
        console.log("GET /contacts: Ok", contacts);
        inResponse.json(contacts);
    }
    catch (inError) {
        console.log("GET /contacts: Error", inError);
        inResponse.status(400).send("error");
    }
}));
// Add a contact.
app.post("/contacts", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("POST /contacts", inRequest.body);
    try {
        const contactsWorker = new Contacts.Worker();
        const contact = yield contactsWorker.addContact(inRequest.body);
        console.log("POST /contacts: Ok", contact);
        inResponse.status(201).json(contact);
    }
    catch (inError) {
        console.log("POST /contacts: Error", inError);
        inResponse.status(400).send("error");
    }
}));
app.put("/contacts/:id", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("PUT /contacts/:id", inRequest.params.id, inRequest.body);
    try {
        if (!inRequest.body.name && !inRequest.body.email) {
            inResponse.status(400).json({ error: "No valid fields to update" });
            return;
        }
        const contactsWorker = new Contacts.Worker();
        const updatedContact = yield contactsWorker.updateContact(inRequest.params.id, inRequest.body);
        if (!updatedContact) {
            inResponse.status(404).json({ error: "Contact not found" });
            return;
        }
        console.log("PUT /contacts/:id: Ok", updatedContact);
        inResponse.status(200).json(updatedContact);
    }
    catch (inError) {
        console.log("PUT /contacts/:id: Error", inError);
        inResponse.status(500).json({ error: "Failed to update contact" });
    }
}));
// Delete a contact.
app.delete("/contacts/:id", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("DELETE /contacts", inRequest.body);
    try {
        const contactsWorker = new Contacts.Worker();
        yield contactsWorker.deleteContact(inRequest.params.id);
        console.log("Contact deleted");
        inResponse.send("ok");
    }
    catch (inError) {
        console.log(inError);
        inResponse.send("error");
    }
}));
// Update contact with image
app.put("/contacts/:id/image", upload.single("image"), (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!inRequest.file) {
            inResponse.status(400).json({ error: "No image file provided" });
            return;
        }
        // Convert image to Base64
        const imageBuffer = inRequest.file.buffer;
        const base64Image = imageBuffer.toString("base64");
        const contactsWorker = new Contacts.Worker();
        const updatedContact = yield contactsWorker.updateContact(inRequest.params.id, { imageData: `data:${inRequest.file.mimetype};base64,${base64Image}` });
        if (!updatedContact) {
            inResponse.status(404).json({ error: "Contact not found" });
            return;
        }
        console.log("PUT /contacts/:id/image: Ok", updatedContact);
        inResponse.status(200).json(updatedContact);
    }
    catch (inError) {
        console.log("PUT /contacts/:id/image: Error", inError);
        inResponse.status(500).json({ error: "Failed to update contact image" });
    }
}));
// Start app listening.
app.listen(3000, () => {
    console.log("MailBag server open for requests");
});
//# sourceMappingURL=main.js.map