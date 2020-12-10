const express = require("express");
const app = express();
const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session')
const bcrypt = require("bcrypt")
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser ());
app.use(cookieSession({
  name: 'session',
  keys: ["secretKey"],

  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
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
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

app.get("/urls/new", (req, res) => {
  const userId = findUser(req.session.user_id);
  const loggedIn = users[userId];

  const templateVars = {
    userId,
    loggedIn
  }
  if (!userId){
    return res.redirect('/login');
  } else {
  res.render("urls_new", templateVars);
  }
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const loggedIn = users[userId];
  const usersURLS = userURLS(userId);

  const templateVars = { 
    userId,
    loggedIn,
    urls: urlDatabase,
    users: users,
    usersURLS
  };

  if(userId) {
    res.render("urls_index", templateVars);
  } else {
    res.status(401).send('please log in to continue')
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const loggedIn = users[userId];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].url
  
  const templateVars = { 
    shortURL: shortURL,
    longURL: longURL,
    userId,
    loggedIn,
  }

  if (!loggedIn) {
    res.redirect("/login");
  } else if (!longURL){
    res.status(404).send("URL does not exist!")
  } else {
  res.render("urls_show", templateVars);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].url;
  if (longURL) {
    res.redirect(longURL)
  } else {
    res.status(404).send('TinyURL not found')
  }
});

app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const loggedIn = users[userId];

  const templateVars = {
    userId,
    loggedIn
  }

  if(userId) {
    res.redirect('/urls')
  }
  res.render("register", templateVars)
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const loggedIn = users[userId];

  const templateVars = {
    userId,
    loggedIn
  }
  if(userId) {
    res.redirect("/urls")
  } else {
    res.render("login", templateVars)
  }
});

//~~~~~~POSTS

// creates 6-digit string and pushes updated values to long/shortURL
app.post("/urls", (req, res) => {
  const userId = req.cookies["user_Id"];
  let newURL = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[newURL] = {
      url: longURL,
      userID: userId
  }

  if (userId) {
    res.redirect(`/urls/${newURL}`);
  } else {
    res.status(401).send("please log in to continue")
  }
});

// will delete URL's and return to url Index
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  if (req.cookies["user_Id"]) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// returns the updates short/long values to database
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURLTwo;
  res.redirect('/urls')
});

//will login and save username as a cookie
app.post("/login", (req, res) => {
  const eM = req.body.email;
  const pW = req.body.password;
  
  if (eM === "" || pW === "") {
    res.status(400).send("fields cannot be blank");
  } else if (emailLookup(eM) === false) {
    res.status(403).send("Account not found")
  } else if (bcrypt.compareSync(pW, findUser(eM)["password"])) {
    req.session.user_id = findUser(eM)["id"];
    res.redirect("/urls")
  } else {
    res.status(401).send("incorrect password")
  }
});

//sets username and password after registration
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
 
  if (email === "") {
    return res.status(400).send('Email address cannot be empty');
  } else if (emailLookup(email)) {
    res.status(400).send("Email address already registered")
  } else {
    let userId = addUser(email, password)
    users.id = userId;
    res.redirect("/login")
  }
});

//logs out user and clears cookie
app.post("/logout", (req, res) => {
  const user = req.body.username;
  req.session = null;
  res.redirect('/login')
});


// end
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

function emailLookup(addy) {
  for (const mail in users) {
    if (addy === users[mail]["email"]) {
      return true;
    }
  }
  return false;
};

function userURLS(database, user) {
  let userDatabase = {};
  for (url in database) {
    if (database[url].user_ID === user) {
      userDatabase = database[url];
    }
  }
  return userDatabase;
}

function findUser(email) {
  for (let id in users) {
    if (users[id]["email"] === email) {
      return users[id];
    }
  }
}

function addUser(userEm, userPw) {
  const newId = generateRandomString();
  users[newId] = {
    id: newId,
    email: userEm,
    password: userPw
  }
  return newId;
}

const authenticateUser = (username, password) => {
  return users[username] && users[password].password === password;
}