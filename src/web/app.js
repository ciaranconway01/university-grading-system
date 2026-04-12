import express from "express";
import connection from "./db.js";
import serverSession from 'express-session';



// Routes
import authenticationRoute from './routes/authentication.js';
import adminRoutes from './routes/admin.js'
import officerRoutes from './routes/officer.js'

const app = express();
const PORT = 3000;

// This tells Express to use embedded EJS to render the HTML page
app.set("view engine", "ejs");

// Telling express where to find the EJS files live so Express can find them
app.set('views', 'src/web/views');


app.use(serverSession(
    {
        secret: "HedClass",
        saveUninitialized: true,
        cookie: { maxAge: 1000 * 60 * 60 * 1 },
        resave: false,
    }));

    
app.use(express.urlencoded({ extended: true }));


// Connecting our imported routers with specific URL paths
app.use('/', authenticationRoute);
app.use('/admin', adminRoutes);
app.use('/officer', officerRoutes);

app.listen(PORT, () => { console.log('Server is running') });