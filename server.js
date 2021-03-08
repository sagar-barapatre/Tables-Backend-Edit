const express = require('express');
const dotenv = require("dotenv");
const bodyparser = require("body-parser");
const path = require('path');
const axios = require("axios");
const mongoose = require("mongoose");
var Userdb = require("./server/model/model");

const app = express();

dotenv.config( { path : 'config.env'} )
const PORT = process.env.PORT || 2000;

// mongodb connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

console.log("MongoDB connected...");

// parse request to body-parser
app.use(bodyparser.urlencoded({ extended: true }));


// set view engine
app.set("view engine", "ejs")
//app.set("views", path.resolve(__dirname, "views/ejs"))

// load assets
app.use('/css', express.static(path.resolve(__dirname, "assets/css")))
app.use('/img', express.static(path.resolve(__dirname, "assets/img")))
app.use('/js', express.static(path.resolve(__dirname, "assets/js")))

// load routers
app.get("/", (req, res) => {
  axios
    .get("http://localhost:8080/api/users")
    .then(function (response) {
      res.render("index", { users: response.data });
    })
    .catch((err) => {
      res.send(err);
    });
});

app.get("/add-user", (req, res) => {
  res.render("add_user");
});

app.get("/update-user", (req, res) => {
  axios
    .get("http://localhost:8080/api/users", { params: { id: req.query.id } })
    .then(function (userdata) {
      res.render("update_user", { user: userdata.data });
    })
    .catch((err) => {
      res.send(err);
    });
});

// API
app.post("/api/users", (req, res) => {
  // validate request
  if (!req.body) {
    res.status(400).send({ message: "Content can not be emtpy!" });
    return;
  }
  const Date = req.body.date;
  const Pricing = req.body.pricing;
  const PickupState = req.body.PickupState;
  const PickupCity = req.body.PickupCity;
  const DropState = req.body.DropState;
  const DropCity = req.body.DropCity;
  const firstandlastname = req.body.name;
  const emailID = req.body.emailid;
  const extraMessages = req.body.messages;

  // new user
  const user = new Userdb({
    Date,
    Pricing,
    PickupState,
    PickupCity,
    DropState,
    DropCity,
    firstandlastname,
    emailID,
    extraMessages,
  });

  // save user in the database
  user
    .save(user)
    .then((data) => {
      //res.send(data)
      res.redirect("/add-user");
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while creating a create operation",
      });
    });
});

app.get("/api/users", (req, res) => {
  if (req.query.id) {
    const id = req.query.id;

    Userdb.findById(id)
      .then((data) => {
        if (!data) {
          res.status(404).send({ message: "Not found user with id " + id });
        } else {
          res.send(data);
        }
      })
      .catch((err) => {
        res.status(500).send({ message: "Erro retrieving user with id " + id });
      });
  } else {
    Userdb.find()
      .then((user) => {
        res.send(user);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Error Occurred while retriving user information",
        });
      });
  }
});

app.put("/api/users/:id", (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "Data to update can not be empty" });
  }

  const id = req.params.id;
  Userdb.updateOne(
    { _id: id },
    { $set: req.body },
    {
      upsert: true,
    }
  )
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot Update user with ${id}. Maybe user not found!`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error Update user information" });
    });
});

app.delete("/api/users/:id", (req, res) => {
  const id = req.params.id;

  Userdb.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: `Cannot Delete with id ${id}. Maybe id is wrong` });
      } else {
        res.send({
          message: "User was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete User with id=" + id,
      });
    });
});

app.listen(PORT, ()=> { console.log(`Server is running on http://localhost:${PORT}`)});
