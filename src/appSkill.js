/**
 * @Author: Mohamed Nisar <mohamedn@qburst.com>
 */

'use strict';
var AlexaSkill = require('AlexaSkill'),
    eventHandlers = require('eventHandlers'),
    intentHandlers = require('intentHandlers');

var APP_ID = undefined;//replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";
var skillContext = {};

/**
 * appSkill is a child of AlexaSkill.
 */
var appSkill = function () {
    AlexaSkill.call(this, APP_ID);
    skillContext.needMoreHelp = true;
};


// Extend AlexaSkill
appSkill.prototype = Object.create(AlexaSkill.prototype);
appSkill.prototype.constructor = appSkill;

eventHandlers.register(appSkill.prototype.eventHandlers, skillContext);
intentHandlers.register(appSkill.prototype.intentHandlers, skillContext);

module.exports = appSkill;

