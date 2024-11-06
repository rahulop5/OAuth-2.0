import express from "express";
import env from "dotenv";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";

const app=express();
app.use(express.static("public"));
env.config();

app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000*60*60
    }
}));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done)=>{
    return done(null, user);
});
passport.deserializeUser((user, done)=>{
    return done(null, user);
})

passport.use("github", new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
}, (accessToken, refreshToken, profile, done)=>{
    console.log(profile);
    return done(null, profile);
}))

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/iminnigg",
    passReqToCallback   : true
}, (request, accessToken, refreshToken, profile, done)=>{
    console.log(profile);
    return done(null, profile);
}));


app.get("/", (req, res)=>{
    res.sendFile("index.html");
})


app.get('/auth/github',passport.authenticate('github', { scope: [ 'user:email' ] }));

app.get("/auth/github/callback", passport.authenticate("github", {
    failureRedirect: "/",
    successRedirect: "/github/afterlogin"
}));

app.get("/github/afterlogin", (req, res)=>{
    if(req.isAuthenticated()){
        res.render("loggedin.ejs");
    }
    else{
        res.redirect("/");
    }
})


app.get("/login", passport.authenticate("google", {scope:["profile", "email"]}));


app.get("/iminnigg", passport.authenticate("google", {
    failureRedirect: "/", 
    successRedirect: "/afterlogin"
}));

// app.get("/logout", (req, res)=>{
//     req.logOut(()=>{
//         res.redirect("/");
//     })
// })

app.get("/logout", (req, res) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });

app.get("/afterlogin", (req, res)=>{
    if(req.isAuthenticated()){
        // res.sendFile("temp.html");
        res.render("./loggedin.ejs");
    }
    else{
        res.redirect("/");
    }
})



app.listen(3000);