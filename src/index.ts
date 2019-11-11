import express from 'express';
import fileUpload from "express-fileupload";

const app = express();

import indexRoutes from './routes/index';

// default options
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })); 

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

// middlewares
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(indexRoutes);

app.listen(4000, ()=>{
    console.log('Server on port', 4000);
});