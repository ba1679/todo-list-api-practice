const http = require('http');
const errorHandler = require('./errorHandler');
const { v4: uuidv4 } = require('uuid');

const API_PATH = '/todos';

const todos = [];

const requestListener = (req, res) => {
  const headers = {
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json',
  };

  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

  if (req.url === API_PATH) {
    let sucessResponse;
    switch (req.method) {
      case 'GET':
        res.writeHead(200, headers);
        sucessResponse = JSON.stringify({
          status: 'success',
          data: todos,
        });
        res.write(sucessResponse);
        res.end();
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
            }
            res.writeHead(200, headers);
            res.write(
              JSON.stringify({
                status: 'success',
                data: todos,
              })
            );
            res.end();
          } catch (error) {
            errorHandler(res);
          }
        });
        break;
      case 'DELETE':
        res.writeHead(200, headers);
        todos.length = 0;
        sucessResponse = JSON.stringify({
          status: 'success',
          data: todos,
        });
        res.write(sucessResponse);
        res.end();
        break;
      // due to CORS, browser will send OPTIONS request before some other requests(preflight)
      case 'OPTIONS':
        res.writeHead(200, headers);
        res.end();
        break;
      default:
        errorHandler(res);
        break;
    }
  } else if (req.url.startsWith(`${API_PATH}/`)) {
    const [_, id] = /\/todos\/([a-z0-9-]+)/.exec(req.url);
    res.writeHead(200, headers);
    const targetIndex = todos.findIndex((todo) => todo.id === id);
    if (targetIndex !== -1) {
      switch (req.method) {
        case 'DELETE':
          todos.splice(targetIndex, 1);
          const sucessResponse = JSON.stringify({
            status: 'success',
            data: todos,
          });
          res.write(sucessResponse);
          res.end();
          break;
        case 'PATCH':
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const title = data.title;
              if (title) {
                todos[targetIndex].title = title;
                const sucessResponse = JSON.stringify({
                  status: 'success',
                  data: todos,
                });
                res.write(sucessResponse);
                res.end();
              } else {
                errorHandler(res);
              }
            } catch (error) {
              errorHandler(res);
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
