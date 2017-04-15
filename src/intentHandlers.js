/**
 * @Author: Mohamed Nisar <mohamedn@qburst.com>
 * 
 * This file contains handler logic for all indents.
 */

'use strict';
var textHelper = require('textHelper'),
    storage = require('storage');

var registerIntentHandlers = function (intentHandlers, skillContext) {
    
    /**
     * Creates new appointment
     */
    intentHandlers.NewAppointmentIntent = function (intent, session, response) {   
        if(intent.slots.Appointment.value !== undefined) {        
            var appointment = intent.slots.Appointment.value;
    
            if(intent.slots.Day.value !== undefined && isNaN(intent.slots.Day.value)) {
                var speechOutput = "That's not a valid day. Please try again."+
                    " You can say, doctor appointment on January first.";
                var reprompt = "Please repeat your appointment.";
                response.ask(speechOutput, reprompt);
            }
                        
            var data = {
                'appointment'  : appointment,
                'day'     : day,
            }; 
            
            storage.saveAppointment(session, data, response);
            
        } else {
            var speechOutput = "You have to specify the appointment and the date. "+
                "Please try again. You can say, doctor appointment on January first.";
            var reprompt = "Please say your appointment."
            response.ask(speechOutput, reprompt);
        }
    };
    
    /**
     * Clears the last appointment
     */
    intentHandlers.CorrectionIntent = function (intent, session, response) {
        if(intent.slots.Correction.value !== undefined) {
            storage.deleteLastWorkout(session, response);
        } else {
            var speechOutput = 'Sorry, I didn\'t hear you. ' + textHelper.examplesText;
            var reprompt = "Please say your command."
            response.ask(speechOutput, reprompt);
        }
    };
        
    /**
     * Get stats for an appointment on a given date 
     */
    intentHandlers.GetAppointmentOnDayIntent = function (intent, session, response) {        
        if(intent.slots.Appointment.value !== undefined && intent.slots.Day.value !== undefined) {
            var appointment = intent.slots.Appointment.value,
                day = intent.slots.Day.value;
            
                if(day == "") {
                    var speechOutput = "Sorry, I could not understand the date. Please try again."+
                        " You can say, Get my Appointment on last Friday.";
                    var reprompt = "Please say your command."
                    response.ask(speechOutput, reprompt);
                }
            
            storage.findAllAppointmentsOnDate(session, response, appointment, day);
        } else {
            var speechOutput = "You have to specify appointment and date. Please try again."+
                    " You can say, Get my doctor appointment on last Friday.";
            var reprompt = "Please say your command."
            response.ask(speechOutput, reprompt);
        }
    };
    
    /**
     * Gets all appointments on a given date
     */
    intentHandlers.GetAllExerciseOnDayIntent = function (intent, session, response) {        
        if(intent.slots.Day.value !== undefined) {
            var day = intent.slots.Day.value;
            
            if(day == "") {
                var speechOutput = "Sorry, I could not understand the date. Please try again."+
                    " You can say, Get my appointment on last Friday.";
                var reprompt = "Please say your command."
                response.ask(speechOutput, reprompt);
            }
            
            storage.findAllAppointmentOnDate(session, appointment, response, day);
        } else {
            var speechOutput = "You have to specify the date. Please try again. "+
                "You can say, Get my appointment on last Friday.";
            var reprompt = "Please say your command."
            response.ask(speechOutput, reprompt);
        }
    };
    
    /**
     * Get a list for all supported appointment
     */
    intentHandlers.GetAllAppointmentIntent = function (intent, session, response) {
        storage.getAllAppointments(response);
    };
    
    intentHandlers.MyHelpIntent = function (intent, session, response) {
        var speechOutput = textHelper.helpText + textHelper.examplesText;
        var reprompt = "What would you like?"
        response.ask(speechOutput, reprompt);
    };
    
    intentHandlers.MyCancelIntent = function (intent, session, response) {
        var speechOutput = "Goodbye. Thanks for using Appointment Skill.";
        response.tell(speechOutput);
    };
    
    intentHandlers['AMAZON.HelpIntent'] = function (intent, session, response) {
        var speechOutput = textHelper.helpText + textHelper.examplesText;
        var reprompt = "What would you like?"
        response.ask(speechOutput, reprompt);
    };
    
    intentHandlers['AMAZON.CancelIntent'] = function (intent, session, response) {
        var speechOutput = "Okay.";
        response.tell(speechOutput);
    };

    intentHandlers['AMAZON.StopIntent'] = function (intent, session, response) {
        var speechOutput = "Goodbye. Thanks for using Appointment SKill.";
        response.tell(speechOutput);
    };
    
};

/**
 * Calculates weight from user inputs.
 */

exports.register = registerIntentHandlers;
