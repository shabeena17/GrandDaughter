/**
 * @Author: Mohamed Nisar <mohamedn@qburst.com>
 * 
 * This file contains all text helpers.
 */

'use strict';
var textHelper = (function () {
    return {
        helpText: 'You can store your doctor appointments,'
            + ' find your doctor appointments for a date,'
            + ' list all appointments, or clear your last appointment. ',
        examplesText: 'Here\'s some things you can say,'
            + ' ,'
            + ' get me all appointments,'
            + ' find my appointments on last friday,'
            + ' get my appointments on yesterday,'
            + ' correction,'
            + ' help'
            + ' and exit. What would you like? ',
        invalidExercise: 'That\'s not a valid appointment. Please repeat. ',
    };
})();
module.exports = textHelper;
