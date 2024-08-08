from fyers_apiv3 import fyersModel
import webbrowser

redirect_uri= "http://127.0.0.1"  ## redircet_uri you entered while creating APP.
client_id = "DZO41L3M36-100"                       ## Client_id here refers to APP_ID of the created app
secret_key = "FDGH8EAMHW"                          ## app_secret key which you got after creating the app 
grant_type = "authorization_code"                  ## The grant_type always has to be "authorization_code"
response_type = "code"                             ## The response_type always has to be "code"
state = "sample"                                   ##  The state field here acts as a session manager. you will be sent with the state field after successfull generation of auth_code 
FY_ID="YL00137"
TOTP_KEY="EWQ3JH35FTQA6IQLYNZEGNB7WACXTRSG"
PIN="2002"

# redirect_uri= "http://127.0.0.1"  ## redircet_uri you entered while creating APP.
# client_id = "7DRCQEYSRQ-100"                       ## Client_id here refers to APP_ID of the created app
# secret_key = "JIZC079I3Y"                          ## app_secret key which you got after creating the app 
# grant_type = "authorization_code"                  ## The grant_type always has to be "authorization_code"
# response_type = "code"                             ## The response_type always has to be "code"
# state = "sample"                                   ##  The state field here acts as a session manager. you will be sent with the state field after successfull generation of auth_code 
# FY_ID="YT03345"
# TOTP_KEY="UWYZCCQXEYEJQCKNKQZMIWQCQYXMQRIO"
# PIN="1111"

### Connect to the sessionModel object here with the required input parameters
appSession = fyersModel.SessionModel(client_id = client_id, redirect_uri = redirect_uri,response_type=response_type,state=state,secret_key=secret_key,grant_type=grant_type)

# ## Make  a request to generate_authcode object this will return a login url which you need to open in your browser from where you can get the generated auth_code 
generateTokenUrl = appSession.generate_authcode()
generateTokenUrl
from datetime import datetime, timedelta, date
from  time import sleep
import os
import pyotp
import requests
import json
import math
import pytz
from urllib.parse import parse_qs,urlparse
import warnings
import pandas as pd
pd.set_option('display.max_columns', None)
warnings.filterwarnings('ignore')

import base64
def getEncodedString(string):
    string = str(string)
    base64_bytes = base64.b64encode(string.encode("ascii"))
    return base64_bytes.decode("ascii")
  



URL_SEND_LOGIN_OTP="https://api-t2.fyers.in/vagator/v2/send_login_otp_v2"
res = requests.post(url=URL_SEND_LOGIN_OTP, json={"fy_id":getEncodedString(FY_ID),"app_id":"2"}).json()   
print(res) 

if datetime.now().second % 30 > 27 : sleep(5)
URL_VERIFY_OTP="https://api-t2.fyers.in/vagator/v2/verify_otp"
res2 = requests.post(url=URL_VERIFY_OTP, json= {"request_key":res["request_key"],"otp":pyotp.TOTP(TOTP_KEY).now()}).json()  
print(res2) 


ses = requests.Session()
URL_VERIFY_OTP2="https://api-t2.fyers.in/vagator/v2/verify_pin_v2"
payload2 = {"request_key": res2["request_key"],"identity_type":"pin","identifier":getEncodedString(PIN)}
res3 = ses.post(url=URL_VERIFY_OTP2, json= payload2).json()  
print(res3) 


ses.headers.update({
    'authorization': f"Bearer {res3['data']['access_token']}"
})


TOKENURL="https://api-t1.fyers.in/api/v3/token"
payload3 = {"fyers_id":FY_ID,
           "app_id":client_id[:-4],
           "redirect_uri":redirect_uri,
           "appType":"100","code_challenge":"",
           "state":"None","scope":"","nonce":"","response_type":"code","create_cookie":True}

res3 = ses.post(url=TOKENURL, json= payload3).json()  
print(res3)


url = res3['Url']
print(url)
parsed = urlparse(url)
auth_code = parse_qs(parsed.query)['auth_code'][0]
auth_code


grant_type = "authorization_code" 

response_type = "code"  

session = fyersModel.SessionModel(
    client_id=client_id,
    secret_key=secret_key, 
    redirect_uri=redirect_uri, 
    response_type=response_type, 
    grant_type=grant_type
)

# Set the authorization code in the session object
session.set_token(auth_code)

# Generate the access token using the authorization code
response = session.generate_token()

# Print the response, which should contain the access token and other details
#print(response)


access_token = response['access_token']

# Initialize the FyersModel instance with your client_id, access_token, and enable async mode
f = open("abcd.txt", "w")
f.write(access_token)
f.close()

import os
import re

# Define the path to the index.js file
index_js_path = os.path.join("static", "index.js")

# Prepare the new JavaScript content with the access token
new_access_token_line = f'const accessToken = "{access_token}";\n'

# Read the existing content of the file
with open(index_js_path, "r") as f:
    existing_content = f.readlines()

# Flag to track if the accessToken line was replaced
access_token_replaced = False

# Open the file in write mode to overwrite with updated content
with open(index_js_path, "w") as f:
    for line in existing_content:
        # Check if the line contains the accessToken variable
        if line.strip().startswith("const accessToken"):
            # Replace the existing accessToken line
            f.write(new_access_token_line)
            access_token_replaced = True
        else:
            # Write the existing line as it is
            f.write(line)
    
    # If accessToken was not replaced, prepend it
    if not access_token_replaced:
        f.write(new_access_token_line)
        f.write('\n')  # Ensure a newline after the new accessToken line

print(f"Access token has been updated in {index_js_path}")


fyers = fyersModel.FyersModel(client_id=client_id, is_async=False, token=access_token, log_path=os.getcwd())
fyers.get_profile()