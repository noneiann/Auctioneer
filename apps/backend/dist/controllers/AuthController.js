"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOne = exports.loginOne = void 0;
const AuthServices_1 = __importDefault(require("../services/AuthServices"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
}
const loginOne = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ success: false, data: "Missing email or password" });
        }
        const user = yield AuthServices_1.default.login(email, password);
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, secret, {
            expiresIn: "2d",
        });
        const response = {
            success: true,
            data: {
                user,
                token,
            },
        };
        return res.json(response);
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ success: false, data: error.message || "Login failed" });
    }
});
exports.loginOne = loginOne;
const registerOne = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, username, password, firstName, lastName } = req.body;
        if (!email || !username || !password || !firstName || !lastName) {
            return res
                .status(400)
                .json({ success: false, data: "Missing required fields" });
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                data: "Password must be at least 6 characters",
            });
        }
        yield AuthServices_1.default.register(email, username, password, firstName, lastName);
        const user = yield AuthServices_1.default.login(email, password);
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, secret, {
            expiresIn: "2d",
        });
        const response = {
            success: true,
            data: {
                user,
                token,
            },
        };
        return res.status(201).json(response);
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ success: false, data: error.message || "Registration failed" });
    }
});
exports.registerOne = registerOne;
