const http = require('http');
const { errorHandler, ErrorMsg } = require('./errorHandler');
const HEADERS = require('./headers');
const { v4: uuidv4 } = require('uuid');

const API_PATH = '/todos';

const todos = [];

function sendSuccessResponse(res) {
  const sucessResponse = JSON.stringify({
    status: 'success',
    data: todos,
  });
  res.writeHead(200, HEADERS);
  res.write(sucessResponse);
  res.end();
}

const requestListener = (req, res) => {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

  if (req.url === API_PATH) {
    switch (req.method) {
      case 'GET':
        sendSuccessResponse(res);
        break;
      case 'POST':
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const title = data.title;
            if (title) {
              todos.push({
                title,
                id: uuidv4(),
              });
              sendSuccessResponse(res);
            } else {
              errorHandler(res, ErrorMsg.titleIsRequired);
            }
          } catch (error) {
            errorHandler(res, ErrorMsg.invalidJson);
          }
        });
        break;
      case 'DELETE':
        todos.length = 0;
        sendSuccessResponse(res);
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
  } else if (req.url.startsWith(`${API_PATH}/`)) {
    const [_, id] = /\/todos\/([a-z0-9-]+)/.exec(req.url);
    const targetIndex = todos.findIndex((todo) => todo.id === id);
    if (targetIndex !== -1) {
      switch (req.method) {
        case 'DELETE':
          todos.splice(targetIndex, 1);
          sendSuccessResponse(res);
          break;
        case 'PATCH':
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const title = data.title;
              if (title) {
                todos[targetIndex].title = title;
                sendSuccessResponse(res);
              } else {
                errorHandler(res, ErrorMsg.titleIsRequired);
              }
            } catch (error) {
              errorHandler(res, ErrorMsg.invalidJson);
            }
          });
          break;
        default:
          break;
      }
    } else {
      errorHandler(res);
    }
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);
