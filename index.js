const http = require('http');
const url = require('url');
const {createHash} = require('crypto');

const calculateHash = (str) => {
	const hash = createHash('sha256');
	hash.update(str);
	return hash.digest('hex');
}

const server = http.createServer((req, res) => {
	const parsedUrl = url.parse(req.url, true);
	const path = parsedUrl.path;
	console.info(path);
	if (path === "/page1") {
		res.writeHead(200, {'cache-control': "no-store"})
		res.end(createpage(1));
	} else {
		if (req.headers['if-none-match'] === calculateHash(createpage(2))) {
			res.writeHead(304);
			res.end();
			return;
		}
		res.writeHead(200,
			{
				'cache-control': "max-age=10, must-revalidate",
				"etag": calculateHash(createpage(2))
			});
		res.end(createpage(2));
	}
});

const createpage = (page) => {
	return `<html>
	<head>
		<title>Page ${page}</title>
	</head>
	<body>
		<h1>Page ${page}</h1>
		<a href="/page1">Page1</a>
		<a href="/page2">Page2</a>
		${Array.from({length: 1000},
		() => Math.random()).map((n, index) => `<p>${index}</p>`).join('')}
	</body>
	</html>`;
}
const port = 3000;
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
