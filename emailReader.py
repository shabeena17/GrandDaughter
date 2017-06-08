from flask import Flask, request, render_template
from flask_restful import reqparse, abort, Api, Resource
import json
import re
import logging
import string
import errno
import gmail 
import datetime
import ast
import json
from flask import jsonify
from bs4 import BeautifulSoup
import datetime
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

#curl -H "Content-Type: application/json" -X POST -d '{"unread" :"True"}' localhost:5000/email 
#curl -H "Content-Type: application/json" -X POST -d '{"sender": "mrnaik@scu.edu"}' http://54.147.79.105:5000/email

"""
Flask Setup
"""
app = Flask(__name__)
api = Api(app)


"""Logger Setup

Logs events into GrandDaughter.log at Debug level in the following format: 'Time  LevelName(Debug,Info,etc.) LogMessage'
Logger Level is set to DEBUG to display all debug messages too currently

"""
logger = logging.getLogger('GrandDaughter')
hdlr = logging.FileHandler('GrandDaughter.log')
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
logger.addHandler(hdlr) 
logger.setLevel(logging.DEBUG)


@app.before_request
def logRequestInfo():
    """
    Logs the Post Request Sent to The End Point

    """
    app.logger.debug('Headers: %s', request.headers)
    app.logger.debug('Data Payload: %s', request.get_data())
    logger.info('Headers: %s', request.headers)
    logger.info('Data Payload: %s', request.get_data())


@app.errorhandler(404)
def pageNotFound(e):
    """Default Error 404 Handle

    Returns:
        JSON message: Wrong Endpoint

    """
    #Default 404 Error
    logger.info('Deafault page 404')
    return jsonify("{Error:[ Message: No Endpoint Here]}")


## LOGIN CREDENTIALS
# --------------------

def credentialsFetch():
    """
    Fetches Username and Password From DB/temp
    """
    username = "gd4alexa@gmail.com"
    password = "alexa1234"
    return [username, password]


def Account():
    print "Logging In"
    username, password = credentialsFetch()
    try:
        emailObj = gmail.login(username, password)
        if emailObj.logged_in:
            print "Successfully Signed In"
            return emailObj
        else:
            print jsonify("{Status: ['FAILED':'Authentication Failed']}")
            return emailObj
    except Exception as e:
        print jsonify("{Status: ['FAILED':'Authentication Failed: Exception Occured']}")
    return emailObj 



class login(Resource):
    """Class login endpoint for Post Requests

    """
    def get(self):
        """Handles the Post Request functionality

        Args:
            Passed in {emailObject} format
            emailObject: PyGmail Object

        Returns:
            JSON output

        """
        return Account()


## READ FUNCTIONS
# ----------------

def makeJson(listofEmails):
    print 'Inside Json-er'
    output = jsonify({'emails':[{'from':k[0],
            'date':k[1],
            'subject':k[2],
            'body':k[3]
            } for k in listofEmails]})
    print output
    return output


#Read Email
def readEmail(emailsObj):
    emailList = []
    if len(emailsObj)==0:
        print "No new Emails"
    else:
        for email in emailsObj:
            email.fetch() # can also unread(), delete(), spam(), or star()
            unclean = email.body
            soup = BeautifulSoup(str(unclean))
            [s.extract() for s in soup(['style', 'script', '[document]', 'head', 'title'])]
            visible_text = re.sub('\s+', ' ', soup.getText()).replace(u'\xa0', u' ')
            visible_text = re.sub(r'\w+:\/{2}[\d\w-]+(\.[\d\w-]+)*(?:(?:\/[^\s/]*))*', '', visible_text)
            emailList.append([email.fr, 
                            email.sent_at.strftime('%d %B %Y'), 
                            email.subject, 
                            visible_text.encode('ascii', 'ignore')])
        # print emailList
    return makeJson(emailList)



## FILTERS
# ----------

def getdate(d):
    print "Inside getDate"
    datestr = 'datetime.date('+str(datetime.strptime(d, '%Y-%m-%d').strftime('%Y')) \
                        +','+str(datetime.strptime(d, '%Y-%m-%d').strftime('%m'))\
                        +','+str(datetime.strptime(d, '%Y-%m-%d').strftime('%d'))+')'
    print datestr
    return datestr

def getEmail(obj, builder):
    print "Inside getEmail"
    print builder
    r = obj.all_mail().mail(**builder)
    # print namestr(r, globals())
    return readEmail(r)


class emailReader(Resource):
    """Class EmailReader endpoint for Post Requests

    """
    def get(self):
        user = request.args.get('user')
        print "get get get"
        return jsonify('{"Testing": "hello"}')


    def post(self):
        """Handles the Post Request functionality

        Args:
            Passed in 
            {   unread= True, 
                sender= rf@xyz.com, 
                to= wef@gmail.com, 
                on= datetime.date(2009, 1, 1), 
                after= datetime.date(2009, 1, 1),
                before= datetime.date(2009, 1, 1)
            }
            emailObject: PyGmail Object

        Returns:
            JSON output
        """
        json_data = {   "unread": "null", 
                "sender": "null", 
                "to": "null", 
                "on": "null", 
                "after": "null",
                "before": "null"
            }
        mail = Account()
        argumentBuild = []
        print "HERE"
        json_data = request.get_json(force=True)
        print json_data
        try:
            if json_data['unread']:
                print "Inside UnRead"
                argumentBuild.append('unread = '+str(json_data['unread']))
        except:
            pass
            print "unread OUT"
        try:
            if json_data['sender']:
                argumentBuild.append('sender='+'"'+str(json_data['sender'])+'"')
        except: 
            pass
            print "sender OUT"
        try:
            if json_data['to']:
                argumentBuild.append('to='+str(json_data['to']))
        except:
            pass
            print "to OUT"
        try:
            if json_data['on']:
                json_data["on"] = datetime.strptime(json_data["on"], '%Y-%m-%d')
                argumentBuild.append('on='+json_data["on"])

            elif (json_data['after']) and (json_data['before']):
                afterDate = getDate(str(json_data['after']))
                beforeDate = getDate(str(json_data['before']))
                argumentBuild.append('after='+str(afterDate)+', '+'before='+str(beforeDate))
        except:
            pass
            print "dates OUT"
        #mail.inbox().mail(**json_data)
        passmessage = ",".join(argumentBuild)
        print str(passmessage)
        return getEmail(mail, json_data)

  


api.add_resource(login, '/login')
api.add_resource(emailReader, '/email')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
