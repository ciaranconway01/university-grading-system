import express from express;

const router = express.Router();

const requireRegistryAdmin = (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/');
    }
}
if (req.session.role === 'registry_admin') {
    res.send('Welcome')
} else {
    res.send('Access Denied: Registry Admins Only');
}

export default router;