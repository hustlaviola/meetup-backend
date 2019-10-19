const functions = require('firebase-functions');
const app = require('express')();
const { FBAuth } = require('./middlewares/FBAuth');
const { authError } = require('./middlewares/authValidator');
const { getPosts, createPost } = require('./controllers/posts');
const { signup, login } = require('./controllers/users');

app.get('/posts', FBAuth, getPosts)

app.post('/posts', FBAuth, createPost)

//Sign up

app.post('/signup', authError, signup);

app.post('/login', authError, login);

exports.api = functions.https.onRequest(app);
