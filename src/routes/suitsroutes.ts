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
  suit_name: Joi.string().min(1).max(100),
  suit_color: Joi.string().min(1).max(100),
  temp_min: Joi.number().integer(),
  temp_max: Joi.number().integer(),
  suit_size: Joi.string().min(1).max(100),
});

routes.get("/suits", (req, res) => {
  db.manyOrNone("select * from space_suits")
    .then((data) => res.json(data))
    .catch((error) => console.log(error));
});

// this route gets suit information by id (useful to display suit information for the user before selecting the suit)
routes.get("/suits/:id", (req, res) => {
  db.oneOrNone("select * from space_suits WHERE id = ${id}", {
    id: req.params.id,
  })
    .then((suit) => res.json(suit))
    .catch((error) => console.log(error));
});

// adding a suit to the postgres table 'space_suits'
routes.post("/suits", (req, res) => {
  const newsuit = {
    suit_name: req.body.suit_name,
    suit_color: req.body.suit_color,
    temp_min: req.body.temp_min,
    temp_max: req.body.temp_max,
    suit_size: req.body.suit_size,
  };
  const valid = schema.validate(newsuit);

  if (valid.error) {
    return res.status(400).send(valid.error);
  }

  db.one(
    "INSERT INTO space_suits(suit_name, suit_color, temp_min, temp_max, suit_size) VALUES(${suit_name}, ${suit_color}, ${temp_min}, ${temp_max}, ${suit_size}) returning id",
    newsuit
  )
    .then((id) => {
      return db.oneOrNone("SELECT * FROM space_suits WHERE id = ${id}", {
        id: id.id,
      });
    })
    .then((data) => res.json(data))

    .catch((error) => res.status(500).send(error));
});

// deleting a suit by the id of the suit

routes.delete("/suits/:id", (req, res) => {
  db.many("select * from space_suits")
    .then((suits) => {
      let elem: any = suits.find((s) => s.id === +req.params.id);

      if (!elem) {
        res.status(404).json({ error: "Space Suit not found" });
      } else {
        db.none("delete from space_suits where id = ${id}", {
          id: +req.params.id,
        });

        res
          .status(200)
          .json({ message: `Space Suit with id ${+req.params.id} deleted` });
      }
    })

    .catch((error) => console.log(error));
});

// // update suit by id

routes.put("/suits/:id", (req, res) => {
  db.many("select * from space_suits")
    .then((suits) => {
      let elem: any = suits.find((s) => s.id === +req.params.id);

      if (!elem) {
        res.status(404).json({ error: "Space Suit not found" });
      } else {
        db.none(
          "update space_suits set id=${id}, suit_name=${suit_name}, suit_color=${suit_color}, temp_min=${temp_min}, temp_max=${temp_max}, suit_size=${suit_size} where id = ${id}",
          {
            id: +req.params.id,
            suit_name: req.body.suit_name,
            suit_color: req.body.suit_color,
            temp_min: req.body.temp_min,
            temp_max: req.body.temp_max,
            suit_size: req.body.suit_size,
          }
        );

        res.send(req.body);
      }
    })

    .catch((error) => console.log(error));
});

export default routes;
