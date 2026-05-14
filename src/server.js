import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import helmet from "helmet";
import { errors } from "celebrate";
import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

import notesRoutes from './routes/notesRoutes.js';

const app = express();
app.use(cors(
  {
    methods: ["GET", "POST", "PATCH", "DELETE"],
    origin: "*",
  }
));
app.use(helmet());
app.use(logger);

app.use(express.json());

app.use(notesRoutes);
app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);

await connectMongoDB();

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
