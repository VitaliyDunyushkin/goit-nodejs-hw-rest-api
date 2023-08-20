const mongoose = require("mongoose");
const app = require("./app");

const { DB_HOST, PORT } = process.env;

mongoose
  .connect(DB_HOST)
  .then(() => app.listen(PORT, () => console.log("Server started! :)")))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
