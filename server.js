const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const webpackMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config')();

const origin = 'http://127.0.0.1';
const port = 9000;
const server = http.createServer(app);

const compiler = webpack(webpackConfig);

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	return next();
});

app.use(
	webpackMiddleware(compiler, {
		publicPath: `${origin}/javascripts`,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
			'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
		},
	}),
);

app.use('/', (req, res) => {
	res.send(`
        <html>
            <head>
                <title>Redivis interview project</title>
            </head>
            <body>
            	<div id="root"></div>
            	<script src="${origin}:${port}/javascripts/index.js"></script>
			</body>
        </html>
	`);
});

app.use((req, res) => {
	res.sendStatus(404);
});

server.listen(port);

console.log(`Working... compiled assets will be available at http://localhost:${port}`);
