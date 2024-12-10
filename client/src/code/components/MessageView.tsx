import React from "react";
import { InputBase, TextField, Button } from "@mui/material";
import DOMPurify from "dompurify"; // We'll need to add this dependency for sanitization

const MessageView = ({ state }): JSX.Element => {
  // Function to safely render HTML content
  const createMarkup = (htmlContent: string) => {
    return { __html: DOMPurify.sanitize(htmlContent) };
  };

  return (
    <form>
      {/* Message ID and date section */}
      {state.currentView === "message" && (
        <>
          <InputBase
            defaultValue={`ID ${state.messageID}`}
            margin="dense"
            disabled={true}
            fullWidth={true}
            className="messageInfoField"
          />
          <br />
          <InputBase
            defaultValue={state.messageDate}
            margin="dense"
            disabled={true}
            fullWidth={true}
            className="messageInfoField"
          />
          <br />
        </>
      )}

      {/* From field */}
      {state.currentView === "message" && (
        <>
          <TextField
            margin="dense"
            variant="outlined"
            fullWidth={true}
            label="From"
            value={state.messageFrom}
            disabled={true}
            InputProps={{ style: { color: "#000000" } }}
          />
          <br />
        </>
      )}

      {/* To field for compose view */}
      {state.currentView === "compose" && (
        <>
          <TextField
            margin="dense"
            id="messageTo"
            variant="outlined"
            fullWidth={true}
            label="To"
            value={state.messageTo}
            InputProps={{ style: { color: "#000000" } }}
            onChange={state.fieldChangeHandler}
          />
          <br />
        </>
      )}

      {/* Subject field */}
      <TextField
        margin="dense"
        id="messageSubject"
        label="Subject"
        variant="outlined"
        fullWidth={true}
        value={state.messageSubject}
        disabled={state.currentView === "message"}
        InputProps={{ style: { color: "#000000" } }}
        onChange={state.fieldChangeHandler}
      />
      <br />

      {/* Message body - differs based on view mode */}
      {state.currentView === "message" ? (
        <div
          className="email-content"
          style={{
            border: '1px solid rgba(0, 0, 0, 0.23)',
            borderRadius: '4px',
            padding: '16.5px 14px',
            minHeight: '300px',
            marginTop: '8px',
            backgroundColor: '#fff'
          }}
          dangerouslySetInnerHTML={createMarkup(state.messageBody)}
        />
      ) : (
        <TextField
          margin="dense"
          id="messageBody"
          variant="outlined"
          fullWidth={true}
          multiline={true}
          rows={12}
          value={state.messageBody}
          disabled={false}
          InputProps={{ style: { color: "#000000" } }}
          onChange={state.fieldChangeHandler}
        />
      )}

      {/* Action buttons */}
      {state.currentView === "compose" && (
        <Button
          variant="contained"
          color="primary"
          size="small"
          style={{ marginTop: 10 }}
          onClick={state.sendMessage}
        >
          Send
        </Button>
      )}
      
      {state.currentView === "message" && (
        <>
          <Button
            variant="contained"
            color="primary"
            size="small"
            style={{ marginTop: 10, marginRight: 10 }}
            onClick={() => state.showComposeMessage("reply")}
          >
            Reply
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            style={{ marginTop: 10 }}
            onClick={state.deleteMessage}
          >
            Delete
          </Button>
        </>
      )}
    </form>
  );
};

export default MessageView;