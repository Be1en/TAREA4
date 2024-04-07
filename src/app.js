const express = require("express");
const { engine } = require("express-handlebars");
const myconnection = require("express-myconnection");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const clientesRoutes = require("./routes/clientes");
const productosRoutes = require("./routes/productos");

/*
const mysqlConfig = {
  host: "node_mysql",
  user: "valeria",
  password: "valeria",
  database: "nodedb"
};*/

let con = null;

const app = express();
app.set("port", 5000);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.set("views", __dirname + "/views");
app.engine(
  ".hbs",
  engine({
    extname: ".hbs",
  })
);
app.set("view engine", "hbs");

app.use(myconnection(mysql, {
  host: "node_mysql",
  user: "valeria",
  password: "valeria",
  database: "nodedb"
}, 'single' ));


app.use("/", clientesRoutes);
app.use("/", productosRoutes);

// Crear la tabla clientes si no existe y agregar registros predefinidos
app.use("/", (req, res, next) => {
  req.getConnection((err, connection) => {
    if (err) return next(err);
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS clientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        correo VARCHAR(255) NOT NULL,
        tel VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )  ENGINE=INNODB;
    `;
    const selectRecordsSQL = `SELECT * FROM clientes LIMIT 1`;
    connection.query(createTableSQL, (err, result) => {
      if (err) return next(err);
      // Verificar si ya hay registros en la tabla
      connection.query(selectRecordsSQL, (err, rows) => {
        if (err) return next(err);
        if (rows.length === 0) {
          // Insertar registros predefinidos solo si la tabla está vacía
          const insertRecordsSQL = `
            INSERT INTO clientes (nombre, correo, tel) VALUES
            ('Cliente 1', 'cliente1@example.com', '123456789'),
            ('Cliente 2', 'cliente2@example.com', '987654321'),
            ('Cliente 3', 'cliente3@example.com', '555555555');
          `;
          connection.query(insertRecordsSQL, (err, result) => {
            if (err) return next(err);
            console.log("Registros de clientes insertados correctamente");
          });
        }
        next(); // Llama al siguiente middleware
      });
    });
  });
});

// Crear la tabla productos si no existe y agregar registros predefinidos
app.use("/", (req, res, next) => {
  req.getConnection((err, connection) => {
    if (err) return next(err);
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto VARCHAR(255) NOT NULL,
        precio DOUBLE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )  ENGINE=INNODB;
    `;
    const selectRecordsSQL = `SELECT * FROM productos LIMIT 1`;
    connection.query(createTableSQL, (err, result) => {
      if (err) return next(err);
      // Verificar si ya hay registros en la tabla
      connection.query(selectRecordsSQL, (err, rows) => {
        if (err) return next(err);
        if (rows.length === 0) {
          // Insertar registros predefinidos solo si la tabla está vacía
          const insertRecordsSQL = `
            INSERT INTO productos (producto, precio) VALUES
            ('Producto 1', 10.99),
            ('Producto 2', 20.50),
            ('Producto 3', 15.75);
          `;
          connection.query(insertRecordsSQL, (err, result) => {
            if (err) return next(err);
            console.log("Registros de productos insertados correctamente");
          });
        }
        next(); // Llama al siguiente middleware
      });
    });
  });
});


  app.get("/", (req, res) => {
    res.render("index");
  });

  app.listen(app.get("port"), () => {
    console.log("Listening on port ", app.get("port"));
  });