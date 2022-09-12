const express  = require('express');

const {httpGetAllLaunches, httpAddnewLaunch, httpAbortLaunch} = require('./launches.controller')


const launchesRouter = express.Router();

launchesRouter.get('/', httpGetAllLaunches);
launchesRouter.post('/', httpAddnewLaunch);
launchesRouter.delete('/:id', httpAbortLaunch)

module.exports = launchesRouter;
