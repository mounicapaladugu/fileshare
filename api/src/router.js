import path from 'path'
import { version } from '../../package.json'
import _ from 'lodash'
import File from './models/file'
import { ObjectID } from 'mongodb';

class AppRouter {
  constructor(app) {
      this.app = app;
      this.setupRouters();
  }

  setupRouters() {
    const app = this.app;
    const db = app.get('db');
    const uploadDir = app.get('storage');
    const upload = app.get('upload');

    // root route
    app.get('/', (req, res, next) => {
      return res.status(200).json({
          version: version
      });
    });

    // Upload route
    app.post('/api/upload', upload.array('files'), (req, res, next) => {
      const files = _.get(req, 'files', []);
      let models = [];

      _.each(files, (fileObject) => {
          const newFile = new File(app).initWithObject(fileObject);
          models.push(newFile);
      });

      if (models.length) {
        db.collection('files').insertMany(models, (err, result) => {
          if (err) {
            return res.status(503).json({
              error: {
                message: "Db error during saving files.",
              }
            });
          }
          return res.json({
            files: models,
          })
        });
      } else {
        return res.status(503).json({
          error: {message: "File to upload is required!"}
        });
      }
    });

    // Download route
    app.get('/api/download/:id', (req, res, next) => {
      const fileId = req.params.id;

      db.collection('files').find({ _id: ObjectID(fileId) }).toArray((err, result) => {
        const fileName = _.get(result, '[0].name');
        const filePath = path.join(uploadDir, fileName);
        return res.download(filePath, fileName, (err) => {
          if (err) {
            return res.status(404).json({
              error: {
                message: "File not found!"
              }
            });
          } else {
            console.log("File download complete");
          }
        });
      })
    });
  }
}

export default AppRouter;