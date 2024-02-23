const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const { expressjwt: exjwt } = require('express-jwt');
const path = require('path');
const PORT = 3000;

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
    next();
});


const secretKey = 'My super scret key';
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256'],
});

let users = [
    {
        id: 1,
        username: 'Ram',
        password: '619'
    },
    {
        id: 2,
        username: 'RC',
        password: '221'
    }
]

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    let token;
    for (let user of users) {
        if (username == user.username && password == user.password) {
            token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '180s' });
            break;
        }
    }
    if (token) {
        res.json({
            success: true,
            myContent: 'Logged in Successfully!!',
            err: null,
            token
        });
    }
    else {
        res.status(401).json({
            success: false,
            token: null,
            err: 'Incorrect Username or Password'
        });
    }
});
app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'This content is limited to Logged in people only.'
    });

});

app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'You are not allowed to access the settings unless you login!!'
    });
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialErr: err,
            err: 'Username or password is incorrect'
        });
    }
    else {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`Serving app on ${PORT}`);
});