// normal routes ===============================================================

app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.get('/profile', isLoggedIn, async (req, res) => {
  try {
    const messages = await Message.find().lean();
    const latestSong = {
      artistName: 'Zuri Lives',
      songTitle: 'Limited Time Only!',
      producerName: 'Qui90',
      cloudinaryUrl: 'https://res.cloudinary.com/deeoimhbf/video/upload/v1745521393/06_Limited_Time_Only_Expert_Version_jgoemw.wav' // Replace with real Cloudinary URL
    };
    res.render('profile.ejs', {
      user: req.user,
      messages: messages,
      song: latestSong
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    console.log('User has logged out!');
  });
  res.redirect('/');
});


app.post('/messages', async (req, res) => {
  try {
    await Message.create({
      name: req.body.name,
      msg: req.body.msg,
      artistName: req.body.artistName,    
      songTitle: req.body.songTitle,      
      producerName: req.body.producerName, 
      thumbUp: 0,
      thumbDown: 0
    });
    console.log('Message saved with song info');
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.redirect('/profile');
  }
});

app.put('/messages', async (req, res) => {
  try {
    const updated = await Message.findOneAndUpdate(
      { name: req.body.name, msg: req.body.msg },
      { $inc: { thumbUp: 1 } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.delete('/messages', async (req, res) => {
  try {
    await Message.findOneAndDelete({
      name: req.body.name,
      msg: req.body.msg
    });
    res.send('Message deleted!');
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});


app.get('/login', (req, res) => {
  res.render('login.ejs', { message: req.flash('loginMessage') });
});

app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/signup', (req, res) => {
  res.render('signup.ejs', { message: req.flash('signupMessage') });
});

app.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true
}));

app.get('/unlink/local', isLoggedIn, (req, res) => {
  const user = req.user;
  user.local.email = undefined;
  user.local.password = undefined;
  user.save((err) => {
    res.redirect('/profile');
  });
});

// middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}
