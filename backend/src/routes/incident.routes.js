const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Incident routes will be implemented soon' });
});

module.exports = router;