#!/usr/bin/env node

const http = require('http');
const fs   = require('fs');

const options = {
  host:  'localhost',
  port:  8888,
  app:   '',
  index: 'index.html',
  help:  false
};

const optionsMap = {
  host:  { synonym: 'h', description: 'Host name for server'         },
  port:  { synonym: 'p', description: 'Port number to listen'        },
  app:   { synonym: 'a', description: 'App directory name to run'    },
  index: { synonym: 'i', description: 'Index file. e.g.) index.html' }
};

function setOption(arg) {
  if (arg === '-h' || arg === '--help') {
    options.help = true;
    return;
  }

  let [key, value] = arg.split('=');
  key = key.replace(/^-+/, '').toLowerCase();

  const names = Object.keys(optionsMap);
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    if (key === name || key === optionsMap[name].synonym) {
      options[name] = value;
    }
  }
}

function showHelp() {
  const names = Object.keys(optionsMap);
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    console.log(`\t--${name}\t\t${optionsMap[name].description}`);
  }
}

function parseArgv(argv) {
  for (let i = 0; i < argv.length; i++) {
    setOption(argv[i]);
  }
}

function extensionToMimeType(extension) {
  switch (extension) {
    case 'js':    return 'text/javascript';
    case 'css':   return 'text/css';
    case 'json':  return 'text/json';
    case 'txt':   return 'text/txt';
    case 'png':   return 'image/png';
    case 'jpg':   return 'image/jpeg';
    case 'gif':   return 'image/gif';
    case 'woff':  return 'font/woff';
    case 'woff2': return 'font/woff2';
  }

  return null;
}

function render404(response) {
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('404');
  response.end();
}

function render200(response, content, contentType) {
  response.writeHead(200, {'Content-Type': contentType});
  response.write(content);
  response.end();
}

function control(request, response) {
  let [url, query] = request.url.split('?');
  if (url === '/') url = `/${options.index}`;

  const chunks = url.split('.');
  const extension = chunks[chunks.length - 1].toLowerCase();
  const contentType = extensionToMimeType(extension) || 'text/html';

  let appDir = options.app;
  if (appDir.indexOf('/') != 0) {
    appDir = `${__dirname}/${options.app}`;
  }

  fs.readFile(`${appDir}${url}`, (error, content) => {
    if (error) {
      console.log(error);
      return render404(response);
    }

    render200(response, content, contentType);
  });
}

function main() {
  parseArgv(process.argv);

  if (options.help === true) {
    return showHelp();
  }

  const server = http.createServer(control);
  console.log(`listening on ${options.host}:${options.port}...`);
  server.listen(options.port, options.host);
}

main();
