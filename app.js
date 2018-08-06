const express = require('express');
const exphbs  = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override')
const flash = require('connect-flash')
const session = require('express-session')

const app = express();

// Map global promise - get rid of warnning

mongoose.Promise = global.Promise;

//Connect to mongoose
mongoose.connect('mongodb://localhost/vidjot-dev')
.then(()=>console.log('mongodb connected...'))
.catch(err =>console.log(err));

//load Idea model
require('./models/Idea');
const Idea = mongoose.model('ideas');

// Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//Body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// Method override middleware
app.use(methodOverride('_method'))

//Express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
  }))

// Flash middleware
app.use(flash());

//Global variables
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.errror = req.flash('error');
    next();
})


// Index Route
app.get('/', (req, res) => {
  const title = 'Welcome222';
  res.render('index', {
    title: title
  });
});

// About Route
app.get('/about', (req, res) => {
  res.render('about');
});

//ADD IDEA ROUTE
app.get('/ideas/add', (req, res) => {
    res.render('ideas/add');
  });

//Edit Idea Route
app.get('/ideas/edit/:id', (req,res) =>{
    Idea.findOne({
        _id: req.params.id
    })
    .then(idea =>{
        res.render('ideas/edit', {
            idea:idea
        })
    })
})
// Ideas Route
app.get('/ideas', (req, res) =>{
    Idea.find({})
    .sort({date:'desc'})
    .then(ideas =>{
        res.render('ideas/index', {
            ideas: ideas
        })
    })
    
})

// Process Form
app.post('/ideas',(req, res)=>{
    // form validation
    let err = [];
    if (!req.body.title) {
        err.push({text:'Please add a title'})
    }
    if (!req.body.details) {
        err.push({text:'Please add details'})
    }
    if (err.length > 0) {
        res.render('ideas/add', {
            err: err,
            title: req.body.title,
            details: req.body.details
        })
    }else{
        const newUser = {
            title:req.body.title,
            details:req.body.details
        }
        new Idea(newUser)
        .save()
        .then(idea => {
            req.flash('success_msg', 'Video idea added');
            res.redirect('/ideas');
        })
    }
    
})
// Edit form process
app.put('/ideas/:id', (req,res)=>{
    Idea.findOne({
        _id:req.params.id
    })
    .then(idea =>{
        //new values
        idea.title = req.body.title;
        idea.details = req.body.details;

        idea.save()
         .then(idea =>{
             res.redirect('/ideas');
         })
    })
})

//Delete Idea
app.delete('/ideas/:id', (req, res) =>{
    Idea.remove({_id:req.params.id})
    .then(() =>{
        req.flash('success_msg', 'Video idea removed');
        res.redirect('/ideas')
    })
})


const port = 4000;

app.listen(port, () =>{
  console.log(`Server started on port ${port}`);
});