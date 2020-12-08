const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs")

const urlDatabase = {
  "b2Vn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  console.log(urlDatabase);
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(`${longURL}`)
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body> Hello <b>World</b></body></html>\n");
// });

// creates 6-digit string and pushes updated values to long/shortURL
app.post("/urls", (req, res) => {
  let newURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[newURL] = longURL;
  res.redirect(`/urls/${newURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL];
  res.redirect('/urls')
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const longURL = req.body.longURL;
  urlDatabase.longURL = longURL;
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