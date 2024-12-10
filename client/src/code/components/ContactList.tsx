import React from "react";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import { ListItemButton } from "@mui/material";
import Person from "@mui/icons-material/Person"; // Import Person icon

const ContactList = ({ state }): JSX.Element => (
  <List>
    {state.contacts.map(value => (
      <ListItem key={value._id}>
        <ListItemButton onClick={() => state.showContact(value._id, value.name, value.email)}>
          <ListItemAvatar>
            <Avatar src={value.imageData || undefined}>
              {!value.imageData && <Person />}  {/* Default icon if no image available */}
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={value.name} />
        </ListItemButton>
      </ListItem>
    ))}
  </List>
);

export default ContactList;
