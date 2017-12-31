const Post = require('../models/postModels');

const postCreate = (req, res) => {
  const { username, thumbnailUrl, imageUrl, likes, timestamp, comments } =  req.body;
  const newPost = new Post({ username, thumbnailUrl, imageUrl, likes, timestamp, comments });
  console.log("newPost: ", newPost);
  newPost.save(newPost, (err, savedpost) => {
    if (err) {
      console.log("err: ", err);
      res.status(500).json(err);
      return;
    }
    res.json(savedpost);
  })
};

const postsGetAll = (req, res) => {
  Post.find({})
    .then(posts => {
      if (posts.length === 0) throw new Error();
      res.json(posts)
    })
      .catch(err => res.status(422).json(err));
};

const postGetById = (req, res) => {
  const { id } = req.params;
  Post.findById(id)
    .populate('username comments.username', 'username')
    .exec()
      .then((singlePost) => {
        if (singlePost === null) throw new Error();
        res.json(singlePost);
      })
        .catch(err => res.status(422).json(err));
};

const postCommentAdd = (req, res) => {
  const { id } = req.params;
  const { username, text } = req.body;
  const comment = { username, text };
	// find a single post
	// grab comments array, add our comment to it.
	// save post
  Post.findById(id)
    .then(post => {
      if (post === null) throw new Error();
      const comments = post.comments;
      comments.push(comment);
      post
        .save()
        .then(newPost => {
          Post.findById(newPost._id)
          .populate('comments.username', 'username') // get 'username' from User's username using 'comment.username'
          .exec((badError, savedpost) => {
            if (badError) {
              throw new Error()
            }
            res.json(savedpost);
          });
        })
          .catch(err => {throw new Error()});
    })
      .catch(err => res.status(422).json({ error: 'No Post!' }));
};

module.exports = {
  postCreate,
  postsGetAll,
  postGetById,
  postCommentAdd
};