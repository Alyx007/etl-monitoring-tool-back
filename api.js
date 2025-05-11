const express = require('express');
const dotenv =require('dotenv');
const homeRouter = require('./routes/home'); 

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use('/', homeRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});