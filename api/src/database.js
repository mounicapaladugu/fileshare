import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017';

export const connect = (callback) => {
  MongoClient.connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    }, (err, client) => {
    return callback(err, client);
  });
}
