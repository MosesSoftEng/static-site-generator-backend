/*
 * Server entry point.
 */

//* Imports
import express, {type Application, type Response, type Request} from 'express';
import fs from 'fs';
import path from 'path';

import cors from 'cors';
import multer from 'multer';
import showdown from 'showdown';
import 'dotenv/config';

import config from './config/config';

//* Configs and init
const app: Application = express();
const upload = multer({dest: '/tmp/uploads/'});	// Files upload directory path.
const converter = new showdown.Converter();

//* Global Middlewares.
app.use(express.static(path.join(__dirname, 'tmp')));	// Serve tmp directory publicily.

//* Run server.
app.listen(config.port, (): void => {
	console.log(`Server Running at 👉 http://localhost:${config.port} \n press CTRL+C to stop server`);
});

//* Endpoints.
/**
 * Main endpoint for the root path of the application.
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
app.get('/', (req: Request, res: Response): void => {
	res.send('Hello Typescript with Node.js!');
});

/**
 * Endpoint for handling file uploads.
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
app.options('/sites/upload', cors()); // Enable pre-flight request for this endpoint.
app.post('/sites/upload', [cors(), upload.single('file')], async (req: Request, res: Response) => {
	const {path: uploadFilePath} = req.file!;
	const {sourceRelativePath} = req.body as {sourceRelativePath: string};
	const publicFilePath = config.sitesDir + sourceRelativePath.replace(/\.md$/, '.html');

	try {
		if (sourceRelativePath.endsWith('.md')) {
			await convertMarkDownToHtml(uploadFilePath);
		}

		await moveFile(uploadFilePath, publicFilePath);

		return res.status(200)
			.json({message: 'Success'});
	} catch (error) {
		console.log(error);

		return res.status(500)
			.json({message: 'Server error'});
	}
});

/**
 * Endpoint for listing all the directories in the sites directory.
 * @function
 * @param {Object} req - Express request object.
 * @returns {Response} - Returns a JSON response with a message and data of the directories in the sites directory.
 */
app.options('/sites/', cors()); // Enable pre-flight request for this endpoint.
app.get('/sites/', cors(), (req: Request, res: Response): Response => res.status(200)
	.json({message: '', data: getDirectories(config.sitesDir)}));

/**
 * ConvertMarkDownToHtml - Asynchronously reads the given file, converts the markdown content
 *  to HTML using Showdown, and saves the HTML content back to the file.
 * @param {string} filePath The path to the file to be converted
 * @returns {Promise} Resolves with a message indicating the file was successfully converted
 */
const convertMarkDownToHtml = async (filePath: string): Promise<string> => new Promise((resolve, reject) => {
	fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) {
			console.error(err);
			reject(new Error(err.message));
		}

		// Convert markdown data to html data.
		const html = converter.makeHtml(data);

		// Write html to same file.
		fs.writeFile(filePath, html, err => {
			if (err) {
				console.error(err);
				reject(new Error(err.message));
			}

			resolve('File converted successfully.');
		});
	});
});

/**
 * MoveFile - Asynchronously moves the file from the originPath to the targetPath.
 * @param {string} originPath The path to the original file
 * @param {string} targetPath The target path for the file
 * @returns {Promise} Resolves with a message indicating the file was successfully moved
 */
const moveFile = async (originPath: string, targetPath: string): Promise<string> => new Promise((resolve, reject) => {
	const folder = targetPath.substring(0, targetPath.lastIndexOf('/'));

	fs.mkdir(folder, {recursive: true}, err => {
		if (err) {
			console.error(err);
			reject(new Error(err.message));
		}

		// Move and rename file.
		fs.rename(originPath, targetPath, err => {
			if (err) {
				reject(new Error(err.message));
			}

			resolve('File move successful.');
		});
	});
});

/**
 * GetDirectories - Returns an array of directory names located in the given path
 * @param {string} path The path to retrieve the directories from
 * @returns {string[]} An array of directory names
 */
const getDirectories = (path: string): string[] => fs.readdirSync(path, {withFileTypes: true})
	.filter(dirent => dirent.isDirectory())
	.map(dirent => dirent.name);

//* Export the Express API for vercel.
module.exports = app;
