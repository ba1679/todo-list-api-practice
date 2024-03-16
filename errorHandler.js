const HEADERS = require('./headers');

function ErrorHandler (res) {
  res.writeHead(404, HEADERS);
  const errorResponse = JSON.stringify({
    status: 'error',
    message: 'Not found',
  });
  res.write(errorResponse);
  res.end();
}

module.exports = ErrorHandler;
