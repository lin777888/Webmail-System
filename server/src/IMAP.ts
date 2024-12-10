// Library imports.
import { ParsedMail } from "mailparser";
const ImapClient = require("emailjs-imap-client");
import { simpleParser } from "mailparser";

// App imports.
import { IServerInfo } from "./ServerInfo";

// Define interface to describe a mailbox and optionally a specific message
// to be supplied to various methods here.
export interface ICallOptions {
  mailbox: string,
  id?: number
}

// Define interface to describe a received message.
export interface IMessage {
  id: string,
  date: string,
  from: string,
  to: string,
  subject: string,
  body?: string
}

// Define interface to describe a mailbox.
export interface IMailbox {
  name: string,
  path: string
}

// Disable certificate validation (less secure, but needed for some servers).
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// The worker that will perform IMAP operations.
export class Worker {
  // Server information.
  private static serverInfo: IServerInfo;

  constructor(inServerInfo: IServerInfo) {
    console.log("IMAP.Worker.constructor", inServerInfo);
    Worker.serverInfo = inServerInfo;
  }

  private async connectToServer(): Promise<any> {
    const client: any = new ImapClient.default(
      Worker.serverInfo.imap.host,
      Worker.serverInfo.imap.port,
      { auth : Worker.serverInfo.imap.auth }
    );
    client.logLevel = client.LOG_LEVEL_NONE;
    client.onerror = (inError: Error) => {
      console.log("IMAP.Worker.listMailboxes(): Connection error", inError);
    };
    await client.connect();
    console.log("IMAP.Worker.listMailboxes(): Connected");
    return client;
  }

  public async listMailboxes(): Promise<IMailbox[]> {
    console.log("IMAP.Worker.listMailboxes()");
    const client: any = await this.connectToServer();
    const mailboxes: any = await client.listMailboxes();
    await client.close();

    const finalMailboxes: IMailbox[] = [];
    const iterateChildren: Function = (inArray: any[]): void => {
      inArray.forEach((inValue: any) => {
        if (inValue.name !== "[Gmail]") {
          finalMailboxes.push({
            name : inValue.name,
            path : inValue.path
          });
        }
        iterateChildren(inValue.children);
      });
    };
    iterateChildren(mailboxes.children);
    return finalMailboxes;
  }

  public async listMessages(inCallOptions: ICallOptions): Promise<IMessage[]> {
    console.log("IMAP.Worker.listMessages()", inCallOptions);
    const client: any = await this.connectToServer();
    const mailbox: any = await client.selectMailbox(inCallOptions.mailbox);
    console.log(`IMAP.Worker.listMessages(): Message count = ${mailbox.exists}`);

    if (mailbox.exists === 0) {
      await client.close();
      return [ ];
    }

    const messages: any[] = await client.listMessages(
      inCallOptions.mailbox,
      "1:*",
      [ "uid", "envelope" ]
    );

    await client.close();

    const finalMessages: IMessage[] = [];
    messages.forEach((inValue: any) => {
      finalMessages.push({
        id : inValue.uid,
        date: inValue.envelope.date,
        from: inValue.envelope.from[0].address,
        to: inValue.envelope.to[0].address,
        subject: inValue.envelope.subject
      });
    });

    return finalMessages;
  }

  /**
   * Gets the message body, preferring HTML content when available.
   *
   * @param  inCallOptions An object implementing the ICallOptions interface.
   * @return               The message body (HTML if available, otherwise plain text).
   */
  public async getMessageBody(inCallOptions: ICallOptions): Promise<string | undefined> {
    console.log("IMAP.Worker.getMessageBody()", inCallOptions);

    const client: any = await this.connectToServer();

    const messages: any[] = await client.listMessages(
      inCallOptions.mailbox,
      inCallOptions.id,
      [ "body[]" ],
      { byUid : true }
    );
    const parsed: ParsedMail = await simpleParser(messages[0]["body[]"]);

    await client.close();

    // Prefer HTML content when available, fallback to plain text
    return parsed.html || parsed.text;
  }

  public async deleteMessage(inCallOptions: ICallOptions): Promise<any> {
    console.log("IMAP.Worker.deleteMessage()", inCallOptions);
    const client: any = await this.connectToServer();
    await client.deleteMessages(
      inCallOptions.mailbox,
      inCallOptions.id,
      { byUid : true }
    );
    await client.close();
  }
}