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
  company_name: Joi.string().min(1).max(100),
  price: Joi.number().integer(),
});

routes.get("/transportation", (req, res) => {
  db.manyOrNone("select * from transportation")
    .then((data) => res.json(data))
    .catch((error) => console.log(error));
});

// this route gets transportation information by id (useful to display transportation information for the user before selecting the company for the trip)
routes.get("/transportation/:id", (req, res) => {
  db.oneOrNone("select * from transportation WHERE id = ${id}", {
    id: req.params.id,
  })
    .then((transport) => res.json(transport))
    .catch((error) => console.log(error));
});

// adding a transport to the postgres table 'transportation'
routes.post("/transportation", (req, res) => {
  const newtransport = {
    company_name: req.body.company_name,
    price: req.body.price,
  };
  const valid = schema.validate(newtransport);

  if (valid.error) {
    return res.status(400).send(valid.error);
  }

  db.one(
    "INSERT INTO transportation(company_name, price) VALUES(${company_name}, ${price}) returning id",
    newtransport
  )
    .then((id) => {
      return db.oneOrNone("SELECT * FROM transportation WHERE id = ${id}", {
        id: id.id,
      });
    })
    .then((data) => res.json(data))

    .catch((error) => res.status(500).send(error));
});

// deleting a transport by the id of the transport

routes.delete("/transportation/:id", (req, res) => {
  db.many("select * from transportation")
    .then((transports) => {
      let elem: any = transports.find((t) => t.id === +req.params.id);

      if (!elem) {
        res.status(404).json({ error: "Transport not found" });
      } else {
        db.none("delete from transportation where id = ${id}", {
          id: +req.params.id,
        });

        res
          .status(200)
          .json({ message: `Transport with id ${+req.params.id} deleted` });
      }
    })

    .catch((error) => console.log(error));
});

// // update transport by id

routes.put("/transportation/:id", (req, res) => {
  db.many("select * from transportation")
    .then((transports) => {
      let elem: any = transports.find((t) => t.id === +req.params.id);

      if (!elem) {
        res.status(404).json({ error: "Transport not found" });
      } else {
        db.none(
          "update transportation set id=${id}, company_name=${company_name}, price=${price} where id = ${id}",
          {
            id: +req.params.id,
            company_name: req.body.company_name,
            price: req.body.price,
          }
        );

        res.send(req.body);
      }
    })

    .catch((error) => console.log(error));
});

export default routes;
