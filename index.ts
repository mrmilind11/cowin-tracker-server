import express from 'express';
import server from './startup/server';
import router from './startup/route';
import tracker from './scripts/tracker';

const app = express();

server(app);
router(app);
tracker();