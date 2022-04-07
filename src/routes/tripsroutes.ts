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
  departure_date: Joi.date(),
  arrival_date: Joi.date(),
  trip_time: Joi.number().integer(),
  location_id: Joi.number().integer(),
  transportation_id: Joi.number().integer(),
  space_suit_name: Joi.string().min(1).max(100),
});

routes.get("/trips", (req, res) => {
  db.manyOrNone(
    "select trips.id,trips.departure_date,trips.arrival_date,trips.trip_time,transportation.company_name, transportation.price, locations.location_name, locations.distance,locations.unit_of_measure, locations.space_suit_name from trips join transportation on trips.transportation_id = transportation.id join locations on trips.location_id = locations.id;"
  )
    .then((data) => res.json(data))
    .catch((error) => console.log(error));
});

// this route gets trip information by id (useful to display the info of the trip for the user before booking)
routes.get("/trips/:id", (req, res) => {
  db.oneOrNone(
    "select trips.id,trips.departure_date,trips.arrival_date,trips.trip_time,transportation.company_name, transportation.price, locations.location_name, locations.distance,locations.unit_of_measure, locations.space_suit_name from trips join transportation on trips.transportation_id = transportation.id join locations on trips.location_id = locations.id WHERE trips.id = ${id}",
    { id: req.params.id }
  )
    .then((trips) => res.json(trips))
    .catch((error) => console.log(error));
});

routes.get("/trips/:company_name/:suit_name/:location_name", (req, res) => {
  db.oneOrNone(
    "select trips.id,trips.departure_date,trips.arrival_date,trips.trip_time,transportation.company_name, transportation.price, locations.location_name, locations.distance,locations.unit_of_measure, locations.space_suit_name from trips join transportation on trips.transportation_id = transportation.id join locations on trips.location_id = locations.id WHERE transportation.company_name = ${company_name} AND locations.space_suit_name = ${suit_name} AND locations.location_name = ${location_name}",
    {
      id: req.params.company_name,
      suit_name: req.params.suit_name,
      location_name: req.params.location_name,
    }
  )
    .then((trips) => res.json(trips))
    .catch((error) => console.log(error));
});

// this route gets the booked trips by the user id. You have to pass the user id through params

routes.get("/bookedtrip/:id", (req, res) => {
  db.oneOrNone(
    "select users.id, users.first_name, users.last_name, users.vaccine_compliant, trips.departure_date, trips.arrival_date, trips.trip_time, transportation.company_name, transportation.price, locations.location_name, locations.distance, locations.unit_of_measure from trips join transportation on trips.transportation_id = transportation.id join locations on trips.location_id = locations.id join users on trips.id = users.trip_booked where users.id = ${id}",
    { id: req.params.id }
  )
    .then((trip) => res.json(trip))
    .catch((error) => console.log(error));
});

// adding a trip to the postgres table 'trips'
routes.post("/trips", (req, res) => {
  const newtrip = {
    departure_date: req.body.departure_date,
    arrival_date: req.body.arrival_date,
    trip_time: req.body.trip_time,
    location_id: req.body.location_id,
    transportation_id: req.body.transportation_id,
    space_suit_name: req.body.space_suit_name,
  };
  const valid = schema.validate(newtrip);

  if (valid.error) {
    return res.status(400).send(valid.error);
  }

  db.one(
    "INSERT INTO trips(departure_date, arrival_date, trip_time, location_id, transportation_id, space_suit_name) VALUES(${departure_date}, ${arrival_date}, ${trip_time}, ${location_id}, ${transportation_id}, ${space_suit_name}) returning id",
    newtrip
  )
    .then((id) => {
      return db.oneOrNone("SELECT * FROM trips WHERE id = ${id}", {
        id: id.id,
      });
    })
    .then((data) => res.json(data))

    .catch((error) => res.status(500).send(error));
});

// deleting a trip by the id
routes.delete("/trips/:id", (req, res) => {
  db.many("select * from trips")
    .then((trips) => {
      let elem: any = trips.find((t) => t.id === +req.params.id);

      if (!elem) {
        res.status(404).json({ error: "Trip not found" });
      } else {
        db.none("delete from trips where id = ${id}", {
          id: +req.params.id,
        });

        res
          .status(200)
          .json({ message: `Trip with id ${+req.params.id} deleted` });
      }
    })

    .catch((error) => console.log(error));
});

// update trip by id

routes.put("/trips/:id", (req, res) => {
  db.many("select * from trips")
    .then((trips) => {
      let elem: any = trips.find((t) => t.id === +req.params.id);

      if (!elem) {
        res.status(404).json({ error: "Trip not found" });
      } else {
        db.none(
          "update trips set id=${id}, departure_date=${departure_date}, arrival_date=${arrival_date}, trip_time=${trip_time}, location_id=${location_id}, transportation_id=${transportation_id} where id = ${id}",
          {
            id: +req.params.id,
            departure_date: req.body.departure_date,
            arrival_date: req.body.arrival_date,
            trip_time: req.body.trip_time,
            location_id: req.body.location_id,
            transportation_id: req.body.transportation_id,
          }
        );

        res.send(req.body);
      }
    })

    .catch((error) => console.log(error));
});

export default routes;
