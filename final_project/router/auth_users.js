const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(401).json({ message: "Username not found" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const token = jwt.sign({ username }, 'secretKey', { expiresIn: '1h' });

  res.json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const { isbn } = req.params;
  const { review } = req.query;
  const { username } = req.body;

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }
  const book = books.find(b => b.isbn === isbn);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  const existingReview = book.reviews.find(r => r.username === username);
  if (existingReview) {
    existingReview.review = review;
    res.json({ message: "Review updated successfully", book });
  } else {
    book.reviews.push({ username, review });
    res.json({ message: "Review added successfully", book });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { username } = req.body;
    const book = books.find(b => b.isbn === isbn);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    const reviewIndex = book.reviews.findIndex(r => r.username === username);
    if (reviewIndex === -1) {
      return res.status(404).json({ message: "Review not found for this user" });
    }

    book.reviews.splice(reviewIndex, 1);
    res.json({ message: "Review deleted successfully", book });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
