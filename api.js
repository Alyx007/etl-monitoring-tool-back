const express = require('express');
const dotenv =require('dotenv');
//const homeRouter = require('./routes/home'); 

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

//app.use('/', homeRouter);

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>ETL Monitor</title></head>
      <body>
        <h1>Welcome to ETL Monitor!</h1>
        <p>Server is running ✅</p>
      </body>
    </html>
        `);
});

app.listen(port, () => {
    console.log(`Server is running on: http://localhost:${port}`);
});