from fyers_apiv3 import fyersModel
import pandas as pd
import os
import pandas as pd
import plotly.graph_objects as go
import datetime as dt
from datetime import timedelta,datetime
from fyers_apiv3.FyersWebsocket import data_ws
with open("abcd.txt", 'r') as r:
    access_token = r.read()
client_id = "DZO41L3M36-100"
fyers = fyersModel.FyersModel(
    client_id=client_id, is_async=False, token=access_token, log_path=os.getcwd())
fyers.get_profile()
lines = [
    "NSE:NIFTY50-INDEX",
    "NSE:NIFTYBANK-INDEX",
    "NSE:ASIANPAINT-EQ",
    "NSE:EICHERMOT-EQ",
    "NSE:HEROMOTOCO-EQ",
    "NSE:ITC-EQ",
    "NSE:RELIANCE-EQ",
    "NSE:TATASTEEL-EQ",
    "NSE:DRREDDY-EQ",
    "NSE:BPCL-EQ",
    "NSE:INFY-EQ",
    "NSE:BRITANNIA-EQ",
    "NSE:NESTLEIND-EQ",
    "NSE:HINDALCO-EQ",
    "NSE:LT-EQ",
    "NSE:TATACONSUM-EQ",
    "NSE:WIPRO-EQ",
    "NSE:TITAN-EQ",
    "NSE:KOTAKBANK-EQ",
    "NSE:BAJFINANCE-EQ",
    "NSE:CIPLA-EQ",
    "NSE:GRASIM-EQ",
    "NSE:HINDUNILVR-EQ",
    "NSE:M&M-EQ",
    "NSE:TATAMOTORS-EQ",
    "NSE:APOLLOHOSP-EQ",
    "NSE:SBIN-EQ",
    "NSE:UPL-EQ",
    "NSE:ADANIENT-EQ",
    "NSE:SUNPHARMA-EQ",
    "NSE:JSWSTEEL-EQ",
    "NSE:HDFCBANK-EQ",
    "NSE:TCS-EQ",
    "NSE:ICICIBANK-EQ",
    "NSE:POWERGRID-EQ",
    "NSE:MARUTI-EQ",
    "NSE:INDUSINDBK-EQ",
    "NSE:AXISBANK-EQ",
    "NSE:HCLTECH-EQ",
    "NSE:ONGC-EQ",
    "NSE:NTPC-EQ",
    "NSE:COALINDIA-EQ",
    "NSE:BHARTIARTL-EQ",
    "NSE:TECHM-EQ",
    "NSE:LTIM-EQ",
    "NSE:DIVISLAB-EQ",
    "NSE:ADANIPORTS-EQ",
    "NSE:HDFCLIFE-EQ",
    "NSE:SBILIFE-EQ",
    "NSE:ULTRACEMCO-EQ",
    "NSE:BAJAJ-AUTO-EQ",
    "NSE:BAJAJFINSV-EQ",
    "NSE:3MINDIA-EQ",
    "NSE:AARTIIND-EQ",
    "NSE:ABB-EQ",
    "NSE:ADANIENTERPRISES-EQ",
    "NSE:ADANIPORTS-EQ",
    "NSE:ALKEM-EQ",
    "NSE:AMBUJACEM-EQ",
    "NSE:APOLLOTYRE-EQ",
    "NSE:ASHOKLEY-EQ",
    "NSE:ASIANPAINT-EQ",
    "NSE:AXISBANK-EQ",
    "NSE:BAJAJFINSV-EQ",
    "NSE:BAJAJ-AUTO-EQ",
    "NSE:BAJFINANCE-EQ",
    "NSE:BANDHANBNK-EQ",
    "NSE:BANKBARODA-EQ",
    "NSE:BATAINDIA-EQ",
    "NSE:BHARATFORGE-EQ",
    "NSE:BHARTIARTL-EQ",
    "NSE:BHEL-EQ",
    "NSE:BOSCHLTD-EQ",
    "NSE:BPCL-EQ",
    "NSE:BRITANNIA-EQ",
    "NSE:CANBK-EQ",
    "NSE:CASTROLIND-EQ",
    "NSE:CENTRALBK-EQ",
    "NSE:CHOLAFIN-EQ",
    "NSE:CIPLA-EQ",
    "NSE:COALINDIA-EQ",
    "NSE:COLPAL-EQ",
    "NSE:CONCOR-EQ",
    "NSE:DABUR-EQ",
    "NSE:DALBHARAT-EQ",
    "NSE:DELTACORP-EQ",
    "NSE:DIVISLAB-EQ",
    "NSE:DRREDDY-EQ",
    "NSE:EICHERMOT-EQ",
    "NSE:FEDERALBNK-EQ",
    "NSE:GAIL-EQ",
    "NSE:GODREJCP-EQ",
    "NSE:GODREJPROP-EQ",
    "NSE:GRASIM-EQ",
    "NSE:GUJGASLTD-EQ",
    "NSE:HAL-EQ",
    "NSE:HCLTECH-EQ",
    "NSE:HDFCBANK-EQ",
    "NSE:HDFCLIFE-EQ",
    "NSE:HEROMOTOCO-EQ",
    "NSE:HINDALCO-EQ",
    "NSE:HINDUNILVR-EQ",
    "NSE:ICICIBANK-EQ",
    "NSE:IGL-EQ",
    "NSE:INDIANBANK-EQ",
    "NSE:INDIGO-EQ",
    "NSE:INDUSINDBK-EQ",
    "NSE:INDUSTOWER-EQ",
    "NSE:INFY-EQ",
    "NSE:IOC-EQ",
    "NSE:IPCALAB-EQ",
    "NSE:IRCTC-EQ",
    "NSE:IRFC-EQ",
    "NSE:ITC-EQ",
    "NSE:JINDALSTEL-EQ",
    "NSE:JSWENERGY-EQ",
    "NSE:JSWINFRA-EQ",
    "NSE:JSWSTEEL-EQ",
    "NSE:KALYANKJIL-EQ",
    "NSE:KOTAKBANK-EQ",
    "NSE:KPITTECH-EQ",
    "NSE:LAURUSLABS-EQ",
    "NSE:LICHSGFIN-EQ",
    "NSE:LICI-EQ",
    "NSE:LODHA-EQ",
    "NSE:LTIM-EQ",
    "NSE:LT-EQ",
    "NSE:LUPIN-EQ",
    "NSE:MANKIND-EQ",
    "NSE:MARICO-EQ",
    "NSE:MARUTI-EQ",
    "NSE:MAXHEALTH-EQ",
    "NSE:MAZDOCK-EQ",
    "NSE:MPHASIS-EQ",
    "NSE:MRF-EQ",
    "NSE:M_M-EQ",
    "NSE:NAUKRI-EQ",
    "NSE:NESTLEIND-EQ",
    "NSE:NHPC-EQ",
    "NSE:NIFTY50-EQ",
    "NSE:NIFTY50_INDEX-EQ",
    "NSE:NIFTYBANK_INDEX-EQ",
    "NSE:NIFTY_500_5MIN_DATA-EQ",
    "NSE:NIFTY_500_HOURLY_DATA-EQ",
    "NSE:NIFTY_500_ONE_DAY-EQ",
    "NSE:NMDC-EQ"
]
import mysql.connector

# Define database connection details
db_config = {
    'host': '118.139.182.3',
    'user': 'sqluser1',
    'password': 'TGDp0U&[1Y4S',
    'database': 'stocks'
}


con = mysql.connector.connect(**db_config)
cur = con.cursor()
yesterday = (datetime.now() - timedelta(1)).strftime('%Y-%m-%d')
# day_before_yesterday = (datetime.now() - timedelta(2)).strftime('%Y-%m-%d')
for line in lines:
    line = line.strip()
    data = {
            "symbol": line,
            "resolution": "5",
            "date_format": "1",
            "range_from": yesterday,
            "range_to": yesterday,
            "cont_flag": "1"
        }
    df = fyers.history(data=data)
    df = pd.DataFrame(df['candles'])
    df.columns = ['date', 'open', 'high', 'low', 'close', 'volume']
    df['date'] = pd.to_datetime(df['date'], unit='s')
    df.date = (df.date.dt.tz_localize('UTC').dt.tz_convert('Asia/Kolkata'))
    df['date'] = df['date'].dt.tz_localize(None)
    df_sorted = df.sort_values(by=['date'], ascending=True)
    df = df_sorted.drop_duplicates(subset='date', keep='first')
    df.reset_index(drop=True, inplace=True)

    parts = line.split(':')[-1].replace('-', '_').replace('&', '_')
    line = parts.lower()

    for _, row in df.iterrows():
        query = f"""
                INSERT INTO {line} VALUES ('{row['date']}',{row['open']},{row['high']},{row['low']},{row['close']},{row['volume']})
                """
#     query = f"""
#                 DELETE FROM {line} WHERE `date` > '2024-06-13'
#                 """
        cur.execute(query)
    con.commit()
con.close()
