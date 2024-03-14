function ErrorHandler(res) {
  const headers = {
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json',
  };
  res.writeHead(404, headers);
  const errorResponse = JSON.stringify({
    status: 'error',
    message: 'Not found',
  });
  res.write(errorResponse);
  res.end();
}

module.exports = ErrorHandler;
