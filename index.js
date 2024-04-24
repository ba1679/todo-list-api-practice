const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Todo = require('./models/todos');
const HEADERS = require('./headers');
const { errorHandler, ErrorMsg } = require('./errorHandler');

dotenv.config({
  path: './config.env',
});

const DB = process.env.DATABASE_URL.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB)
  .then(() => {
    console.log('connected to DB successfully');
  })
  .catch((err) => {
    console.log('failed to connect DB', err);
  });

const API_PATH = '/todos';

function sendSuccessResponse(res, data) {
  const sucessResponse = JSON.stringify({
    status: 'success',
    data,
  });
  res.writeHead(200, HEADERS);
  res.write(sucessResponse);
  res.end();
}

const requestListener = async (req, res) => {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

  if (req.url === API_PATH) {
    switch (req.method) {
      case 'GET':
        const todos = await Todo.find();
        sendSuccessResponse(res, todos);
        break;
      case 'POST':
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const title = data.title;
            if (!title) {
              return errorHandler(res, ErrorMsg.titleIsRequired);
            }
            const newTodo = await Todo.create({
              title,
              description: data.description,
              completed: data.completed || false,
              createdAt: Date.now(),
            });
            sendSuccessResponse(res, newTodo);
          } catch (error) {
            errorHandler(res, ErrorMsg.invalidJson);
          }
        });
        break;
      case 'DELETE':
        await Todo.deleteMany();
        sendSuccessResponse(res, []);
        break;
      // due to CORS, browser will send OPTIONS request before some other requests(preflight)
      case 'OPTIONS':
        res.writeHead(200, HEADERS);
        res.end();
        break;
      default:
        errorHandler(res, ErrorMsg.methodNotAllowed);
        break;
    }
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);
