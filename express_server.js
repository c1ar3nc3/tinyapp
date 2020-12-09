const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser ());

app.set("view engine", "ejs");

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "userRandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  "b2Vn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["user_Id"]
  }
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["user_Id"]
  };
  console.log(users);
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["user_Id"]
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(`${longURL}`)
});

app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["user_Id"]
  }
  res.render("register", templateVars)
});

app.get("/login", (req, res) => {
  const templateVars = {
    username: req.cookies["user_Id"]
  }
  res.render("login", templateVars)
});

//~~~~~~POSTS
// creates 6-digit string and pushes updated values to long/shortURL
app.post("/urls", (req, res) => {
  let newURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[newURL] = longURL;
  res.redirect(`/urls/${newURL}`);
});
// will delete URL's and return to url Index
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL];
  res.redirect('/urls')
});
// returns the updates short/long values to database
app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls')
});
//will login and save username as a cookie
app.post("/login", (req, res) => {

  res.redirect('/login')
});
//logs out user and clears cookie
app.post("/logout", (req, res) => {
  const user = req.body.username;
  res.clearCookie("user_Id", user)
  res.redirect('/urls')
});
//sets username and password after registration
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  const user = {
    id,
    email,
    password
  }
  users[id] = user;

  if (email === "") {
    return res.status(400).send('Email address cannot be empty');
  }

  if (email === user.email) {
    return res.status(400).send('Email address already Registered');
  }

  res.cookie("user_Id", user);
  res.redirect('/urls')
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// helper functions
function generateRandomString() {
  let randomStr = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randomStr;
};

function emailLookup() {
  let eMatch;
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      eMatch = user;
    };
  }
};