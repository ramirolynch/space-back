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
  ssl: {
    rejectUnauthorized: false,
  },
});

const schema = Joi.object({
  vaccine_name: Joi.string().min(1).max(100),
  location_id: Joi.number().integer(),
});

routes.get("/vaccines", (req, res) => {
  db.manyOrNone("select * from vaccines")
    .then((data) => res.json(data))
    .catch((error) => console.log(error));
});

// this route gets vaccine information by id (useful to display vaccine requirements for each location)
routes.get("/vaccines/:id", (req, res) => {
  db.oneOrNone("select * from vaccines WHERE id = ${id}", {
    id: req.params.id,
  })
    .then((vaccine) => res.json(vaccine))
    .catch((error) => console.log(error));
});

// adding a vaccine to the postgres table 'vaccines'
routes.post("/vaccines", (req, res) => {
  const newvaccine = {
    vaccine_name: req.body.vaccine_name,
    location_id: req.body.location_id,
  };
  const valid = schema.validate(newvaccine);

  if (valid.error) {
    return res.status(400).send(valid.error);
  }

  db.one(
    "INSERT INTO vaccines(vaccine_name, location_id) VALUES(${vaccine_name}, ${location_id}) returning id",
    newvaccine
  )
    .then((id) => {
      return db.oneOrNone("SELECT * FROM vaccines WHERE id = ${id}", {
        id: id.id,
      });
    })
    .then((data) => res.json(data))

    .catch((error) => res.status(500).send(error));
});

// deleting a vaccine by the id of the vaccine

routes.delete("/vaccines/:id", (req, res) => {
  db.many("select * from vaccines")
    .then((vaccines) => {
      let elem: any = vaccines.find((v) => v.id === +req.params.id);

      if (!elem) {
        res.status(404).json({ error: "Vaccine not found" });
      } else {
        db.none("delete from vaccines where id = ${id}", {
          id: +req.params.id,
        });

        res
          .status(200)
          .json({ message: `Vaccine with id ${+req.params.id} deleted` });
      }
    })

    .catch((error) => console.log(error));
});

// // update vaccine by id

routes.put("/vaccines/:id", (req, res) => {
  db.many("select * from vaccines")
    .then((vaccines) => {
      let elem: any = vaccines.find((v) => v.id === +req.params.id);

      if (!elem) {
        res.status(404).json({ error: "Vaccine not found" });
      } else {
        db.none(
          "update vaccines set id=${id}, vaccine_name=${vaccine_name}, location_id=${location_id} where id = ${id}",
          {
            id: +req.params.id,
            vaccine_name: req.body.vaccine_name,
            location_id: req.body.location_id,
          }
        );

        res.send(req.body);
      }
    })

    .catch((error) => console.log(error));
});

export default routes;
