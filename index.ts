import express, { Request, Response, Express } from 'express';
import mongoose from "mongoose";
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { URL } from './database.js'
import validUrl from 'valid-url';
import shortid from 'shortid';

const app: Express = express();

// Enabel CORS
app.use(cors({ optionsSuccessStatus: 200 }));

// URL-encoded data will be parsed with the querystring library.
// Parses the JSON string in the request body and exposes it in the req.body property
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Set homepage
app.get("/", (req: Request, res: Response) => res.sendFile(__dirname + '/views/index.html'));

app.get("/api/shorturl/:url?", async (req: Request, res: Response) => {
    try {
        const { url } = req.params;

        const docDb = await URL.findOne({ short_url: url });
        if (docDb && docDb.original_url)
            return res.redirect(docDb.original_url);
        else
            return res.status(400).json('No URL found');
    }
    catch (e) {
        console.error(e);
        res.status(500).json('Server error')
    }
})

app.post("/api/shorturl", async (req: Request, res: Response) => {
    try {
        const url: string = req.body.url;

        if (!validUrl.isWebUri(url))
            return res.json({ error: 'invalid url' });

        // verify if url already in database
        const docDb = await URL.findOne({ original_url: url });
        if (docDb) {
            return res.json({
                original_url: docDb.original_url,
                short_url: docDb.short_url
            });
        }

        // create a new one
        const doc = new URL({
            original_url: url,
            short_url: shortid.generate()
        })

        await doc.save();

        res.json({
            original_url: doc.original_url,
            short_url: doc.short_url
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json('Server error')
    }
});


const listener = app.listen(process.env.PORT || 3000, () => {
    const address = listener?.address();
    console.log('Your app is listening on port ' + address?.toString());
});