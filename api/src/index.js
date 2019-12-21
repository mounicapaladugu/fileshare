import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import { connect } from './database';
import AppRouter from './router';
import multer from 'multer';
import path from 'path';

// File storage config
const storageDir = path.join(__dirname, '..', 'storage');
const storageConfig = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, storageDir)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const uplaod = multer({ storage: storageConfig });

const PORT = 3000;
const app = express();
app.server = http.createServer(app);

app.use(morgan('dev'));

app.use(cors({
  exposedHeaders: "*"
}));

app.use(bodyParser.json({
  limit: '50mb'
}));
app.set('root', __dirname);
app.set('storage', storageDir);
app.set('upload', uplaod);

// connect to db. 
connect((err, client) => {
  if (err) {
    console.log("Error connecting to the database");
    throw (err);
  }

  app.set('db', client.db('fileshare'));

  // Init router
  new AppRouter(app);

  app.server.listen(process.env.PORT || PORT, () => {
    console.log(`App is running on port ${app.server.address().port}`);
  });
})


export default app;