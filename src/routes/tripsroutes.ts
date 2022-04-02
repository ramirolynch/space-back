// require the express module
import express from "express";
import pg from "pg-promise";

const Joi = require("joi");
// create a new Router object
const routes = express.Router();

const db = pg()({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "casapuerta",
  database: "SpaceTravel",
});

const schema = Joi.object({
  venue_name: Joi.string().min(1).max(200).required(),
  description: Joi.string().min(1).max(500),
  street_address: Joi.string().min(1).max(200),
  city: Joi.string().min(1).max(150),
  zip_code: Joi.string().min(1).max(11),
  state_code: Joi.string().length(2),
});

routes.get("/trips", (req, res) => {
  db.manyOrNone(
    "select trips.id,trips.departure_date,trips.arrival_date,trips.trip_time,transportation.company_name, transportation.price, locations.location_name, locations.distance,locations.unit_of_measure from trips join transportation on trips.transportation_id = transportation.id join locations on trips.location_id = locations.id;"
  )
    .then((data) => res.json(data))
    .catch((error) => console.log(error));
});

// routes.get("/venues/:id", (req, res) => {
//   db.oneOrNone("SELECT * FROM venues WHERE id = ${id}", { id: req.params.id })
//     .then((todos) => res.json(todos))
//     .catch((error) => console.log(error));
// });

// // adding a venue to the postgres table 'venues'
// routes.post("/venues", (req, res) => {
//   const newvenue = {
//     venue_name: req.body.venue_name,
//     description: req.body.description,
//     street_address: req.body.street_address,
//     city: req.body.city,
//     zip_code: req.body.zip_code,
//     state_code: req.body.state_code,
//   };
//   const valid = schema.validate(newvenue);

//   if (valid.error) {
//     return res.status(400).send(valid.error);
//   }

//   db.one(
//     "INSERT INTO venues(venue_name, description, street_address, city, zip_code, state_code) VALUES(${venue_name}, ${description}, ${street_address}, ${city}, ${zip_code}, ${state_code}) returning id",
//     newvenue
//   )
//     .then((id) => {
//       return db.oneOrNone("SELECT * FROM venues WHERE id = ${id}", {
//         id: id.id,
//       });
//     })
//     .then((data) => res.json(data))

//     .catch((error) => res.status(500).send(error));
// });

// // deleting a venue by the id
// routes.delete("/venues/:id", (req, res) => {
//   db.many("select * from venues")
//     .then((venue) => {
//       let elem: any = venue.find((e) => e.id === +req.params.id);

//       if (!elem) {
//         res.status(404).json({ error: "Venue not found" });
//       } else {
//         db.none("delete from venues where id = ${id}", {
//           id: +req.params.id,
//         });

//         res
//           .status(200)
//           .json({ message: `Venue with id ${+req.params.id} deleted` });
//       }
//     })

//     .catch((error) => console.log(error));
// });

// routes.put("/venues/:id", (req, res) => {
//   db.many("select * from venues")
//     .then((newvenue) => {
//       let elem: any = newvenue.find((e) => e.id === +req.params.id);

//       if (!elem) {
//         res.status(404).json({ error: "Venue not found" });
//       } else {
//         db.none(
//           "update venues set id=${id}, venue_name=${venue_name}, description=${description}, street_address=${street_address}, city=${city}, zip_code=${zip_code}, state_code=${state_code} where id = ${id}",
//           {
//             id: +req.params.id,
//             venue_name: req.body.venue_name,
//             description: req.body.description,
//             street_address: req.body.street_address,
//             city: req.body.city,
//             zip_code: req.body.zip_code,
//             state_code: req.body.state_code,
//           }
//         );

//         res.send(req.body);
//       }
//     })

//     .catch((error) => console.log(error));
// });

// routes.get("/mics", (req, res) => {
//   db.manyOrNone(
//     `
//     select miclist.mic_name, comedians.first_name, comedians.last_name, venues.venue_name from miclist
//     join comedians on miclist.comedian_id = comedians.id
//     join venues on miclist.venue_id = venues.id;
//     `
//   )
//     .then((data) => res.json(data))
//     .catch((error) => console.log(error));
// });

export default routes;
