import React, { useRef } from "react";
import Button from "@mui/material/Button";
import { TextField } from "@mui/material";

const ContactView = ({ state }): JSX.Element => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = () => {
    if (fileInputRef.current?.files && fileInputRef.current.files.length > 0) {
      const file = fileInputRef.current.files[0];
      
      // check `contactID`
      if (state.contactID) {
        const formData = new FormData();
        formData.append("image", file);
  
        // use fetch send PUT to server
        fetch(`http://127.0.0.1:3000/contacts/${state.contactID}/image`, {
          method: "PUT",
          body: formData,
        })
          .then(response => {
            if (!response.ok) {
              throw new Error("Failed to upload image");
            }
            return response.json();
          })
          .then(data => {
            console.log("Image uploaded successfully", data);
            // update contact info
            if (typeof state.updateContactImageInState === "function") {
              state.updateContactImageInState(data);
            } else {
              console.error("updateContactImageInState is not defined");
            }
          })
          .catch(error => {
            console.error("Error uploading image:", error);
          });
      }
    }
  };

  return (
    <form>
      <TextField
        margin="dense"
        id="contactName"
        label="Name"
        value={state.contactName}
        variant="outlined"
        InputProps={{ style: { color: "#000000" } }}
        disabled={state.currentView === "contact"}
        style={{ width: 260 }}
        onChange={state.fieldChangeHandler}
      />
      <br />
      <TextField
        margin="dense"
        id="contactEmail"
        label="Email"
        value={state.contactEmail}
        variant="outlined"
        InputProps={{ style: { color: "#000000" } }}
        disabled={state.currentView === "contact"}
        style={{ width: 520 }}
        onChange={state.fieldChangeHandler}
      />
      <br />

      {state.currentView === "contact" && (
        <>
          <Button
            variant="contained"
            color="primary"
            size="small"
            style={{ marginTop: 10, marginRight: 10 }}
            onClick={state.deleteContact}
          >
            Delete
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            style={{ marginTop: 10 }}
            onClick={() => state.showComposeMessage("contact")}
          >
            Send Email
          </Button>
          <br />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />
          <Button
            variant="contained"
            color="secondary"
            size="small"
            style={{ marginTop: 10 }}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Image
          </Button>
        </>
      )}

      {state.currentView === "contactAdd" && (
        <Button
          variant="contained"
          color="primary"
          size="small"
          style={{ marginTop: 10 }}
          onClick={state.saveContact}
        >
          Save
        </Button>
      )}
    </form>
  );
};

export default ContactView;
