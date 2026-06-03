import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errors } from "celebrate";
import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

import notesRoutes from './routes/notesRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';


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
app.use(cookieParser());

app.use(authRoutes);
app.use(notesRoutes);
app.use(userRoutes);    
app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);

await connectMongoDB();

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
