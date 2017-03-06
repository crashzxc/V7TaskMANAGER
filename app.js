// server.js
// BASE SETUP
// =============================================================================
//hello
// call the packages we need
var express = require('express');
var cors = require('cors');
var app = express();
var TaskItem = require('./app/models/TaskItem');
var Priority = require('./app/models/Priority');

var bodyParser = require('body-parser');
var firebase = require('firebase');
var moment = require('moment');
var https = require('https');
var hashMap = require('hashmap');
var request = require('request');

app.use(bodyParser.urlencoded({ extended: true }));// support encoded bodies
app.use(bodyParser.json()); //Support JSON encoded bodies
app.use(cors());//Enable cors for all routes
var port = process.env.VCAP_APP_PORT || 3000;


// SETUP FIREBASE
// =============================================================================
// Initialize Firebase
var config = {
    apiKey: "AIzaSyCMwvH5EcDM7GFzaobLfbs_ZBM6Sbvh1Xc",
    authDomain: "taskmanagerv2.firebaseapp.com",
    databaseURL: "https://taskmanagerv2.firebaseio.com",
    storageBucket: "taskmanagerv2.appspot.com",
    messagingSenderId: "355173053963"
};
firebase.initializeApp(config);
var databaseReference = firebase.database();
var locationsDbRef = databaseReference.ref('tasks');
var priorityDbRef = databaseReference.ref('priority');
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());//Enable cors for all routes
var port = process.env.PORT || 3000;  // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/TaskManager/addTaskItem')
// create a Location (accessed at POST http://localhost:8080/api/TaskManager/addTaskItem)
    .post(function(req, res) {
        // create a new instance of the Location model
        var location = new TaskItem(locationsDbRef,req.body.taskName,req.body.priorityID);
        // save the bear and check for errors
        location.saveToFirebase(function(err) {
            if (err)
                res.send(err);
            res.json({ message: 'Task Item data created in Firebase' });
        });
    });

//get all tasks in firebase
router.route('/TaskManager/getAllTasks')
    .get(function (req,res){
        var ref = databaseReference.ref('tasks');

        var allTasks = [];
        ref.on("value", function(snap) {
            snap.forEach(function (data) {
                var taskname= data.val().task_name;
                var createDateTime = data.val().create_date_time;
                var taskKey = data.key;
                var TaskData = new taskData(taskKey,taskname,createDateTime);

                allTasks.push(TaskData);
            });

            res.json(allTasks);
        }, function (error) {
            console.log("Error: " + error.code);
        });
    });

//Seed the priority values in firebase
router.route('/TaskManager/addPriority')
    .post(function (req,res) {
        var location = new Priority(priorityDbRef,req.body.priorityName);
        //save the bear and check for errors
        location.saveToFirebase(function (err) {
            if(err){
                res.send(err);
            }
            res.json({message:'Priority Item data created in Firebase'});
        });
    });

router.route('/TaskManager/getPriority')
    .get(function (req,res) {
        var ref = databaseReference.ref('priority');
        var allPriority = [];
        ref.on('value',function (snap) {
            snap.forEach(function (data) {
                var priorityName = data.val().priority_name;
                var priorityId = data.key;
                var priorityData = new priorityDataValue(priorityId,priorityName);

                allPriority.push(priorityData);
            });
            res.json(allPriority);
        },function (error) {
            console.log('Error:  '+error.code);
        });

    });

app.route('/TaskManager/updateTask/:id')
    .put(function (req,res){
        var id = req.params.id;
        var taskRef = databaseReference.ref('tasks/'+id);

        taskRef.update({
            "task_name":req.body.taskName
        });
        res.json({message:'successfully updated id:'+id+' in firebase'});
    });

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/TaskManager/testingonly', function(req, res) {
    // create a new instance of the Location model
    var taskItem = new TaskItem(locationsDbRef,'omg');
    // save the bear and check for errors
    taskItem.saveToFirebase(function(err) {
        if (err)
            res.send(err);
        res.json({ message: 'Task Item data created in Firebase' });
    });

});
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });

});

function taskData(inTaskId,inTaskName,inCreatedDateTime) {
    this.task_id = inTaskId;
    this.task_name = inTaskName;
    this.created_date_time = inCreatedDateTime;
}

function priorityDataValue(inPriorityId,inPriorityName){
    this.priority_id = inPriorityId;
    this.priority_name = inPriorityName;
}

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);