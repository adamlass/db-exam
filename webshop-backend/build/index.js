"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var cors_1 = __importDefault(require("cors"));
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var socket_io_1 = __importDefault(require("socket.io"));
var http_1 = __importDefault(require("http"));
var mongoose_1 = __importDefault(require("mongoose"));
var pg_1 = require("pg");
var pg_escape_1 = __importDefault(require("pg-escape"));
var Cart_1 = __importDefault(require("./schema/Cart"));
var Line_1 = __importDefault(require("./schema/Line"));
var MyError_1 = __importDefault(require("./error/MyError"));
var shortid_1 = __importDefault(require("shortid"));
var redis = require('ioredis');
var neo4j = require('neo4j-driver');
//Neo4j
var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "items"));
var session = driver.session();
//Socketio & express
var app = express_1.default();
var server = new http_1.default.Server(app);
var io = socket_io_1.default(server, {
    origins: '*:*',
});
app.use(body_parser_1.default.json());
app.use(cors_1.default());
server.listen(3000, function () { return console.log("App is online"); });
//mongoose
mongoose_1.default.connect("mongodb+srv://mongo_user:mongo_user@webshop-vf9eh.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose_1.default.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("connection open");
});
//Postgres
var config = {
    "user": "postgres",
    "host": "localhost",
    "database": "webshop",
    "password": "postgres",
    "port": 5433
};
var postgres = new pg_1.Client(config);
var pool = new pg_1.Pool(config);
postgres.connect()
    .then(function () { return console.info("Sucessfully connected to DB!"); })
    .catch(function () { return console.error('Could not connect to DB!'); });
io.on('connection', function (socket) { return __awaiter(_this, void 0, void 0, function () {
    var subscriber, channel, publisher;
    return __generator(this, function (_a) {
        socket.emit("message", "Shop", "Welcome!");
        console.log('Connection! Id:', socket.id);
        subscriber = redis.createClient();
        channel = socket.id;
        subscriber.on('message', function (channel, message) {
            socket.emit("message", "Customer", message);
        });
        subscriber.subscribe(channel);
        publisher = redis.createClient();
        socket.use(function (packet, next) {
            try {
                var data = packet[1];
                var id = data.id;
                socket.join(id);
                next();
            }
            catch (e) {
                errorHandler(e, socket);
            }
        });
        socket.on("sendMessage", function (message) {
            publisher.publish(channel, message);
        });
        return [2 /*return*/];
    });
}); });
app.get("/", function (req, res) { return res.send("Hello world"); });
app.get("/categories", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var result, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, session.run('MATCH (n:Category) RETURN n.name')];
            case 1:
                result = _a.sent();
                result = result.records.map(function (record) { return record["_fields"][0]; });
                res.send(result);
                return [3 /*break*/, 3];
            case 2:
                e_1 = _a.sent();
                handleError(e_1, res);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
function getItem(id) {
    return __awaiter(this, void 0, void 0, function () {
        var sql, escaped, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sql = "\n                SELECT * \n                FROM public.item\n                WHERE id = $1\n            ";
                    escaped = pg_escape_1.default(sql);
                    return [4 /*yield*/, postgres.query(escaped, [id])];
                case 1:
                    res = _a.sent();
                    if (res.rowCount !== 1)
                        return [2 /*return*/, null];
                    return [2 /*return*/, res.rows[0]];
            }
        });
    });
}
app.get("/products", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var category, result, res1, _i, result_1, id, item, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                category = req.query.category;
                return [4 /*yield*/, session.run('MATCH (c:Category)-[:CONTAINS]->(i:Item) WHERE c.name = $name RETURN i.id', { name: category })];
            case 1:
                result = _a.sent();
                result = result.records.map(function (record) { return record["_fields"][0]; });
                console.log(result);
                res1 = [];
                _i = 0, result_1 = result;
                _a.label = 2;
            case 2:
                if (!(_i < result_1.length)) return [3 /*break*/, 5];
                id = result_1[_i];
                return [4 /*yield*/, getItem(id)];
            case 3:
                item = _a.sent();
                if (!item)
                    return [3 /*break*/, 4];
                res1.push(item);
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5:
                res.send(res1);
                return [3 /*break*/, 7];
            case 6:
                e_2 = _a.sent();
                handleError(e_2, res);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
function addNamesToLines(cart) {
    return __awaiter(this, void 0, void 0, function () {
        var res, _i, _a, line, _id, itemId, amount, item;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!cart) return [3 /*break*/, 5];
                    res = [];
                    _i = 0, _a = cart.lines;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    line = _a[_i];
                    _id = line._id, itemId = line.itemId, amount = line.amount;
                    return [4 /*yield*/, getItem(itemId)];
                case 2:
                    item = _b.sent();
                    res.push({ itemId: itemId, amount: amount, name: item.name, price: item.price, _id: _id });
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, res];
                case 5: return [2 /*return*/, null];
            }
        });
    });
}
app.post("/cart", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var _a, amount, custId, id, cart, line, cartResponse, e_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                _a = req.body, amount = _a.amount, custId = _a.custId, id = _a.id;
                return [4 /*yield*/, Cart_1.default.findOne({ custId: custId })];
            case 1:
                cart = _b.sent();
                if (!!cart) return [3 /*break*/, 3];
                cart = new Cart_1.default({ custId: custId });
                return [4 /*yield*/, cart.save()];
            case 2:
                _b.sent();
                _b.label = 3;
            case 3:
                line = new Line_1.default({ itemId: id, amount: amount });
                cart.lines.push(line);
                return [4 /*yield*/, cart.save()];
            case 4:
                _b.sent();
                return [4 /*yield*/, addNamesToLines(cart)];
            case 5:
                cartResponse = _b.sent();
                res.send(cartResponse);
                return [3 /*break*/, 7];
            case 6:
                e_3 = _b.sent();
                handleError(e_3, res);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
app.post("/order/:custId", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var custId, cart, client, getCustomerSql, res_1, createCustomerSql, orderSql, orderId, _i, _a, line, itemId, amount, orderLineSql, e_4, e_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 18, , 19]);
                custId = req.params.custId;
                return [4 /*yield*/, Cart_1.default.findOne({ custId: custId })];
            case 1:
                cart = _b.sent();
                if (!cart) {
                    throw new MyError_1.default("Cart does not exist!");
                }
                else if (cart.lines.length === 0) {
                    throw new MyError_1.default("Cart is empty!");
                }
                return [4 /*yield*/, pool.connect()];
            case 2:
                client = _b.sent();
                _b.label = 3;
            case 3:
                _b.trys.push([3, 14, 16, 17]);
                console.log('BEGIN');
                return [4 /*yield*/, client.query('BEGIN')];
            case 4:
                _b.sent();
                getCustomerSql = "\n                SELECT id\n                FROM customer\n                WHERE id=$1\n            ";
                return [4 /*yield*/, client.query(getCustomerSql, [custId])];
            case 5:
                res_1 = _b.sent();
                if (!(res_1.rowCount !== 1)) return [3 /*break*/, 7];
                createCustomerSql = "\n                    INSERT INTO customer\n                    VALUES ($1)\n                ";
                return [4 /*yield*/, client.query(createCustomerSql, [custId])];
            case 6:
                _b.sent();
                _b.label = 7;
            case 7:
                orderSql = "\n                INSERT INTO orders\n                (id, customer_id) VALUES ($1, $2)\n            ";
                orderId = shortid_1.default();
                return [4 /*yield*/, client.query(orderSql, [orderId, custId])];
            case 8:
                res_1 = _b.sent();
                if (res_1.rowCount !== 1) {
                    throw new MyError_1.default("Failed to create order!");
                }
                _i = 0, _a = cart.lines;
                _b.label = 9;
            case 9:
                if (!(_i < _a.length)) return [3 /*break*/, 12];
                line = _a[_i];
                itemId = line.itemId, amount = line.amount;
                orderLineSql = "\n                    INSERT INTO orderLine\n                    (quantity, order_id, item_id) VALUES ($1,$2,$3)\n                ";
                return [4 /*yield*/, client.query(orderLineSql, [amount, orderId, itemId])];
            case 10:
                res_1 = _b.sent();
                if (res_1.rowCount !== 1) {
                    throw new MyError_1.default("Failed to create order line!");
                }
                _b.label = 11;
            case 11:
                _i++;
                return [3 /*break*/, 9];
            case 12:
                console.log('COMMIT');
                return [4 /*yield*/, client.query('COMMIT')];
            case 13:
                _b.sent();
                return [3 /*break*/, 17];
            case 14:
                e_4 = _b.sent();
                console.log('ROLLBACK');
                console.log(e_4);
                return [4 /*yield*/, client.query('ROLLBACK')];
            case 15:
                _b.sent();
                throw e_4;
            case 16:
                client.release();
                return [7 /*endfinally*/];
            case 17: return [3 /*break*/, 19];
            case 18:
                e_5 = _b.sent();
                handleError(e_5, res);
                return [3 /*break*/, 19];
            case 19: return [2 /*return*/];
        }
    });
}); });
app.delete("/cart/:custId/line/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var _a, custId, id_1, cart, cartResponse, e_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                _a = req.params, custId = _a.custId, id_1 = _a.id;
                return [4 /*yield*/, Cart_1.default.findOne({ custId: custId })];
            case 1:
                cart = _b.sent();
                if (!cart) return [3 /*break*/, 3];
                cart.lines = cart.lines.filter(function (line) {
                    if (line._id == id_1)
                        return false;
                    return true;
                });
                return [4 /*yield*/, cart.save()];
            case 2:
                _b.sent();
                _b.label = 3;
            case 3: return [4 /*yield*/, addNamesToLines(cart)];
            case 4:
                cartResponse = _b.sent();
                res.send(cartResponse);
                return [3 /*break*/, 6];
            case 5:
                e_6 = _b.sent();
                handleError(e_6, res);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
function handleError(e, res) {
    var status = e.status || 500;
    var message = e.message || "Something went wrong!";
    var responseError = {
        status: status,
        message: message,
        stack: e.stack
    };
    res.status(status);
    res.send(responseError);
}
function errorHandler(e, socket) {
    socket.error(e.message);
}
