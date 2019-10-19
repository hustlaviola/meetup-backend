const { db } = require('../utils/admin');

const getPosts = (req, res) => {
  return db.collection('posts')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      let posts = [];
      data.forEach(doc => {
        const { username, body, createdAt } = doc.data();
        posts.push({
          postId: doc.id,
          username,
          body,
          createdAt
        });
      });
      return res.json(posts);
    })
    .catch(error => res.status(500).json({ error }));
}

const createPost = (req, res) => {
  const { username } = req.user;
  const { body } = req.body;
  const createdAt = new Date().toISOString();
  const newPost = { body, username, createdAt };

  return db.collection('posts').add(newPost)
    .then(doc => {
      return res.json({message: `Document ${doc.id} created successfully`})
    })
    .catch(error => res.status(500).json({ error }));
}

module.exports = { getPosts, createPost };
