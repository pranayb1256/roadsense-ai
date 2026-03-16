import app from "./app";
import dotenv from "dotenv"
dotenv.config({
    path:"./.env"
})
const Port = process.env.PORT;

app.listen(Port, () => {
  console.log(`Server running on port http://localhost:${Port}`);
});
