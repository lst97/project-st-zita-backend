"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_BASE_URL = exports.API_ENDPOINT = exports.HOST = exports.PORT = exports.API_VERSION = void 0;
exports.API_VERSION = "v1";
exports.PORT = 1168;
exports.HOST = "localhost";
exports.API_ENDPOINT = `/api/${exports.API_VERSION}`;
exports.API_BASE_URL = `http://${exports.HOST}:${exports.PORT}${exports.API_ENDPOINT}`;
