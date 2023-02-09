/*
 * Server entry point.
 */

//* Imports
import express, {type Application, type Response, type Request} from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import showdown from 'showdown';
import 'dotenv/config';

import config from './config/config';

// Create express instance.
const app: Application = express();
const upload = multer({dest: 'public/uploads/'});	// Files upload directory path.
const converter = new showdown.Converter();

//* Global Middlewares.
app.use(express.static('public'));	// Serve public folder publicily.

//* Endpoints.
app.get('/', (req: Request, res: Response): void => {
	res.send('Hello Typescript with Node.js!');
});

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

app.get('/sites/', cors(), (req: Request, res: Response): Response => res.status(200)
	.json({message: '', data: getDirectories(config.sitesDir)}));

//* Run server.
app.listen(config.port, (): void => {
	console.log(`Server Running at 👉 http://localhost:${config.port} \n press CTRL+C to stop server`);
});

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

const getDirectories = (path: string): string[] => fs.readdirSync(path, {withFileTypes: true})
	.filter(dirent => dirent.isDirectory())
	.map(dirent => dirent.name);
