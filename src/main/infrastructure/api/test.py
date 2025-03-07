### THIS IS authorization_code_grant_flow_pkce.py !!!

import json
import pkce

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

    print(config)

    app_id = config['app']['id']
    app_secret = config['app']['secret']
    base_url = config['app_store']['base_url']

@route('/auth')
def auth():
    """After logging in the browser is redirected here where the server complete authorization"""
    global client
    auth_code = request.query.code

    client = app_store.complete_authorization_code_grant_flow(auth_code, app_id, app_secret, "http://localhost:8080/auth", code_verifier=code_verifier, base_url=base_url)

    print(client.refresh_token)

    redirect('/data_sources')

@route('/info')
def info():
    """Once authorized the user is redirected here which displays there app store user info"""
    data = client.get_user_info()
    print("info")
    return str(data)

@route('/data_sources')
def data_sources():
    global client
    global list
    list = []

    sources = client.get_data_core_client().get_data_sources()

    for i in range(len(sources)):
        for k, v in sources[i].items():
            if k == 'Name':
                list.append(v['QualifiedName'])
    
    redirect('/tags')

@route('/tags')
def tags():
    
    global client

    #the list item will be whatever data source the user chooses - needs to be gotten from the API
    tags = client.get_data_core_client().get_tags(list[0])

    for i in range(len(tags)):
        for k, v in tags[i].items():
            if k == 'Properties':
                for l,m in v.items():
                    if l == 'UTC Earliest Raw Sample Time':
                        for n,o in m.items():
                            if n == 'Value':
                               return o
                            

@route('/refresh')
def info():
    """Refresh teh client session using the refresh token"""
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