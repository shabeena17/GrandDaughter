'use strict';
var request = require('request');
var striptags = require('striptags');
var unescape = require('unescape');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {

    var intent = intentRequest.intent;
    var intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    if ("LaunchGrandaughterIntent" == intentName) {
        setNewUserRequest(intent, session, callback);
    }
    else if ("GetMotivationIntent" == intentName) {
        handleMotivationRequest(intent, session, callback);
    }
    else if ("AppointmentIntent" == intentName) {
        handleAppointmentRequest(intent, session, callback);
    } 
    else if ("WaterRecommendIntent" == intentName) {
        handleWaterRecommendRequest(intent, session, callback);
    } 
    else if ("WaterConsumptionIntent" == intentName) {
        handleWaterConsumptionRequest(intent, session, callback);
    } 
    else if ("WaterLeftIntent" == intentName) {
        handleWaterLeftRequest(intent, session, callback);
    } 
    else if ("AMAZON.YesIntent" === intentName) {
        handleMotivationRequest(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        handleGetHelpRequest(intent, session, callback);
    } else if ("AMAZON.StopIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else if ("AMAZON.CancelIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */


// ------- Skill specific logic -------

function getWelcomeResponse(callback) {
    var welcomeSpeech = "Welcome to GrandDaughter!";
    console.log(welcomeSpeech);
    var reprompt = welcomeSpeech;
    var shouldEndSession = false;
    var sessionAttributes = {
        "welcomeSpeech" : welcomeSpeech
    };
    var header = "GrandDaughter";

    callback(sessionAttributes, buildSpeechletResponse(header, welcomeSpeech, reprompt, shouldEndSession));
}

function setNewUserRequest(intent, session, callback)
{
    console.log("inside setNewUserRequest");
    // var waterintake = 12;
    // var speechOutput = "Your water intake for today should be " + waterintake+ " glasses with each glass being 16 ounces each";
                
    // var reprompt = "Do you want me to repeat that for you?";
    // callback(session.attributes, buildSpeechletResponse("some_Header", speechOutput, reprompt, false));
     
    console.log("existing setNewUserRequest");
}

/*
 * source code referred from https://tinyurl.com/hktzmrz and https://tinyurl.com/hg8ykru
 */
function handleMotivationRequest(intent, session, callback) {
    console.log("inside handleMotivationRequest");
    getJSON(function(data) {
        var speechOutput = "There is an error";
        if (data != "ERROR") {
            console.log('reached with an output');
            console.log(data);
            speechOutput = data;
        } else {
            console.log("Oops.. something went wrong");
        }
        callback(session.attributes, buildSpeechletResponse("some_Header", speechOutput, "some_Reprompt", false));
        
    });
}


function handleAppointmentRequest(intent, session, callback) {
    console.log("inside handleAppointmentRequest");
     if(intent.slots.Appointment.value !== undefined) {        
            var appointment = intent.slots.Appointment.value;
            var date = intent.slots.Date.value;
            var time = intent.slots.Time.value;
                        
            var data = {
                'appointment'  : appointment,
                'date'  : date,
                'time'     : time,
            }; 
            console.log(data);

            insertRecord(data,"Appointment",callback);
            
        } else {
            var speechOutput1 = "You have to specify the appointment and the date. "+
                "Please try again. You can say, doctor appointment on January first.";
            var reprompt1 = "Please say your appointment.";
            callback(session.attributes, buildSpeechletResponse("some_Header", speechOutput1, reprompt1, false));
        }
        console.log("ending handleAppointmentRequest");
}
 
function handleWaterRecommendRequest(intent, session, callback) {
    console.log("inside handleWaterRecommendRequest");
     //read from user table - weight and age
     //calculate and insert in waterintake table - name, we
     var waterintake = 12;
     var speechOutput = "Your water intake for today should be " + waterintake+ " glasses with each glass being 16 ounces each";
                
     var reprompt = "Do you want me to repeat that for you?";
     callback(session.attributes, buildSpeechletResponse("some_Header", speechOutput, reprompt, false));
     console.log("ending handleWaterRecommendRequest");
}

function handleWaterConsumptionRequest(intent, session, callback) {
    console.log("inside handleWaterConsumptionRequest");
     if(intent.slots.Water_Count.value !== undefined) {        
            var watercount = intent.slots.Water_Count.value;
                        
            console.log('water count'+ watercount);

            insertRecord(null,"WaterConsumption",callback);
            
        } else {
            var speechOutput = "You have to specify the appointment and the date. "+
                "Please try again. You can say, doctor appointment on January first.";
            var reprompt = "Please say your appointment.";
            callback(session.attributes, buildSpeechletResponse("some_Header", speechOutput, reprompt, false));
        }
        console.log("ending handleAppointmentRequest");
}

function handleWaterLeftRequest(intent, session, callback) {
    console.log("inside handleWaterLeftRequest");
    //read how much water the user has drank for the current date
    var waterconsumed = 8;
    var tobeconsumed = 12 ;
     var speechOutput = "You have consumed "+waterconsumed+" glasses of water but you need to consume "+tobeconsumed+" more glasses of water for the day";
     var reprompt = "Do you want me to repeat that for you";
     
     callback(session.attributes, buildSpeechletResponse("some_Header", speechOutput, reprompt, false));
     console.log("ending handleWaterLeftRequest");
}

function insertRecord(data,request,callback)
{
    var params = {};
    if (request == "Appointment"){
        params = {
            Item: {
                Date: data.date,
                AppointmentType: data.appointment,
                Time: data.time
        },

        TableName: "Appointments"
    };
    }
    else if (request == "WaterConsumption"){
        params = {
            Item: {
                Name: "Shabeena",
                TotalConsumed: 100,
                ToBeConsumed: 200
            },

        TableName: "LogWaterIntake"
    };
    }
    saveData(params,callback);
    console.log('exiting insertRecord');

}

function saveData(params,callback){
    console.log('entering saveData');
    
    docClient.put(params, function(err, data) {
            if (err) {
                callback(err,null);
            } else {
                callback(null,data);
            }
        });
    console.log('ending saveData');
    }

// organize functions based on usage
function getJSON(callback) {
    request.get(getURL(), function(error, response, body) {
        if (body.length > 0) {
            var quote = getQuote(body);
            callback(quote);
        } else {
            callback("ERROR");
         }
     });
}

function getURL() {
    return "http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1";
}

function getQuote(responseBody) {
    var result = JSON.parse(responseBody);
    // use unescape to convert html entities to html charachters
    var htmlString = unescape(result[0].content);

    // use striptags to strip html from string
    return striptags(htmlString);
}

function handleGetHelpRequest(intent, session, callback) {
    // Ensure that session.attributes has been initialized
    if (!session.attributes) {
        session.attributes = {};

    }
}

function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Good bye!" if the user wants to quit the game
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Good bye!", "", true));
}


// ------- Helper functions to build responses for Alexa -------


function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}