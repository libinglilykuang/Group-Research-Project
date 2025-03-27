import json
import pkce
import datetime

from bottle import route, run, request, redirect

import intelligent_plant.app_store_client as app_store
import intelligent_plant.data_core_client as data_core

app_id = None
app_secret = None
base_url = None

#in the real world a new client would need to be instanced per user
client = None
code_verifier = None

#load the json config file with the app information
with open('config.json') as json_config_file:
    config = json.load(json_config_file)

    app_id = config['app']['id']
    app_secret = config['app']['secret']
    base_url = config['app_store']['base_url']

@route('/auth')
def auth():
    """After logging in the browser is redirected here where the server complete authorization"""
    global client
    auth_code = request.query.code

    client = app_store.complete_authorization_code_grant_flow(auth_code, app_id, app_secret, "http://localhost:8080/auth", code_verifier=code_verifier, base_url=base_url)

    #print(client.refresh_token)

    redirect('/data_sources')

@route('/info')
def info():
    """Once authorized the user is redirected here which displays there app store user info"""
    data = client.get_user_info()
    print("info")
    return str(data)

@route('/data_sources')
def data_sources():
    #once authorised, the data sources names are retrieved from the API and stored in a list
    global client
    global qualifiedNames
    global dsnNames
    qualifiedNames = [] #list of qualified names
    dsnNames = {} #dictionary where keys are qualified names and values are plain text names

    sources = client.get_data_core_client().get_data_sources()

    for i in range(len(sources)):
        for k, v in sources[i].items():
            if k == 'Name':
                qualifiedNames.append(v['QualifiedName'])
                dsnNames[v['QualifiedName']] = v['Name']

    redirect('/get_data')

@route('/get_data')
def get_data():
    #Once the data sources are retrieved, the tags are retrieved and parsed for the relevant data, and a request to get the data from the API is sent
    global client

    dsn = '' #data source name
    startDate = datetime.datetime(2025,3,9)
    endDate = datetime.datetime(2025,3,10)
    pointCount = 0 # number of data points to return - if this is set to 0, the max will be returned (5000)

    returnData = [] #2d array to return to the compression team where items are [time,value]

    #choose the data source to get data from
    dsn = qualifiedNames[2] #the list item will be whatever data source the user chooses - HARDCODED FOR 'NOISYSINWAVE', NEEDS TO BE UPDATED BASED ON UI
    
    #retrieving tag data for the data source - this is needed for the API compression data query
    tags = client.get_data_core_client().get_tags(dsn) #getting the dict from the API
    id = tags[0]["Id"] #getting data from the dict
    startDate = tags[0]["Properties"]['UTC Earliest Raw Sample Time']['Value'] #getting start datetime
    endDate = tags[0]["Properties"]['UTC Latest Raw Sample Time']['Value'] #getting end datetime

    #attempt to query the API
    try:
        data = client.get_data_core_client().get_raw_data({dsn:[id]},startDate,endDate,pointCount) #this is hardcoded to get data from the 9th of march to the 10th of march
        print("API Request Complete!")
    except:
        print("API Request Failed.")

    #add data point time and value to the array 'returnData'
    if pointCount == 0:
        for i in range(5000):
            returnData.append([data[dsn][id]['Values'][i]['UtcSampleTime'],data[dsn][id]['Values'][i]['NumericValue']])
    else:
        for i in range(pointCount):
            returnData.append([data[dsn][id]['Values'][i]['UtcSampleTime'],data[dsn][id]['Values'][i]['NumericValue']])

    #return the array as a string
    return str(returnData)

@route('/refresh')
def info():
    """Refresh the client session using the refresh token"""
    global client
    print("Old access token: ", client.access_token)
    client = client.refresh_session(app_id, app_secret)
    print("New access token: ", client.access_token)
    return "Refreshed"

@route('/')
def index():
    """Users land here at the route and get redirected to the app store login page"""
    global code_verifier
    code_verifier, code_challenge = pkce.generate_pkce_pair()
    url = app_store.get_authorization_code_grant_flow_url(app_id, "http://localhost:8080/auth", ["UserInfo", "DataRead"], code_challenge=code_challenge, code_challenge_method='S256', access_type='offline', base_url=base_url)
    redirect(url)

run(host='localhost', port=8080, debug = True)