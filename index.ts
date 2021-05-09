import express from 'express';
import serverInit from './startup/server';
import router from './startup/route';
import tracker from './scripts/tracker';
import { initSocket } from './scripts/socket-server';

const app = express();

const server = serverInit(app);
initSocket(server);
router(app);
tracker();