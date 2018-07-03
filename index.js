const express = require('express');
const bodyParser = require('body-parser');
// 產生jwt
const jwt = require('jsonwebtoken');

// 進入url時候要判斷是否有token
const expressjwt = require('express-jwt');

// 跨域
// https://www.npmjs.com/package/cors
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8888;

// 假設db資料
const users = [
    { id: 1, username: 'a', password: 123 },
    { id: 2, username: 'b', password: 456 }
];

app.use(bodyParser.json());
// 加入cors，他可以設定全部route都可以cors或是single route
// all route
app.use(cors());

const secretKey = 'mysupersecret';

// token解析用，設定的secert
const jwtCheck = expressjwt({
    secret: secretKey
});

// single
app.get('/single', cors(), function(req, res, next) {
    res.json({ msg: 'This is CORS-enabled for a Single Route' });
});

app.post('/login', (req, res) => {
    // 透過bodyParser可以取道
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).send(`plz enter username and password`);
        return;
    }

    // 如果有符合
    const isUser = users.find(user => {
        return user.username === username && user.password === password;
    });

    // 如果不存在
    if (!isUser) {
        res.status(401).send('user not found');
        return;
    }

    // jwt sign
    // 會變成字串
    const token = jwt.sign(
        {
            sub: isUser.id,
            username: isUser.username
        },
        secretKey,
        { expiresIn: 60 }
    );

    res.status(200).send({ token });
});

app.get('/resource', (req, res) => {
    res.status(200).send(`public`);
});

// 需要含Bearer Token
app.get('/resource/secret', jwtCheck, (req, res) => {
    res.status(200).send(`被你偷看到了...`);
});

app.get('/status', (req, res) => {
    const localTime = new Date().toLocaleTimeString();
    res.status(200).send(`server time ${localTime}`);
});

app.get('*', (req, res) => {
    res.sendStatus(404);
});

app.listen(PORT, () => {
    console.log(`server on port ${PORT}`);
});
