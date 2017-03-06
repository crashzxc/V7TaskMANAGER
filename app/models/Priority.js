/**
 * Created by TerryTan on 3/3/2017.
 */
var firebase = require('firebase');
var moment = require('moment');
moment = require('moment-timezone');
require('moment-duration-format');
module.exports = Priority;

function Priority(inDbReference,inPriorityName) {
    this._PriorityName = inPriorityName;
    
    this.getPriorityName = function () {
        return this._PriorityName;
    }
    this.saveToFirebase = function (callback) {
        // I dont want to throw an error, so I pass null for the error argument
        var priorityItem = {
            priority_name:this._PriorityName
        };
        inDbReference.push(priorityItem);

        callback(null,'Data is saved in firebase');
    }
}