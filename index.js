"use strict";
/*
 * Server entry point.
 */
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
//* Imports
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const showdown_1 = __importDefault(require("showdown"));
require("dotenv/config");
const config_1 = __importDefault(require("./config/config"));
//* Configs and init
const app = (0, express_1.default)();
const upload = (0, multer_1.default)({ dest: '/tmp/uploads/' }); // Files upload directory path.
const converter = new showdown_1.default.Converter();
const sitesDir = config_1.default.publicDir + '/sites/';
//* Global Middlewares.
app.use(express_1.default.static(path_1.default.join(__dirname, config_1.default.publicDir))); // Serve public folder publicily.
//* Run server.
app.listen(config_1.default.port, () => {
    console.log(`Server Running at 👉 http://localhost:${config_1.default.port} \n press CTRL+C to stop server`);
});
//* Endpoints.
app.get('/', (req, res) => {
    res.send('Hello Typescript with Node.js!');
});
app.options('/sites/upload', (0, cors_1.default)()); // Enable pre-flight request for this endpoint.
app.post('/sites/upload', [(0, cors_1.default)(), upload.single('file')], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { path: uploadFilePath } = req.file;
    const { sourceRelativePath } = req.body;
    const publicFilePath = sitesDir + sourceRelativePath.replace(/\.md$/, '.html');
    try {
        if (sourceRelativePath.endsWith('.md')) {
            yield convertMarkDownToHtml(uploadFilePath);
        }
        yield moveFile(uploadFilePath, publicFilePath);
        return res.status(200)
            .json({ message: 'Success' });
    }
    catch (error) {
        console.log(error);
        return res.status(500)
            .json({ message: 'Server error' });
    }
}));
app.options('/sites/', (0, cors_1.default)()); // Enable pre-flight request for this endpoint.
app.get('/sites/', (0, cors_1.default)(), (req, res) => res.status(200)
    .json({ message: '', data: getDirectories(sitesDir) }));
const convertMarkDownToHtml = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        fs_1.default.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                reject(new Error(err.message));
            }
            // Convert markdown data to html data.
            const html = converter.makeHtml(data);
            // Write html to same file.
            fs_1.default.writeFile(filePath, html, err => {
                if (err) {
                    console.error(err);
                    reject(new Error(err.message));
                }
                resolve('File converted successfully.');
            });
        });
    });
});
const moveFile = (originPath, targetPath) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const folder = targetPath.substring(0, targetPath.lastIndexOf('/'));
        fs_1.default.mkdir(folder, { recursive: true }, err => {
            if (err) {
                console.error(err);
                reject(new Error(err.message));
            }
            // Move and rename file.
            fs_1.default.rename(originPath, targetPath, err => {
                if (err) {
                    reject(new Error(err.message));
                }
                resolve('File move successful.');
            });
        });
    });
});
const getDirectories = (path) => fs_1.default.readdirSync(path, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
//* Export the Express API for vercel.
module.exports = app;
