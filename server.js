const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
const mysql = require('mysql2');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// start the express.js server on the port 
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });