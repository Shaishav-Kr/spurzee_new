from fyers_apiv3 import fyersModel
import pandas as pd
import os
import datetime as dt
from datetime import timedelta
import mysql.connector

# Read access token from a file
with open("abcd.txt", 'r') as r:
    access_token = r.read()

# Initialize Fyers API client
client_id = "DZO41L3M36-100"
fyers = fyersModel.FyersModel(
    client_id=client_id, is_async=False, token=access_token, log_path=os.getcwd())
fyers.get_profile()

# List of stock symbols to fetch data for
lines = [
    "NSE:ABB-EQ",
    "NSE:3MINDIA-EQ",
    "NSE:AARTIIND-EQ",
    "NSE:AEGISLOGI-EQ",
    "NSE:ALKEM-EQ",
    "NSE:AMBUJACEM-EQ",
    "NSE:APOLLOTYRE-EQ",
    "NSE:ASHOKLEY-EQ",
    "NSE:AVINRO-EQ",
    "NSE:BANDHANBNK-EQ",
    "NSE:BANKBARODA-EQ",
    "NSE:BATAINDIA-EQ",
    "NSE:BHARATELEC-EQ",
    "NSE:BHARATFORG-EQ",
    "NSE:BHEL-EQ",
    "NSE:BHARTIARTL-EQ",
    "NSE:BOSCHLTD-EQ",
    "NSE:CADILAHC-EQ",
    "NSE:CANBK-EQ",
    "NSE:CASTROLIND-EQ",
    "NSE:CENTRALBK-EQ",
    "NSE:CHOLAFIN-EQ",
    "NSE:CITYUNIONB-EQ",
    "NSE:COLPAL-EQ",
    "NSE:CONCOR-EQ",
    "NSE:DABUR-EQ",
    "NSE:DALBHARAT-EQ",
    "NSE:DELTACORP-EQ",
    "NSE:DHFL-EQ",
    "NSE:EMAMI-EQ",
    "NSE:FEDERALBNK-EQ",
    "NSE:GAIL-EQ",
    "NSE:GODREJCP-EQ",
    "NSE:GODREJPROP-EQ",
    "NSE:GUJGASLTD-EQ",
    "NSE:HAL-EQ",
    "NSE:HINDUNILVR-EQ",
    "NSE:INDIABULLSHSG_FIN-EQ",
    "NSE:INDIANB-EQ",
    "NSE:IOC-EQ",
    "NSE:IRCTC-EQ",
    "NSE:IRFC-EQ",
    "NSE:IGL-EQ",
    "NSE:INDUSTOWER-EQ",
    "NSE:NAUKRI-EQ",
    "NSE:INDIGO-EQ",
    "NSE:IPCALAB-EQ",
    "NSE:JINDALSTEL-EQ",
    "NSE:JSWENERGY-EQ",
    "NSE:JSWINFRA-EQ",
    "NSE:KPITTECH-EQ",
    "NSE:KALYANKJIL-EQ",
    "NSE:LICHSGFIN-EQ",
    "NSE:LAURUSLABS-EQ",
    "NSE:LICI-EQ",
    "NSE:LUPIN-EQ",
    "NSE:MRF-EQ",
    "NSE:LODHA-EQ",
    "NSE:MMFIN-EQ",
    "NSE:MANKIND-EQ",
    "NSE:MARICO-EQ",
    "NSE:MAXHEALTH-EQ",
    "NSE:MAZDOCK-EQ",
    "NSE:MPHASIS-EQ",
    "NSE:NABARD-EQ",
    "NSE:NHPC-EQ",
    "NSE:NMDC-EQ",
    "NSE:NESTLEIND-EQ",
    "NSE:ONGC-EQ",
    "NSE:OIL-EQ",
    "NSE:PAYTM-EQ",
    "NSE:OFSS-EQ",
    "NSE:POLICYBZR-EQ",
    "NSE:PIIND-EQ",
    "NSE:PAGEIND-EQ",
    "NSE:PATANJALI-EQ",
    "NSE:PERSISTENT-EQ",
    "NSE:PETRONET-EQ",
    "NSE:PIDILITIND-EQ",
    "NSE:PEL-EQ",
    "NSE:POLYCAB-EQ",
    "NSE:POONAWALLA-EQ",
    "NSE:PFC-EQ",
    "NSE:PRESTIGE-EQ",
    "NSE:PNB-EQ",
    "NSE:RECLTD-EQ",
    "NSE:RVNL-EQ",
    "NSE:SBICARD-EQ",
    "NSE:SJVN-EQ",
    "NSE:SRF-EQ",
    "NSE:SHREECEM-EQ",
    "NSE:SHRIRAMFIN-EQ",
    "NSE:SIEMENS-EQ",
    "NSE:SONACOMS-EQ",
    "NSE:SAIL-EQ",
    "NSE:SUNPHARMA-EQ",
    "NSE:SUNTV-EQ",
    "NSE:SUPREMEIND-EQ",
    "NSE:SUZLON-EQ",
    "NSE:SYNGENE-EQ",
    "NSE:TVSMOTOR-EQ",
    "NSE:TATACHEM-EQ",
    "NSE:TATACOMM-EQ",
    "NSE:TCS-EQ",
    "NSE:TATACONSUM-EQ",
    "NSE:TATAELXSI-EQ",
    "NSE:TATAMOTORS-EQ",
    "NSE:TATAPOWER-EQ",
    "NSE:TATASTEEL-EQ",
    "NSE:TATATECH-EQ",
    "NSE:TECHM-EQ",
    "NSE:TITAN-EQ",
    "NSE:TORNTPHARM-EQ",
    "NSE:TORNTPOWER-EQ",
    "NSE:TRENT-EQ",
    "NSE:TIINDIA-EQ",
    "NSE:UPL-EQ",
    "NSE:ULTRACEMCO-EQ",
    "NSE:UNIONBANK-EQ",
    "NSE:UNITDSPR-EQ",
    "NSE:VEDL-EQ",
    "NSE:VOLTAS-EQ",
    "NSE:WIPRO-EQ",
    "NSE:YESBANK-EQ",
    "NSE:ZEEL-EQ",
    "NSE:ZOMATO-EQ",
    "NSE:ZYDUSLIFE-EQ"
]


# Define database connection details
db_config = {
    'host': '118.139.182.3',
    'user': 'sqluser1',
    'password': 'TGDp0U&[1Y4S',
    'database': 'stocks'
}

def fetch_and_save_data(symbol):
    """Fetches historical stock data, saves it to a CSV file, and inserts it into a MySQL table.

    Args:
        symbol: The stock symbol.
    """
    start_date = dt.datetime(2017, 1, 1)
    end_date = dt.datetime.today() - timedelta(days=1)  # Until yesterday

    all_data = []

    while start_date < end_date:
        chunk_end = min(start_date + timedelta(days=99), end_date)

        data = {
            "symbol": symbol,
            "resolution": "5",
            "date_format": "1",
            "range_from": start_date.strftime('%Y-%m-%d'),
            "range_to": chunk_end.strftime('%Y-%m-%d'),
            "cont_flag": "1"
        }

        try:
            response = fyers.history(data=data)
            if response['s'] != 'ok':
                print(f"Error fetching data for {symbol}: {response}")
                start_date = chunk_end + timedelta(days=1)
                continue

            df = pd.DataFrame(response['candles'])
            if df.empty:
                print(f"No data returned for {symbol} from {start_date} to {chunk_end}.")
                start_date = chunk_end + timedelta(days=1)
                continue

            df.columns = ['date', 'open', 'high', 'low', 'close', 'volume']
            df['date'] = pd.to_datetime(df['date'], unit='s')
            df.date = (df.date.dt.tz_localize('UTC').dt.tz_convert('Asia/Kolkata'))
            df['date'] = df['date'].dt.tz_localize(None)
            df_sorted = df.sort_values(by=['date'], ascending=True)
            df = df_sorted.drop_duplicates(subset='date', keep='first')
            df.reset_index(drop=True, inplace=True)

            all_data.append(df)

            print(f"Data for {symbol} from {start_date} to {chunk_end} fetched successfully.")

        except Exception as e:
            print(f"Error processing {symbol}: {e}")

        start_date = chunk_end + timedelta(days=1)

    if all_data:
        final_df = pd.concat(all_data, ignore_index=True)
        parts = symbol.split(':')[-1].replace('-', '_').replace('&', '_')
        file_name = f"{parts.lower()}.csv"
        final_df.to_csv(file_name, index=False)
        print(f"Data for {symbol} saved to {file_name}.")

        # Save CSV data to MySQL
        con = mysql.connector.connect(**db_config)
        cur = con.cursor()

        table_name = parts.lower()

        # Create table if it doesn't exist
        create_table_query = f"""
            CREATE TABLE IF NOT EXISTS {table_name} (
                date DATETIME PRIMARY KEY,
                open FLOAT,
                high FLOAT,
                low FLOAT,
                close FLOAT,
                volume INT
            )
        """
        cur.execute(create_table_query)

        # Insert data into the table in batches
        batch_size = 1000
        for i in range(0, len(final_df), batch_size):
            batch_df = final_df.iloc[i:i + batch_size]
            values = [tuple(row) for row in batch_df.to_numpy()]

            insert_query = f"""
                INSERT INTO {table_name} (date, open, high, low, close, volume)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    open = VALUES(open),
                    high = VALUES(high),
                    low = VALUES(low),
                    close = VALUES(close),
                    volume = VALUES(volume)
            """
            try:
                cur.executemany(insert_query, values)
                con.commit()
                print(f"Batch of {len(values)} rows inserted successfully.")
            except Exception as e:
                print(f"Error inserting data into {table_name}: {e}")
                con.rollback()

        con.close()
        print(f"Data for {symbol} saved to MySQL table {table_name}.")

# Fetch and save data for each symbol in the list
for line in lines:
    fetch_and_save_data(line)
