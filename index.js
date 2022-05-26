const express = require("express");
const cors = require("cors") 
require('dotenv').config({path:'./.env'})
const createCheckoutSession = require('./api/checkout');
const webhook = require("./api/webhook");

const app = express();
const port = 8080;

app.use(express.json({
    verify: (req,res,buffer) => req['rawBody'] = buffer,
}))
app.use(cors({origin: true}))

app.get('/', (req,res)=>res.send('hello World! payserver'))
app.get('/hi', (req,res)=>res.send('hi! Here is payserver.'))

app.post('/create-checkout-session', createCheckoutSession);

app.post('/webhook',express.raw({type: 'application/json'}),webhook)

app.listen(process.env.PORT, () => console.log("server listening on port ",process.env.PORT))
// app.listen(port, () => console.log("server listening on port ",port))
