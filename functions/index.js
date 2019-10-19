const functions = require('firebase-functions');
const app = require('express')();
const { FBAuth } = require('./middlewares/FBAuth');
const { authError } = require('./middlewares/authValidator');
const { getPosts, createPost } = require('./controllers/posts');
const { signup, login, uploadProfileImage } = require('./controllers/users');

// Post route
app.get('/posts', FBAuth, getPosts)

app.post('/posts', FBAuth, createPost)

// Auth route
app.post('/signup', authError, signup);

app.post('/login', authError, login);

app.post('/users/image', FBAuth, uploadProfileImage)

exports.api = functions.https.onRequest(app);
