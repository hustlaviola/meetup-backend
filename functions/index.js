const functions = require('firebase-functions');
const app = require('express')();
const { FBAuth } = require('./middlewares/FBAuth');
const { authError } = require('./middlewares/validations/validator');
const {
    getPosts,
    createPost,
    getPost,
    commentOnPost,
    likePost,
    deletePost
} = require('./controllers/posts');

const {
    signup,
    login,
    uploadProfileImage,
    updateProfile,
    getOwnDetails
} = require('./controllers/users');

// Post route
app.get('/posts', FBAuth, getPosts);

app.post('/posts', FBAuth, createPost);

app.get('/posts/:postId', getPost);

app.post('/posts/:postId/comments', FBAuth, commentOnPost);

app.get('/posts/:postId/like', FBAuth, likePost);

app.delete('/posts/:postId', FBAuth, deletePost);

// app.post('/posts/:postId/unlike', FBAuth, unlikePost);

// Auth route
app.post('/auth/signup', authError, signup);

app.post('/auth/login', authError, login);

app.post('/users/image', FBAuth, uploadProfileImage);

app.post('/users/profile', FBAuth, updateProfile);

app.get('/users/credentials', FBAuth, getOwnDetails);

exports.api = functions.https.onRequest(app);
