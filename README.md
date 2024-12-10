
# Webmail Server - Instructions and Key Features

## Key Features

1. **User and Management**:
   - **Update User Information**: Users can update their profile information, such as name and picture, which is reflected immediately on the client-side via real-time push notifications.
   
2. **Email Operations**:
   - **Send Email**: Allows users to compose and send emails with attachments.
   - **Receive Email**: Fetches new emails via IMAP from the Gmail server.
   - **Delete Email**: Users can delete unwanted emails from their inbox.

3. **Real-Time Picture Updates**:
   - **Push Notifications**: Users can update their profile information, including their profile picture, which will be reflected immediately..

4. **Gmail Integration**:
   - **SMTP**: Implements Gmail SMTP for sending emails.
   - **IMAP**: Implements Gmail IMAP for receiving and managing emails.

5. **RESTful API**:
   - Designed and implemented RESTful APIs using Node.js and Express.js to manage user authentication, retrieve and send emails, and enable real-time communication between the server and client.

6. **NoSQL Database**:
   - Implemented **NeDB**, a lightweight NoSQL database, to store client information, ensuring fast, persistent storage with efficient querying for user data.

---

## Instructions to Compile and Run the Webmail Server

### Step 1: Navigate to the `src` Folder in server

```bash
cd server/src
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install the necessary dependencies including `Express.js`, `Redis`, `NodeMailer`, and any other required modules.

### Step 3: Configure Server Information

To configure the server for email integration, you need to create a `serverInfo.json` file in the `src` folder of the server directory. This file will store your SMTP and IMAP configuration for Gmail.

#### serverInfo.json

Create a file named `serverInfo.json` in the `server` folder of the server directory, and include the following content:

```json
{
  "smtp": {
    "host": "smtp.gmail.com",
    "port": 465,
    "auth": {
      "user": "<your email>",
      "pass": "<your password>"
    }
  },
  "imap": {
    "host": "imap.gmail.com",
    "port": 993,
    "auth": {
      "user": "<your email>",
      "pass": "<your password>"
    }
  }
}
```

### Step 4: Start the Webmail Server

```bash
npm run dev
```

- The server will start on port `3000` (default) and handle requests for user authentication, email management, and real-time updates.
  
---

## Instructions to Use the Webmail Client

### Step 1: Install Frontend Dependencies

Navigate to the `src` folder in client and install the dependencies:

```bash
cd client/src
npm install
```

### Step 2: Run the Webmail Client

```bash
npm run start
```

- The client will launch in the default web browser and connect to the Webmail Server.
---
