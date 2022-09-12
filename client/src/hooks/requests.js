const api_url = 'http://localhost:8000/v1';

async function httpGetPlanets() {
   const response = await fetch(`${api_url}/planets`);
   return response.json();
  // Load planets and return as JSON.
}

async function httpGetLaunches() {
  const response = await fetch(`${api_url}/launches`);
  const fetchedLaunches = await response.json();
  return fetchedLaunches.sort((a,b) => {
    return a.flightNumber - b.flightNumber;
  });
}

async function httpSubmitLaunch(launch) {
  try{    
      return await fetch(`${api_url}/launches`, {
      method : "post",
      headers: {
        "Content-Type" : "application/json"
      },
      body : JSON.stringify(launch)
      });
    }
  catch(error){
    return {
      ok: false
    }
  }

}

async function httpAbortLaunch(id) {
  try {
      return await fetch(`${api_url}/launches/${id}`, {
      method:"delete"
    })
  }catch(error){
    console.log(error);
    return {
      ok: false
    }
  }
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};