// Library imports.
import axios, { AxiosResponse } from "axios";

// App imports.
import { config } from "./config";

// Define interface to describe a contact with image support
export interface IContact {
  _id?: number,
  name: string,
  email: string,
  imageData?: string  // Base64 encoded image data
}

// The worker that will perform contact operations.
export class Worker {
  /**
   * Returns a list of all contacts from the server.
   *
   * @return An array of objects, one per contact.
   */
  public async listContacts(): Promise<IContact[]> {
    console.log("Contacts.Worker.listContacts()");
    const response: AxiosResponse = await axios.get(`${config.serverAddress}/contacts`);
    return response.data;
  }

  /**
   * Add a contact to the server, optionally with an image.
   *
   * @param  inContact The contact to add.
   * @param  imageFile Optional image file to upload.
   * @return          The inContact object, but now with a _id field added.
   */
  public async addContact(inContact: IContact, imageFile?: File): Promise<IContact> {
    console.log("Contacts.Worker.addContact()", inContact);

    if (imageFile) {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("name", inContact.name);
      formData.append("email", inContact.email);

      const response: AxiosResponse = await axios.post(
        `${config.serverAddress}/contacts`, // Use the `/contacts` endpoint instead of `/contacts/with-image`
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    }

    // If no image is provided, send contact data as JSON.
    const response: AxiosResponse = await axios.post(
      `${config.serverAddress}/contacts`,
      inContact
    );
    return response.data;
  }

  /**
   * Update a contact's information and optionally an image.
   *
   * @param inID The ID of the contact
   * @param updatedData Updated contact information
   * @param imageFile Optional image file to upload
   */
  public async updateContact(inID: number, updatedData: IContact, imageFile?: File): Promise<IContact> {
    console.log("Contacts.Worker.updateContact()", inID);

    if (imageFile) {
      const formData = new FormData();
      formData.append("image", imageFile);
      if (updatedData.name) formData.append("name", updatedData.name);
      if (updatedData.email) formData.append("email", updatedData.email);

      const response: AxiosResponse = await axios.put(
        `${config.serverAddress}/contacts/${inID}/image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    }

    // Update without an image
    const response: AxiosResponse = await axios.put(
      `${config.serverAddress}/contacts/${inID}`,
      updatedData
    );
    return response.data;
  }

  /**
   * Update a contact's image separately.
   *
   * @param inID The ID of the contact
   * @param imageFile The image file to upload
   */
  public async updateContactImage(inID: number, imageFile: File): Promise<IContact> {
    console.log("Contacts.Worker.updateContactImage()", inID);

    const formData = new FormData();
    formData.append("image", imageFile);

    const response: AxiosResponse = await axios.put(
      `${config.serverAddress}/contacts/${inID}/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  /**
   * Delete a contact from the server.
   *
   * @param inID The ID (_id) of the contact to delete.
   */
  public async deleteContact(inID: number): Promise<void> {
    console.log("Contacts.Worker.deleteContact()", inID);
    await axios.delete(`${config.serverAddress}/contacts/${inID}`);
  }
}
