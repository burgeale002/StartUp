const express = require('express');
const app = express();
const DB = require('./database.js');

// The service port. In production the frontend code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Serve up the frontend static content hosting
app.use(express.static('public'));

// Router for service endpoints
// Use this to contact the scores database
const apiRouter = express.Router();
app.use(`/api`, apiRouter);

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

let allScores= [];

// GetScores
apiRouter.get('/leaderScores', async (req, res)=>{
  allScores= await DB.findScores();
  res.send(allScores);
})

// SubmitScore
apiRouter.post('/leaderScore', async (req, res) => {
  allScores= await DB.findScores();
  console.log(allScores);
  scores = updateLeaderScores(req.body, allScores);
  await DB.saveScores(scores);
  allScores= await DB.findScores();
  res.send(allScores);
});

//updates the scores list locally
function updateLeaderScores(newScore, allScores){
  let greater=false;
  //search and see if score is in current list
  for(const [i, oldScore] of allScores.entries()){
    if(parseInt(newScore.score, 10) > parseInt(oldScore.score, 10)){
      allScores.splice(i, 0, newScore);
      greater=true;
      break;
    }
  }
  //add new score to end of list
  if(!greater){
      allScores.push(newScore);
   
  }
  if(allScores.length>5){
    allScores.length=5;
  }
  return allScores;
}
