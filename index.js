var express = require('express')
var app = express()
 
app.use(express.static('public'));
 
app.listen(process.env.PORT || 3000);

console.log('started server on port', process.env.PORT || 3000);
