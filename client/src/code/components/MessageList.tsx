// React imports.
import React from "react";


import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

/**
 * MessageList.
 */
const MessageList = ({ state }): JSX.Element => (

  <Table stickyHeader padding="none">
    <TableHead>
      <TableRow>
        <TableCell style={{ width:120 }}>Date</TableCell>
        <TableCell style={{ width:300 }}>From</TableCell>
        <TableCell style={{ width:300 }}>To</TableCell>
        <TableCell>Subject</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      { state.messages
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort messages by date,
      .map(message => (
        <TableRow key={ message.id } onClick={ () => state.showMessage(message) }>
          <TableCell>{ new Date(message.date).toLocaleDateString() }</TableCell>
          <TableCell>{ message.from }</TableCell>
          <TableCell>{ message.to }</TableCell>
          <TableCell>{ message.subject }</TableCell>
        </TableRow>
      ) ) }
    </TableBody>
  </Table>

); /* Mailboxes. */


export default MessageList;
