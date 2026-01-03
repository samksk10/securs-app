const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Check-in routes will be implemented soon' });
});

module.exports = router;