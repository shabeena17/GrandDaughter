'use strict';
var mysql = require('mysql'),
    alexaDateUtil = require('alexaDateUtil'),
    textHelper = require('textHelper');

var connection = mysql.createConnection({
    host     : 'reminder.ci1jvp2jzd5x.us-east-1.rds.amazonaws.com:3306',
    user     : 'rapatil',
    password : 'SantaClara13',
    database : 'Appointments',
    debug    : true
});

var storage = (function () {
    
    function Appointment(session, data) {
        if (data) {
            this.data = data;
        } else {
            this.data = {
                'AppointmentId': null
                'date': null,
                'doctor': null,
                'time': null,
                'place': null,
                'reason': null,
                'medication': null

            };
        }
        this._session = session;
    }
    
    Appointment.prototype = {
        /**
         * Store an appointment into Db
         */
        save: function (response) {
            var query = 'Insert INTO Appointments(AppointmentIddate,doctor,time,place,reason,medication)'+ 
                'VALUES ('+ connection.escape(this._session.user.userId) +'NOW(),'
                +this.data.AppointmentId+','+this.data.date+','+this.data.doctor+','
                +this.data.time+','+this.data.place+','
                +this.data.reason+','+this.data.medication;
            
            connection.query(query, (function(data){
                return function(err, rows) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    
                    var speechOutput = data.date + ' ' + data.AppointmentId;
                    /*if(data.weight != 0) {
                        speechOutput += ' with '+ data.weight + ' ' + data.unit;
                    } */                   
                    speechOutput += ' added to your Appointment.'+
                        ' You can say correction if you want to clear your last appointment entry at any time.';
                    response.tell(speechOutput);
                };
            })(this.data));
        } 
    };   
    
    return {
        /**
         * Validates input for save exercise action and calls Save method on success
         */
        saveAppointment: function (session, data, response) {
            var currentAppointment;
            var query = "SELECT * FROM Appointments WHERE AppointmentId= ?";
            
            connection.query(query, [data.AppointmentId], function(err, rows) {
                if (err) {
                    console.log(err);
                    return;
                }
                
                if(rows[0] !== undefined) {
                    data.AppointmentId = rows[0].AppointmentId;   
                    
                    currentAppointment = new Appointment(session, data);
                    currentWorkout.save(response);
                } else {                    
                    var speechOutput = textHelper.invalidAppointment;      /* create invalidAppointment in text helper*/
                    var reprompt = "Please say your command."
                    response.ask(speechOutput, reprompt);
                }
            });
        },
        
        /**
         * Delete last saved appointment
         */
        deleteLastAppointment: function(session, response){
            var query = "DELETE FROM Appointments WHERE AppointmentId= '"+ session.user.userId 
                +"' ORDER BY ID DESC LIMIT 1";
            
            connection.query(query, function(err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
                
                console.log(result.affectedRows);
                
                var speechOutput = 'Your last appointment has been deleted.';
                response.tell(speechOutput);
            });
        },

        /**
         * Find all Appointment on a given day
         */
        findAllAppointmentsOnDate: function(session, response, appointment, day) {            
                
            var query = "SELECT * from Appointments a"+
                " WHERE a.date = '"+ alexaDateUtil.getDbFormattedDate(day) + "' "+
                " AND a.user_id = '"+ session.user.userId +"'";
            
            console.log(query);
            
            connection.query(query, [appointment], function(err, rows) {
                if (err) {
                    console.log(err);
                    return;
                }

                if(rows.length > 0) {
                    var speechOutput = '';
                        
                    if(rows.length == 1) {
                        speechOutput += 'Your Appointment on ' 
                            + alexaDateUtil.getFormattedDate(new Date(day)) + ' is';
                    } else {
                        speechOutput += 'Your Appointments on ' 
                            + alexaDateUtil.getFormattedDate(new Date(day)) + ' are';
                    }
                    
                    for(var i=0; i < rows.length; i++) {
                        if(rows.length > 1 && i == rows.length-1) {
                            speechOutput += ", " + " and";
                        }
                        /*speechOutput += ", " + rows[i].+ ' ' + rows[i].;*/
                        /*if(rows[i].weight > 0) {
                            speechOutput += ' with '+ rows[i].weight + ' ' + rows[i].unit;
                        }*/
                    }
                    
                    response.tell(speechOutput);
                    
                } else {
                    var speechOutput = 'You haven\'t logged any appointments on '+ 
                        alexaDateUtil.getFormattedDate(new Date(day)) 
                        +'. Please try a different day.';
                    var reprompt = "Please say your command."
                    response.ask(speechOutput, reprompt);
                }
            });
        },
        
        /**
         * Find all appointment in the Db
         */
        getAllAppointments: function(response){
            var query = "select * from Appointments";
        
            connection.query(query, function(err, rows) {
                if (err) {
                    console.log(err);
                    return;
                }
                var speechOutput;
                
                if(rows.length > 0) {
                    speechOutput = 'Here are all of your appointments';
                    for(var i=0; i<rows.length; i++) {
                        if(rows.length > 1 && i == rows.length-1) {
                            speechOutput += " and";
                        }
                        speechOutput += ", " + rows[i].AppointmentId;
                    }                    
                } else {
                    speechOutput = "Sorry, no logged appointments";                    
                }
                
                response.tell(speechOutput);
                
            });
        },
    };
    
})();
module.exports = storage;