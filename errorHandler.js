const HEADERS = require('./headers');

function errorHandler(res, msg) {
  res.writeHead(404, HEADERS);
  const errorResponse = JSON.stringify({
    status: 'error',
    message: msg || 'Not found',
  });
  res.write(errorResponse);
  res.end();
}

const ErrorMsg = {
  methodNotAllowed: 'Method not allowed',
  titleIsRequired: 'Title is required',
  invalidJson: 'Invalid JSON',
};

module.exports = { errorHandler, ErrorMsg };
