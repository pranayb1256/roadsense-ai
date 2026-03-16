"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./app.js"));
const Port = process.env.PORT;
app_js_1.default.listen(Port, () => {
    console.log(`Server running on port ${Port}`);
});
