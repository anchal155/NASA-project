const http = require('http');
require('dotenv').config();
const app = require('./app');
const { loadPlanetsData } = require('./model/planets.model');
const { loadLaunchData } = require('./model/launches.model');
const {mongoConnect} = require('./services/mongo');

const planetsModel = require('./model/planets.model');
const PORT = process.env.PORT || 8000;

const server = http.createServer(app);


async function startServer(){
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchData();
    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}....`);
    });
    
}

startServer();

