import express from "express";
import cors from "cors";


const app = express();
const PORT = process.env.PORT;
app.use(cors({ origin: "*" }));

app.get('/', (req, res) => {
	res.send('Server working correctly')
})



app.listen(PORT, () => {
	console.log(`App listening at http://localhost:${PORT}`)
})
