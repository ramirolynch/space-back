require("dotenv").config();
// require the express module
import express from "express";
import pg from "pg-promise";

const Joi = require("joi");
// create a new Router object
const routes = express.Router();

const db = pg()({
  host: process.env.PG_HOST,
  port: 5432,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

const schema = Joi.object({
  location_name: Joi.string().min(1).max(100),
  distance: Joi.number().integer(),
  unit_of_measure: Joi.string().min(1).max(100),
});

routes.get("/locations", (req, res) => {
  db.manyOrNone("select * from locations")
    .then((data) => res.json(data))
    .catch((error) => console.log(error));
});

// this route gets location information by id (useful to display location information for the user before selecting the destination trip)
routes.get("/locations/:id", (req, res) => {
  db.oneOrNone("select * from locations WHERE id = ${id}", {
    id: req.params.id,
  })
    .then((location) => res.json(location))
    .catch((error) => console.log(error));
});

// adding a location to the postgres table 'locations'
routes.post("/locations", (req, res) => {
  const newlocation = {
    location_name: req.body.location_name,
    distance: req.body.distance,
    unit_of_measure: req.body.unit_of_measure,
  };
  const valid = schema.validate(newlocation);

  if (valid.error) {
    return res.status(400).send(valid.error);
  }

  db.one(
    "INSERT INTO locations(location_name, distance, unit_of_measure) VALUES(${location_name}, ${distance}, ${unit_of_measure}) returning id",
    newlocation
  )
    .then((id) => {
      return db.oneOrNone("SELECT * FROM locations WHERE id = ${id}", {
        id: id.id,
      });
    })
    .then((data) => res.json(data))

    .catch((error) => res.status(500).send(error));
});

// deleting a location by the id of the location

routes.delete("/locations/:id", (req, res) => {
  db.many("select * from locations")
    .then((locations) => {
      let elem: any = locations.find((l) => l.id === +req.params.id);

      if (!elem) {
        res.status(404).json({ error: "Location not found" });
      } else {
        db.none("delete from locations where id = ${id}", {
          id: +req.params.id,
        });

        res
          .status(200)
          .json({ message: `Location with id ${+req.params.id} deleted` });
      }
    })

    .catch((error) => console.log(error));
});

// // update location by id

routes.put("/locations/:id", (req, res) => {
  db.many("select * from locations")
    .then((locations) => {
      let elem: any = locations.find((l) => l.id === +req.params.id);

      if (!elem) {
        res.status(404).json({ error: "Location not found" });
      } else {
        db.none(
          "update locations set id=${id}, location_name=${location_name}, distance=${distance}, unit_of_measure=${unit_of_measure} where id = ${id}",
          {
            id: +req.params.id,
            location_name: req.body.location_name,
            distance: req.body.distance,
            unit_of_measure: req.body.unit_of_measure,
          }
        );

        res.send(req.body);
      }
    })

    .catch((error) => console.log(error));
});

export default routes;
