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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = void 0;
// Node imports.
const path = __importStar(require("path"));
// Library imports.
const Datastore = require("nedb");
// The worker that will perform contact operations.
class Worker {
    /**
     * Constructor.
     */
    constructor() {
        this.db = new Datastore({
            filename: path.join(__dirname, "contacts.db"),
            autoload: true
        });
    }
    /**
     * Lists all contacts.
     *
     * @return A promise that eventually resolves to an array of IContact objects.
     */
    listContacts() {
        console.log("Contacts.Worker.listContacts()");
        return new Promise((inResolve, inReject) => {
            this.db.find({}, (inError, inDocs) => {
                if (inError) {
                    console.log("Contacts.Worker.listContacts(): Error", inError);
                    inReject(inError);
                }
                else {
                    console.log("Contacts.Worker.listContacts(): Ok", inDocs);
                    inResolve(inDocs);
                }
            });
        });
    }
    /**
     * Add a new contact.
     *
     * @param  inContact The contact to add.
     * @return          A promise that eventually resolves to an IContact object.
     */
    addContact(inContact) {
        console.log("Contacts.Worker.addContact()", inContact);
        return new Promise((inResolve, inReject) => {
            this.db.insert(inContact, (inError, inNewDoc) => {
                if (inError) {
                    console.log("Contacts.Worker.addContact(): Error", inError);
                    inReject(inError);
                }
                else {
                    console.log("Contacts.Worker.addContact(): Ok", inNewDoc);
                    inResolve(inNewDoc);
                }
            });
        });
    }
    /**
     * Update a contact.
     *
     * @param contactID The ID of the contact to update.
     * @param updatedData The new data for the contact.
     * @return A promise that resolves to the updated contact.
     */
    updateContact(contactID, updatedData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Contacts.Worker.updateContact()", contactID, updatedData);
            return new Promise((resolve, reject) => {
                this.db.update({ _id: contactID }, { $set: updatedData }, { returnUpdatedDocs: true }, (err, numReplaced, affectedDocs) => {
                    if (err) {
                        console.log("Contacts.Worker.updateContact(): Error", err);
                        reject(err);
                    }
                    else {
                        console.log("Contacts.Worker.updateContact(): Updated", affectedDocs);
                        resolve(affectedDocs);
                    }
                });
            });
        });
    }
    /**
     * Delete a contact.
     *
     * @param  inID The ID of the contact to delete.
     * @return      A promise that eventually resolves to a string (null for success, or the error message for an error).
     */
    deleteContact(inID) {
        console.log("Contacts.Worker.deleteContact()", inID);
        return new Promise((inResolve, inReject) => {
            this.db.remove({ _id: inID }, {}, (inError, inNumRemoved) => {
                if (inError) {
                    console.log("Contacts.Worker.deleteContact(): Error", inError);
                    inReject(inError);
                }
                else {
                    console.log("Contacts.Worker.deleteContact(): Ok", inNumRemoved);
                    inResolve("");
                }
            });
        });
    }
}
exports.Worker = Worker;
//# sourceMappingURL=Contacts.js.map