import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import routes from './routes'; // Define API routes
import cors from 'cors';
import path from 'path';

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use('/api', routes);

const angularPath = path.join(__dirname, '../ui/dist/ui/browser');
app.use(express.static(angularPath));

app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(angularPath, 'index.html'));
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // remove when Azure blob is implemented

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});