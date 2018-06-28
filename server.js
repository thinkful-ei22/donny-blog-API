'use strict';

const uuid = require('uuid');
//create express instance
const express = require('express');
const morgan = require('morgan');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

//our SIMDB Notes
//our raw JSON blog data
const data = require('./db/blogposts');
const simDB = require('./db/simDB');
const posts = simDB.initialize(data);
//simDB load raw JSON data


const {PORT} = require('./config');

//GET ROUTE FOR GETTING ALL BLOG POSTS

app.get('/blog-posts', (req,res, next) => {
    
  console.log('testingGet endpoint');
  const { searchTerm } = req.query;
  console.log(searchTerm);

  posts.filter(searchTerm, (err, list) => {
    if (err) {
      return next(err); // goes to error handler
    }
    res.json(list); // responds with filtered array
  });

});

//get individual blog posts
app.get('/blog-posts/:id', (req, res, next) => {
  const {id} = req.params;
  
  posts.find(id, (err, post) => {
    if (err) {
      return next(err); // goes to error handler
    }
    if(post){
      res.json(post); //return found blog post
    }else{
      res.send('Blog Post not found');
    }
  });
});

//POST a blog post
app.post('/blog-posts', (req,res, next) => {

  console.log('testingPOST endpoint');
  const { title, author, publishDate, content } = req.body;
  
  const newPost = { title, author, publishDate, content };
  //console.log(newPost);
  /***** Never trust users - validate input *****/
  if (!newPost.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
 //pass in our newPost object we made from above
  posts.create(newPost, (err, post) => {
    if (err) {
      return next(err);
    }
    if (post) {
      console.log(post);
      res.status(201).json(post);
    } else {
      next();
    }
  });
});

//edit a blog post
app.put('/blog-posts/:id', (req,res, next) => {
  const {id} = req.params;

  console.log('testingPUT endpoint');

  //console.log(req.body);
  const updateObj = {};
  const updateFields = ['title','author', 'publishDate', 'content'];

  updateFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

   console.log(updateObj);
   console.log(`The id is ${id}`);
  posts.update(id, updateObj, (err, item) => {
    if (err) {
      return next(err);
    }
    if (item) {
      res.json(item);
    } else {
      next();
    }
  });
    
});

//DELETE a BLOG POST

app.delete('/blog-posts/:id', (req,res, next) => {

  console.log('testingDELETE endpoint');
  const { id } = req.params;
  console.log(req.params.id);
  
  posts.delete(id, (err, post) => {
    if (err) {
      return next(err);
    }
    if (post) {
     // res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item);
     res.status(201).json(post);
    } else {
      next();
    }
  });

});
    

    
    
  
  




app.listen(PORT, function () {
  console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
  console.error(err);
});