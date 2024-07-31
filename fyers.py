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

### Connect to the sessionModel object here with the required input parameters
appSession = fyersModel.SessionModel(client_id = client_id, redirect_uri = redirect_uri,response_type=response_type,state=state,secret_key=secret_key,grant_type=grant_type)

# ## Make  a request to generate_authcode object this will return a login url which you need to open in your browser from where you can get the generated auth_code 
generateTokenUrl = appSession.generate_authcode()


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
# print(res) 

if datetime.now().second % 30 > 27 : sleep(5)
URL_VERIFY_OTP="https://api-t2.fyers.in/vagator/v2/verify_otp"
res2 = requests.post(url=URL_VERIFY_OTP, json= {"request_key":res["request_key"],"otp":pyotp.TOTP(TOTP_KEY).now()}).json()  

ses = requests.Session()
URL_VERIFY_OTP2="https://api-t2.fyers.in/vagator/v2/verify_pin_v2"
payload2 = {"request_key": res2["request_key"],"identity_type":"pin","identifier":getEncodedString(PIN)}
res3 = ses.post(url=URL_VERIFY_OTP2, json= payload2).json()  


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
# print(res3)


url = res3['Url']
parsed = urlparse(url)
auth_code = parse_qs(parsed.query)['auth_code'][0]


grant_type = "authorization_code" 

response_type = "code"  

session = fyersModel.SessionModel(
    client_id=client_id,
    secret_key=secret_key, 
    redirect_uri=redirect_uri, 
    response_type=response_type, 
    grant_type=grant_type
)

session.set_token(auth_code)
response = session.generate_token()
access_token = response['access_token']

f = open("abcd.txt", "w")
f.write(access_token)
f.close()

# os.environ['FYERS_ACCESS_TOKEN'] = access_token

# # import requests

# token123 = os.environ.get('FYERS_ACCESS_TOKEN')
# if not token123:
#     raise ValueError("Access token not found. Make sure to authenticate first.")

# # Initialize the Fyers API model
# fyers = fyersModel.FyersModel(client_id=client_id, token=token123)

# # Prepare the request payload for historical data
# historical_data_params = {
#     "symbol": "NSE:RELIANCE-EQ",
#     "resolution": "D",  # Options: '1', '3', '5', '15', '30', '60', 'D', 'W', 'M'
#     "date_format": "1",
#     "range_from": "2022-01-01",
#     "range_to": "2023-01-01",
#     "cont_flag": "1"
# }

# # Fetch historical data
# historical_data_response = fyers.history(historical_data_params)

# # Check if the request was successful
# if historical_data_response["s"] == "ok":
#     historical_data = historical_data_response["candles"]
#     print(historical_data)
# else:
#     print(f"Error: {historical_data_response}")