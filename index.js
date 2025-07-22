const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const levelRoutes = require('./routes/levelRoutes');
const energyRoutes = require('./routes/energyRoutes');
const progressRoutes = require('./routes/progressRoutes');

app.use('/api/progress', progressRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api', levelRoutes);

app.use('/api/levels', levelRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});