const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
require('dotenv').config()

// mongoose
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }).
  then(
    () => { console.log('connected') }
  ).
  catch(
    () => { console.log('connection error') }
  )

// Schemas
const { userSchema, exerciseSchema}  = require("./user_model");

let User = mongoose.model("User", userSchema);
let Exercise = mongoose.model("Exercise", exerciseSchema);

app.use(cors())
app.use(express.static('public'))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/users", (req, res) => {

  try {
    if (req.body.username) {
      console.log(req.body["username"]);
      let user = new User({ username: req.body["username"]});
      console.log(user);
      user.save( (err, data) => {
          if (err) { 
            res.status(400).json(
              {
                status: 400,
                message: "Error al guardar el usuario"
              }
            );
          }
          console.log(data);
          res.status(200).json({
            username: data.username,
            _id: data._id.toString()
          });
        }
      )
    } else {
      res.status(400).json({
        status: 400,
        message: "Debe enviar el nombre de usuario"
      });
    }
   
  } catch {
    throw new Error('Error al crear el usuario')
  }
  

});

app.get("/api/users", (req, res) => {
  let users = User.find(
    (err, data) => {
      if (err) res.status(400).json({ message: "Error al realizar a consulta"});
      res.status(200).json(data);
    }
  )
  
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  let {description, duration, date} = req.body;

  if (date === undefined || date === null){
    date = new Date()
  } else {
    date = new Date(date);
  }
  if (date == "Invalid Date"){
    date = new Date()
  }
    
  try {
    User.findById(userId, (err, userData) => {
      if (err || !userData) {
        req.status(400).send("id no valida")
      } else {
        const newExercise = new Exercise({
          userId: userData._id,
          description,
          duration,
          date: date.toDateString()
        });
        newExercise.save( (err, data ) => {
          if (err || !data) {
            res.status(400).send("ocurrió un error al guardar")
          } else {
            let {description, duration, date, _id } = data;
            res.status(200).json({
              username: userData.username,
              description,
              duration,
              date: date.toDateString(),
              _id: userData._id,
            });
          }
        })
      }
    })
  } catch {
    throw new Error('Ha ocurrido un error al guardar los campos')
  }
});

const populateLogResponse = (user, log) => {
  // función utilizada para popular la response del endpoint /api/users/:_id/logs
  let logResponse = {
    username: user.username,
    count: log.length,
    _id: user._id.toString(),
    log: log.map(({description, duration, date}) => {
      return {
        description: description,
        duration: duration,
        date: date.toDateString()
      }
    })
  }
  return logResponse;
}

app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const _limit = req.query["limit"] || 10000
  const queryFilter = {
    userId: userId,
    date: {
      $gte: req.query["from"] || '1900-01-01',
      $lte: req.query["to"] || new Date()  
    }
  }
  const user = User.findById(userId, (err, userData) => {
    if (err || !userData) res.status(400).send("Id no encontrada")

    const logs = Exercise.find(queryFilter).limit( _limit ).exec( (err, data) => {
      if (err || !userData) res.status(400).send("Error al buscar los registros")
      // console.log(populateLogResponse(userData, data));
      res.status(200).send(
        populateLogResponse(userData, data)
      );
    });
    
  })
})





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
