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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = void 0;
const nodemailer = __importStar(require("nodemailer"));
// The worker that will perform SMTP operations.
class Worker {
    /**
     * Constructor.
     */
    constructor(inServerInfo) {
        console.log("SMTP.Worker.constructor", inServerInfo);
        Worker.serverInfo = inServerInfo;
    } /* End constructor. */
    /**
     * Send a message.
     *
     * @param  inOptions An object containing to, from, subject and text properties (matches the IContact interface,
     *                   but can't be used since the type comes from nodemailer, not app code).
     * @return           A Promise that eventually resolves to a string (null for success, error message for an error).
     */
    sendMessage(inOptions) {
        console.log("SMTP.Worker.sendMessage()", inOptions);
        console.log("==================");
        console.log(inOptions);
        return new Promise((inResolve, inReject) => {
            const transport = nodemailer.createTransport(Worker.serverInfo.smtp);
            transport.sendMail(inOptions, (inError, inInfo) => {
                if (inError) {
                    console.log("SMTP.Worker.sendMessage(): Error", inError);
                    inReject(inError);
                }
                else {
                    console.log("SMTP.Worker.sendMessage(): Ok", inInfo);
                    inResolve("");
                }
            });
        });
    } /* End sendMessage(). */
} /* End class. */
exports.Worker = Worker;
//# sourceMappingURL=SMTP.js.map