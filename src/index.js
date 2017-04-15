/**
 * @Author: Mohamed Nisar <mohamedn@qburst.com>
 */
process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];

'use strict';
var AppSkill = require('appSkill');

exports.handler = function (event, context) {
    console.log(AppSkill);
    var appSkill = new AppSkill();
    appSkill.execute(event, context);    
};
