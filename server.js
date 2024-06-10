const express = require('express');
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new SamlStrategy(
  {
    path: '/login/callback',
    entryPoint: 'https://OUR_PINGFEDERATE_DOMAIN/idp/startSSO.ping',
    issuer: 'OUR_SP_ENTITY_ID',
    cert: fs.readFileSync('path/to/pingfederate/certificate.pem', 'utf-8')
  },
  (profile, done) => {
    return done(null, profile);
  }
));

app.get('/login',
  passport.authenticate('saml', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);

app.post('/login/callback',
  passport.authenticate('saml', {
    failureRedirect: '/',
    failureFlash: true
  }),
  (req, res) => {
    res.redirect('/');
  }
);

app.get('/', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.send(`Hello ${req.user.nameID}`);
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

