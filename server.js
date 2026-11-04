//step 1
const express = require("express");
const app = express();
const morgan = require("morgan");
const port = 3001;
const cors = require("cors");
const { readdirSync } = require("fs");

//middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
//routes 
readdirSync("./routes").map((c) => app.use("/api", require("./routes/" + c)));
//step 2
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
