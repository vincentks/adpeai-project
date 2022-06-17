const http = require("http");
const fs = require('fs');
const PORT = process.env.PORT || 3000;
const TaskController = require('./controller/taskController');

const server = http.createServer(async (req, res) => {
    // URL format: /api/top-earner/:year
    if (req?.url?.includes('/api/top-earner') && req?.method === 'GET') {
        const year = req?.url?.split("/")[3];

        if (!year || typeof Number(year) !== 'number' || year?.length !== 4) {
            console.log(`Bad Request: Year is a required field. Request=${year}`);
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({message: 'Bad Request', status: 400}));
        } else {
            try {
                const topEarner = await new TaskController().getTopEarner(year);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(topEarner));
            } catch (error) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify(error));
            }
        }
    } else if (req?.url?.includes('/api/submit-task') && req?.method?.toUpperCase() === 'POST') {
        const data = []

        req.on('data', async (chunk) => {
            data.push(chunk);
        });

        req.on('end', async () => {
            const requestBody = JSON.parse(data);

            if (!requestBody?.id) {
                console.log(`Bad Request: ID is a required field. Request=${JSON.stringify(requestBody)}`);
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({message: 'Bad Request', status: 400}));
            } else if (!requestBody?.result?.length) {
                console.log(`Bad Request: Result is a required field. Request=${JSON.stringify(requestBody)}`);
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({message: 'Bad Request', status: 400}));
            } else {
                try {
                    const result = await new TaskController().postSubmitTask(requestBody);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(result));
                } catch (error) {
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(error));
                }
            }
        });
    } else {
        fs.readFile('./views/index.html',function (err, data){
            res.writeHead(200, {'Content-Type': 'text/html','Content-Length': data.length});
            res.write(data);
            res.end();
        });
    }
});

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});