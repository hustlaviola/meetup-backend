const functions = require('firebase-functions');
const app = require('express')();
const { FBAuth } = require('./middlewares/FBAuth');
const { authError } = require('./middlewares/validations/userValidator');
const { getPosts, createPost, getPost } = require('./controllers/posts');
const { signup, login, uploadProfileImage, updateProfile, getOwnDetails } = require('./controllers/users');

// Post route
app.get('/posts', FBAuth, getPosts);

app.post('/posts', FBAuth, createPost);

app.get('/posts/:postId', getPost);

// Auth route
app.post('/auth/signup', authError, signup);

app.post('/auth/login', authError, login);

app.post('/users/image', FBAuth, uploadProfileImage);

app.post('/users/profile', FBAuth, updateProfile);

app.get('/users/credentials', FBAuth, getOwnDetails);

exports.api = functions.https.onRequest(app);
