import express from 'express';
import expressWs from 'express-ws';
import { wsHandler } from './signal-server';

const PORT = process.env['PORT'] || 3000;

const app = express();
const expressWsInst = expressWs(app);

expressWsInst.app.ws('/',wsHandler);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
