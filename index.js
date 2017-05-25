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
        console.log("event.session .application.applicationId=" + event.session.application.applicationId);

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
    console.log(intentName);

    // dispatch custom intents to handlers here
    if ("AskGrandaughter" == intentName) {
        setNewUserRequest(intent, session, callback);
    }
    else if ("GetMotivationIntent" == intentName) {
        //handleMotivationRequest(intent, session, callback);
    }
    else if ("AppointmentIntent" == intentName) {
        handleAppointmentRequest(session, callback);
    } 
    else if ("WaterRecommendIntent" == intentName) {
        handleWaterRecommendRequest(intent, session, callback);
    } 
    else if ("MedicineIntent" == intentName) {
        handleMedicineDosageRequest(intent, session, callback);
    } 
    else if ("ReadAppIntent" == intentName) {
        handleReadAppointment(intent, session, callback);
    } 
    else if ("WaterConsumptionIntent" == intentName) {
        handleWaterConsumptionRequest(intent, session, callback);
    } 
    else if ("WaterLeftIntent" == intentName) {
        handleWaterLeftRequest(intent, session, callback);
    }
    else if ("ReadMedicineIntent" == intentName) {
        handleReadMedicineDosage(intent, session, callback);
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

function setNewUserRequest( session, callback)
{
    console.log("inside setNewUserRequest");
    var welcomeSpeech = "Welcome to GrandDaughter. Let's set your user profile";
    //callback(session.attributes, buildSpeechletResponse("some_Header", speechOutput, "some_Reprompt", false));
    buildSpeechletResponse("", welcomeSpeech, "", true);
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
            var speechOutput = ""
            var reprompt = ""
                        
            var data = {
                'appointment'  : appointment,
                'date'  : date,
                'time'     : time,
            }; 
            console.log(data);

            insertRecord(data,"Appointment",callback);
            speechOutput = "Great! We've got your appointement recorded in the calendar";
            reprompt = "";
        } else {
            speechOutput = "You have to specify the appointment and the date. "+
                "Please try again. You can say, doctor appointment on January first.";
            reprompt = "Please say your appointment.";
            //callback(session.attributes, buildSpeechletResponse("some_Header", speechOutput1, reprompt1, false));
        }
        callback(session.attributes, buildSpeechletResponse("some_Header", speechOutput, reprompt, false));
        console.log("ending handleAppointmentRequest");
}
 
 

function handleReadAppointment(intent, session, callback) {
    console.log("inside ReadAppIntent");
    var table = "Appointments";
    var today = new Date();
    var currentdate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

    var params = {
        TableName : table,
        Key:{
            "Date" : currentdate
        }
    };

    docClient.get(params, function(err, data) {
    console.log('inside read app method'+err)
    console.log('inside read app method'+data)
    if (err === null) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        var speechOutput1 = "You have no appointments today";
        var reprompt1 = "Do you want me to repeat that for you?";
        callback(session.attributes, buildSpeechletResponse("some_Header", speechOutput1, reprompt1, false));
    } else {
        console.log("Appointment data :", JSON.stringify(data,null, 2));
        var speechOutput = "You have" + data.Item.AppointmentType + "appointment today at" +data.Item.Time;
        var reprompt = "Do you want me to repeat that for you?";
        callback(session.attributes, buildSpeechletResponse("some_Header", speechOutput, reprompt, false));
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
    }
});
}
 
 
function handleWaterRecommendRequest(intent, session, callback) {
    console.log("inside handleWaterRecommendRequest");
    
    var params = {
    TableName: 'User',
    Key:{
        "Name": "shabeena"
    }
    };

    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            console.log(data);
            console.log(data.Item.Weight);
            var waterintake = Number(data.Item.Weight)*0.5;
            var noofglasses = Math.round(waterintake / 16);

            var today = new Date();
            var currentdate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            console.log(currentdate);
            
            var params = {
                Item: {
                Date: currentdate,
                Name: data.Item.Name,
                WaterConsumed: "0",
                WaterToBeConsumed: noofglasses
                },

                TableName: "WaterLogIntake"  
            }; 

            //insertRecord(params,"WaterRecommendation",callback);
            docClient.put(params, function(err, data) {
            if (err) {
                console.log("Error occured in insertRecord", JSON.stringify(err, null, 2));
            } else {
                console.log("Put succeeded:", JSON.stringify(data, null, 2));
            }
            });

            var speechOutput = "Your water intake for today should be " + noofglasses+ " glasses with each glass being 16 ounces each";
            var reprompt = "Do you want me to repeat that for you?";
            callback(session.attributes, buildSpeechletResponse("some_Header", speechOutput, reprompt, false));
        }
    });
    
     //calculate and insert in waterintake table - name, we
     
     console.log("ending handleWaterRecommendRequest");
}

function handleWaterConsumptionRequest(intent, session, callback) {
    console.log("inside handleWaterConsumptionRequest");
     if(intent.slots.Water_Count.value !== undefined) {        
            var watercount = intent.slots.Water_Count.value;
            var today = new Date();            
            console.log('water count'+ watercount);

            //update in the waterlogintake table
            var params = {
            TableName:"WaterLogIntake",
            Key:{
                "Date": today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()
            },

            UpdateExpression: "set WaterConsumed = :r",
            ExpressionAttributeValues:{
                ":r":watercount
            },
            ReturnValues:"UPDATED_NEW"
            };

            console.log("Updating the item...");
            docClient.update(params, function(err, data) {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                }
            });
            
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
    var table = "WaterLogIntake";
    var today = new Date();
    var currentdate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

    var params = {
        TableName : table,
        Key:{
            "Date" : currentdate
        }
    };

    docClient.get(params, function(err, data) {
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
            var waterLeftme = data.Item.WaterToBeConsumed - data.Item.WaterConsumed;
            console.log("waterLeftme:", waterLeftme);
            if(waterLeftme <= 0){ 
                      var speechOutput1 = "Great Job, You've met your daily limit.";
                      var reprompt1 = "Do you want me to repeat that for you?";
                      callback(session.attributes, buildSpeechletResponse("some_Header", speechOutput1, reprompt1, false));
            } else {
                var speechOutput = "To meet today's limit you need to drink " + waterLeftme+ " more glasses of water, with each glass being 16 ounces";
                var reprompt = "Do you want me to repeat that for you?";
                callback(session.attributes, buildSpeechletResponse("some_Header", speechOutput, reprompt, false));
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            }
            
    }
});
}


function handleMedicineDosageRequest(intent, session, callback) {
    console.log("inside handleMedicineDosageRequest");
    if(intent.slots.Medicine.value !== undefined) { 
    var medicineName = intent.slots.Medicine.value;
    var dosage = intent.slots.Dosage.value;
    if(dosage !== undefined)
    {
        dosage = 1;
        console.log('dosage is now 1')
    }
    var frequency = intent.slots.Frequency.value;
    var timeofday = intent.slots.TimeOfDay.value;
    var instruction = intent.slots.Instruction.value;
    var expirydate = intent.slots.ExpiryDate.value;
    var speechOutput = ""
    var reprompt = ""

    var data = {
            'Medicine' : medicineName,
            'Dosage' : dosage,
            'Frequency' : frequency,
            'TimeOfDay' : timeofday,
            'Instruction' : instruction,
            'ExpiryDate' : expirydate
    };
    console.log(data);
    insertRecord(data, "MedicineDosage", function(result) {
        var speechOutput = "There is an error";
        if (result != "ERROR") {
            console.log('reached with an output');
            console.log(result);
            speechOutput = "Great! We have your medicine routine recorded in our system!";
        } else {
            console.log("Oops.. something went wrong");
            speechOutput = "Oops.. something went wrong";
        }
        callback(session.attributes, buildSpeechletResponse("some_Header", speechOutput, "", false));
    });
    
            
    } 
    else 
    {
        speechOutput = "You have to specify the Medicine name and frequency. "+
            "Please try again. You can say, 2 pills of ibuprofine 2 times a day at afternoon after meal everyday until july first.";
        reprompt = "Please say medicine schedule.";
        callback(session.attributes, buildSpeechletResponse("some_Header", speechOutput, reprompt, false));
    }
        console.log("ending handleMedicineDosageRequest");
}



function handleReadMedicineDosage(intent, session, callback) {
    console.log("inside ReadMedicineIntent");
    var today = new Date();
    var month = "";
    
    if(today.getMonth().toString().length == 1)
        month = "0"+today.getMonth();
    else
        month = today.getMonth();
    
    var currentdate = today.getFullYear()+'-'+month+'-'+today.getDate();
    console.log(currentdate);

    var params = {
        TableName: "MedicineDosage",
        ProjectionExpression: "ExpiryDate, Medicine, Dosage, Instruction, Frequency, TimeOfDay",
    };


    docClient.scan(params, function(err, data) {
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        var speechOutput1 = "You have no medicines to take today.Stay happy and healthy.";
        var reprompt1 = "Do you want me to repeat that for you?";
        callback(session.attributes, buildSpeechletResponse("some_Header", speechOutput1, reprompt1, false));
    } else {
           console.log("Scan succeeded.");
           var firstmed = true
           var speechOutput = ""
           data.Items.forEach(function(row) {
            if(currentdate < row.ExpiryDate)
            {
                if(firstmed)
                {
                    speechOutput = "You have "+Object.keys(data.Items).length+" medicines in your medicine schedule   "
                    firstmed = false
                } 
                speechOutput = speechOutput.concat(row.Dosage+ " pills of " +row.Medicine+" "+row.Frequency +" times a day " +row.Instruction +" in the "+row.TimeOfDay+"      ");
            }
           });    
            var reprompt = "Do you want me to repeat that for you?";
            callback(session.attributes, buildSpeechletResponse("some_Header", speechOutput, reprompt, false));
            console.log("Get Read succeeded:", JSON.stringify(data, null, 2));    
        
        console.log("Get medicine succeeded:", JSON.stringify(data, null, 2));
    }
});
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
    if (request == "WaterRecommendation"){
        console.log('entering insertRecord for WaterRecommendation')
        params = {
            Item: {
                Name: data.Name,
                // Date: "2017-05-05",
                // WaterConsumed: data.WaterConsumed,
                // WaterToBeConsumed: data.WaterToBeConsumed,
                
            },

        TableName: "LogWaterIntake"
    };
    }
    if (request == "MedicineDosage"){
        console.log('entering insertRecord for handleMedicineDosage record')
        params = {
            Item: {
            Medicine : data.Medicine,
            Dosage : data.Dosage,
            Frequency : data.Frequency,
            TimeOfDay : data.TimeOfDay,
            Instruction : data.Instruction,
            ExpiryDate : data.ExpiryDate
        },

        TableName: "MedicineDosage"
    };
    }

    docClient.put(params, function(err, data) {
            if (err) {
                console.log("Error occured in insertRecord", err);
                callback("ERROR");
            } else {
                console.log("Put succeeded:", JSON.stringify(data, null, 2));
                callback("SUCCESS");
            }
        });
    console.log('exiting insertRecord');
    
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
