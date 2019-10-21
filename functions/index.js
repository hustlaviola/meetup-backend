const functions = require('firebase-functions');
const app = require('express')();
const { db } = require('./utils/admin');
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
  getOwnDetails,
  getUserDetails,
  markNotificationsRead
} = require('./controllers/users');

// Post route
app.get('/posts', FBAuth, getPosts);

app.post('/posts', FBAuth, createPost);

app.get('/posts/:postId', getPost);

app.post('/posts/:postId/comments', FBAuth, commentOnPost);

app.get('/posts/:postId/like', FBAuth, likePost);

app.delete('/posts/:postId', FBAuth, deletePost);

// Auth route
app.post('/auth/signup', authError, signup);

app.post('/auth/login', authError, login);

app.post('/users/image', FBAuth, uploadProfileImage);

app.post('/users/profile', FBAuth, updateProfile);

app.get('/users/credentials', FBAuth, getOwnDetails);

app.get('/users/:username', getUserDetails);

app.post('/notifications', FBAuth, markNotificationsRead);

exports.api = functions.https.onRequest(app);

exports.createLikeNotification = functions.firestore.document('likes/{id}')
  .onCreate(snapshot => {
    return db.doc(`/posts/${snapshot.data().postId}`).get()
      .then(doc => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().username,
            sender: snapshot.data().username,
            type: 'like',
            read: false,
            postId: doc.id
          });
        }
        return;
      })
      .then(() => {
        return;
      })
      .catch(error => {
        return;
      })
  })

exports.deleteNotifications = functions.firestore.document('likes/{id}')
  .onDelete(snapshot => {
    return db.doc(`/notifications/${snapshot.id}`).delete()
      .then(() => {
        return;
      })
      .catch(error => {
        return;
      })
  })

exports.createCommentNotification = functions.firestore.document('comments/{id}')
  .onCreate(snapshot => {
    return db.doc(`/posts/${snapshot.data().postId}`).get()
      .then(doc => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().username,
            sender: snapshot.data().username,
            type: 'comment',
            read: false,
            postId: doc.id
          });
        }
        return;
      })
      .then(() => {
        return;
      })
      .catch(error => {
        return;
      })
  })
