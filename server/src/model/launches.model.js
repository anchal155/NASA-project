const launches = require('./launches.mongo');
const planets = require('./planets.mongo');
const axios = require('axios');

//const launches = new Map();
const defaultFlightNumber = 100;
const spaceX_API_Url = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches(){
    console.log('Downloading launch data...');
    const response = await axios.post(spaceX_API_Url, {
        query: {},
        options: {
            pagination: false,
            populate : [
                {
                    path: 'rocket',
                    select : {
                        name : 1,
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1
                    }
                }
            ]
        }
    });
    const launchDocs = response.data.docs;
    for(const launchDoc of launchDocs){
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        })
        const launch = {
            flightNumber:   launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['data_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers:customers
        };
        console.log(`${launch.flightNumber}, ${launch.mission}`);
        await saveLaunch(launch);
    }
    if (response.status != 200) {
        console.log('Problem downloading launch data...');
        throw new Error('Launch data download failed');
    }
    
}

async function loadLaunchData(){
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    });
    if(firstLaunch){
        console.log('Launch data already loaded');
        return;
    }
    else{
        await populateLaunches();
    } 
}

async function findLaunch(filter){
    return await launches.findOne(filter);
}

async function existsLaunchWithId(launchId){
    return await findLaunch({
        flightNumber: launchId,
    });
}

async function getLatestFlightNumber(){
    const latestLaunch = await launches.findOne().sort('-flightNumber');

    if(!latestLaunch){
        return defaultFlightNumber;
    }
    return latestLaunch.flightNumber;
}

async function abortLaunchById(launchId){
    aborted = await launches.updateOne({
        flightNumber: launchId,
    }, {
        upcoming: false,
        success: false
    });
    return aborted.modifiedCount === 1;
}


async function getAllLaunches(skip, limit){
    return await launches.find({}, {
        '_id':0,
        '__v':0,
    }).sort({flightNumber: 1}).skip(skip).limit(limit);
}

async function saveLaunch(launch){
    await launches.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch,{
        upsert: true,
    });
}

async function scheduleNewLaunch(launch){
    const planet = await planets.findOne({
        kepler_name: launch.target,
    });
    if(!planet){
        throw new Error('No matching planets was found');
    }
    const newFlightNUmber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch,{
        success: true,
        upcoming: true,
        customers: ['ZTM','NASA'],
        flightNumber: newFlightNUmber,
    });

    await saveLaunch(newLaunch);
}

module.exports = {
    loadLaunchData,
    existsLaunchWithId,
    getAllLaunches,
    //addNewLaunch,
    scheduleNewLaunch,
    abortLaunchById
}