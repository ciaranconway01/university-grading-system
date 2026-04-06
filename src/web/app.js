import express from "express";
import connection from "./db.js";
import serverSession from 'express-session';


// Routes
import authenticationRoute from './routes/authentication.js';


const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set('views', 'src/web/views');


app.use(serverSession(
    {
        secret: "HedClass",
        saveUninitialized: true,
        cookie: { maxAge: 1000 * 60 * 60 * 1 },
        resave: false,
    }));

app.use(express.urlencoded({ extended: true }));




app.use('/', authenticationRoute);

app.listen(PORT, () => { console.log('Server is running') });