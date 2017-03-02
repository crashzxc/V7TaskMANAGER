var firebase = require('firebase');
var moment = require('moment');
moment = require('moment-timezone');
require('moment-duration-format');
module.exports = TaskItem;


 function TaskItem (inDbReference,inTaskName) {
    this._taskName = inTaskName;
	this._taskId = '';
	this._databaseReference = inDbReference;
	this.getTaskName = function () {
        return this._taskName;
    },
	this.getTaskId = function(){
		return this._taskId;
	},
	this.saveToFirebase = function (callback){
		// I dont want to throw an error, so I pass null for the error argument
	   // Get a key for a new Post.
      var newTaskKey = inDbReference.push().key; 	
      var taskItem = {
        task_name: this._taskName,
		task_id: newTaskKey,
        create_date_time:  new Date().getTime()
    };
      inDbReference.push(taskItem);
	
    callback(null, 'Data is saved in firebase'); 
	
  }

 }
