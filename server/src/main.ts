// Node imports.
import path from "path";

// Library imports.
import express, { Express, NextFunction, Request, Response } from "express";

// App imports.
import { serverInfo } from "./ServerInfo";
import * as IMAP from "./IMAP";
import * as SMTP from "./SMTP";
import * as Contacts from "./Contacts";
import { IContact } from "./Contacts";

// Previous imports remain the same
import multer from "multer";

// Configure multer for handling file uploads
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});


// Our Express app.
const app: Express = express();


// Handle JSON in request bodies.
app.use(express.json());


// Serve the client.
app.use("/", express.static(path.join(__dirname, "../../client/dist")));


// Enable CORS so that we can call the API even from anywhere.
app.use(function(inRequest: Request, inResponse: Response, inNext: NextFunction) {
  inResponse.header("Access-Control-Allow-Origin", "*");
  inResponse.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
  inResponse.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
  inNext();
});


// ---------- RESTful endpoint operations begin. ----------


// Get list of mailboxes.
app.get("/mailboxes",
  async (inRequest: Request, inResponse: Response) => {
    console.log("GET /mailboxes (1)");
    try {
      const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
      const mailboxes: IMAP.IMailbox[] = await imapWorker.listMailboxes();
      console.log("GET /mailboxes (1): Ok", mailboxes);
      inResponse.json(mailboxes);
    } catch (inError) {
      console.log("GET /mailboxes (1): Error", inError);
      inResponse.send("error");
    }
  }
);


// Get list of messages in a mailbox (does NOT include bodies).
app.get("/mailboxes/:mailbox",
  async (inRequest: Request, inResponse: Response) => {
    try {
      // Decode the mailbox name from URL-encoded format
      const mailboxName = decodeURIComponent(inRequest.params.mailbox);
      console.log("GET /mailboxes/:mailbox", mailboxName);

      // Initialize IMAP worker with server info
      const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);

      // Fetch messages from the specified mailbox
      const messages: IMAP.IMessage[] = await imapWorker.listMessages({
        mailbox: mailboxName
      });

      console.log("GET /mailboxes/:mailbox: Ok", messages);

      // Respond with the list of messages
      inResponse.json(messages);
    } catch (inError) {
      console.error("GET /mailboxes/:mailbox: Error", inError);

      // Respond with an error message and status
      inResponse.status(500).send({ error: "Failed to retrieve messages" });
    }
  }
);



// Get a message's plain text body.
app.get("/messages/:mailbox/:id",
  async (inRequest: Request, inResponse: Response) => {
    console.log("GET /messages (3)", inRequest.params.mailbox, inRequest.params.id);
    try {
      const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
      const messageBody: string | undefined = await imapWorker.getMessageBody({
        mailbox : inRequest.params.mailbox,
        id : parseInt(inRequest.params.id, 10)
      });
      console.log("GET /messages (3): Ok", messageBody);
      inResponse.send(messageBody);
    } catch (inError) {
      console.log("GET /messages (3): Error", inError);
      inResponse.send("error");
    }
  }
);


// Delete a message.
app.delete("/messages/:mailbox/:id",
  async (inRequest: Request, inResponse: Response) => {
    console.log("DELETE /messages");
    try {
      const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
      await imapWorker.deleteMessage({
        mailbox : inRequest.params.mailbox,
        id : parseInt(inRequest.params.id, 10)
      });
      console.log("DELETE /messages: Ok");
      inResponse.send("ok");
    } catch (inError) {
      console.log("DELETE /messages: Error", inError);
      inResponse.send("error");
    }
  }
);


// Send a message.
app.post("/messages",
  async (inRequest: Request, inResponse: Response) => {
    console.log("POST /messages", inRequest.body);
    try {
      const smtpWorker: SMTP.Worker = new SMTP.Worker(serverInfo);
      await smtpWorker.sendMessage(inRequest.body);
      console.log("POST /messages: Ok");
      inResponse.send("ok");
    } catch (inError) {
      console.log("POST /messages: Error", inError);
      inResponse.send("error");
    }
  }
);


// List contacts.
app.get("/contacts",
  async (inRequest: Request, inResponse: Response) => {
    console.log("GET /contacts");
    try {
      const contactsWorker: Contacts.Worker = new Contacts.Worker();
      const contacts: IContact[] = await contactsWorker.listContacts();
      console.log("GET /contacts: Ok", contacts);
      inResponse.json(contacts);
    } catch (inError) {
      console.log("GET /contacts: Error", inError);
      inResponse.status(400).send("error");
    }
  }
);


// Add a contact.
app.post("/contacts",
  async (inRequest: Request, inResponse: Response) => {
    console.log("POST /contacts", inRequest.body);
    try {
      const contactsWorker: Contacts.Worker = new Contacts.Worker();
      const contact: IContact = await contactsWorker.addContact(inRequest.body);
      console.log("POST /contacts: Ok", contact);
      inResponse.status(201).json(contact);
    } catch (inError) {
      console.log("POST /contacts: Error", inError);
      inResponse.status(400).send("error");
    }
  }
);

app.put("/contacts/:id",
  async (inRequest: Request, inResponse: Response) => {
    console.log("PUT /contacts/:id", inRequest.params.id, inRequest.body);
    try {
      if (!inRequest.body.name && !inRequest.body.email) {
        inResponse.status(400).json({ error: "No valid fields to update" });
        return;
      }

      const contactsWorker = new Contacts.Worker();
      const updatedContact = await contactsWorker.updateContact(inRequest.params.id, inRequest.body);
      
      if (!updatedContact) {
        inResponse.status(404).json({ error: "Contact not found" });
        return;
      }

      console.log("PUT /contacts/:id: Ok", updatedContact);
      inResponse.status(200).json(updatedContact);
    } catch (inError) {
      console.log("PUT /contacts/:id: Error", inError);
      inResponse.status(500).json({ error: "Failed to update contact" });
    }
  }
);

// Delete a contact.
app.delete("/contacts/:id",
  async (inRequest: Request, inResponse: Response) => {
    console.log("DELETE /contacts", inRequest.body);
    try {
      const contactsWorker: Contacts.Worker = new Contacts.Worker();
      await contactsWorker.deleteContact(inRequest.params.id);
      console.log("Contact deleted");
      inResponse.send("ok");
    } catch (inError) {
      console.log(inError);
      inResponse.send("error");
    }
  }
);


// Update contact with image
app.put("/contacts/:id/image",
  upload.single("image"),
  async (inRequest: Request, inResponse: Response) => {
    try {
      if (!inRequest.file) {
        inResponse.status(400).json({ error: "No image file provided" });
        return;
      }

      // Convert image to Base64
      const imageBuffer = inRequest.file.buffer;
      const base64Image = imageBuffer.toString("base64");

      const contactsWorker = new Contacts.Worker();
      const updatedContact = await contactsWorker.updateContact(
        inRequest.params.id,
        { imageData: `data:${inRequest.file.mimetype};base64,${base64Image}` }
      );

      if (!updatedContact) {
        inResponse.status(404).json({ error: "Contact not found" });
        return;
      }

      console.log("PUT /contacts/:id/image: Ok", updatedContact);
      inResponse.status(200).json(updatedContact);
    } catch (inError) {
      console.log("PUT /contacts/:id/image: Error", inError);
      inResponse.status(500).json({ error: "Failed to update contact image" });
    }
  }
);

// Start app listening.
app.listen(3000, () => {
  console.log("MailBag server open for requests");
});