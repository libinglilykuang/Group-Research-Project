import json
import urllib
import matplotlib.pyplot as plt
import pandas as pd
from datetime import datetime, timedelta

from bottle import route, run, request, redirect

import pkce

import intelligent_plant.app_store_client as app_store
import intelligent_plant.utility as utility

'''app_id = None
app_secret = None
base_url = None'''

app_id = 0
app_secret = 0
base_url = 0

#in the real world a new client would need to be instanced per user
client = 0
code_verifier = 0

#load the json config file with the app information
with open('config.json') as json_config_file:
    config = json.load(json_config_file)

    #print(config)

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

    redirect('/info')

@route('/info')
def info():
    """Once authorized the user is redirected here which displays there app store user info"""
    data = client.get_user_info()
    return str(data)

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

def app_store_queries():
    """
    Tests the app store queries.
    :param app_store: An app store client instance.
    """
    #get the current users app store info

app_store.get_user_info()

run(host='localhost', port=8080, debug = True)

