"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importStar(require("mongoose"));
var Line_1 = require("./Line");
var schema = new mongoose_1.Schema({
    custId: { type: String, required: true },
    lines: { type: [Line_1.LineSchema], required: true, default: [] }
});
exports.default = mongoose_1.default.model("Cart", schema);
