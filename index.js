const express = require('express');
const app = express();

require('./startup/server')(app);
require('./startup/route')(app);