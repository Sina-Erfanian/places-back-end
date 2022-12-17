const express = require("express");
const path = require("path");
const fs = require("fs");
const HttpError = require("./models/http-error");
const placesRoutes = require("./routes/places-routes");
const usersRoute = require("./routes/users-routes");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/uploads/images", express.static(path.join("uploads", "images")));
app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoute);

app.use((req, res, next) => {
  const error = new HttpError("Could not found this route", 404);
  throw error;
});

app.use((error, req, res, next) => {
  // file property added by multer
  if (req.file) {
    // if we have error roll back (actually this below code means that if we have an error in everywhere we don't wanna save the image uploaded file in uploads/images folder)
    fs.unlink(req.file.path, (err) => console.log(err));
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yjazuaq.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(5000, (err) => {
      if (err) console.log(err);
      console.log("Started on port 5000");
    });
  })
  .catch((err) => console.log(err));
