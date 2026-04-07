import express from 'express';
import connection from '../db.js'

const router = express.Router();

router.get('/', (req, res) => {
    if (!req.session.isLoggedIn || req.session.role !== 'registry_admin') {
        return res.redirect('/');
    }

    res.render('admin-dashboard', {
        username: req.session.username,
        role: req.session.role
    });
});




export default router;