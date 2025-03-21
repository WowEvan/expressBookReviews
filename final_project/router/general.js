const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');
const apiBaseURL = "http://localhost:5000";

public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
  
    users.push({ username, password });
    res.status(201).json({ message: "User registered successfully" });
});

public_users.get('/books', function (req, res) {
    return res.status(200).json(books);
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get(`${apiBaseURL}/books`);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching books list" });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const { isbn } = req.params;
    try {
        const response = await axios.get(`${apiBaseURL}/books/isbn/${isbn}`);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching book details by ISBN" });
    }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const { author } = req.params;
    try {
        const response = await axios.get(`${apiBaseURL}/books/author/${author}`);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching books by author" });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const { title } = req.params;
    try {
        const response = await axios.get(`${apiBaseURL}/books/title/${title}`);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching books by title" });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const { isbn } = req.params;
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }

    if (Object.keys(book.reviews).length === 0) {
        return res.status(200).json({ message: 'No reviews available for this book yet' });
    }

    res.json({ reviews: book.reviews });
});

module.exports.general = public_users;
