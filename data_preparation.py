from flask import Flask, render_template, send_file, request, jsonify
import pandas as pd
from fyers_apiv3 import fyersModel
import os
import numpy as np
from sklearn.linear_model import LinearRegression
import math

app = Flask(__name__)

# Read access token and initialize Fyers
with open("abcd.txt", 'r') as r:
    access_token = r.read()

client_id = "DZO41L3M36-100"
fyers = fyersModel.FyersModel(client_id=client_id, is_async=False, token=access_token, log_path=os.getcwd())

# Fetch data from Fyers API
data = {
    "symbol": "NSE:NIFTYBANK-INDEX",
    "resolution": "1D",
    "date_format": "1",
    "range_from": "2024-01-01",
    "range_to": "2024-08-06",
    "cont_flag": "1"
}
response = fyers.history(data=data)
df = pd.DataFrame(response['candles'])
df.columns = ['date', 'open', 'high', 'low', 'close', 'volume']
df['date'] = pd.to_datetime(df['date'], unit='s')
df['date'] = df['date'].dt.tz_localize('UTC').dt.tz_convert('Asia/Kolkata').dt.tz_localize(None)

# Save to CSV
csv_path = os.path.join('static', 'niftybank_data.csv')
df.to_csv(csv_path, index=False)

@app.route('/')
def index():
    return render_template('index1.html')

@app.route('/data')
def data():
    return send_file(csv_path, mimetype='text/csv')

@app.route('/double-tops', methods=['GET'])
def get_double_tops():
    def calculate_slope_angle(x, y):
        model = LinearRegression().fit(x, y)
        slope = model.coef_[0]
        angle_deg = math.degrees(math.atan(slope))
        return slope, angle_deg

    def detect_double_tops(df):
        srcands = 12
        sup = df[df['low'] == df['low'].rolling(srcands, center=True).min()]['low']
        res = df[df['high'] == df['high'].rolling(srcands, center=True).max()]['high']
        price_diff = np.mean(df['high'] - df['low']) / 2
        pat = []
        max_bar_diff = 50
        min_bar_diff = 3
        i = 1
        j = 0
        flag = 1

        double_tops = []

        while i < sup.size and j < res.size:
            if flag == 0 and i < sup.size:
                if sup.index[i] > pat[0]:
                    pat.append(sup.index[i])
                    flag = 1
                i += 1
            else:
                if len(pat) == 0 or res.index[j] > pat[len(pat) - 1]:
                    pat.append(res.index[j])
                    flag = 0
                else:
                    pat.pop(0)
                    pat.insert(0, res.index[j])
                j += 1

            if len(pat) == 3 and pat[2] - pat[0] <= max_bar_diff and pat[2] - pat[1] >= min_bar_diff and pat[1] - pat[0] >= min_bar_diff and abs(res.iloc[j - 2] - res.iloc[j - 1]) <= price_diff:
                start_index = max(0, pat[0] - 20)
                end_index = pat[0]

                if df['low'].iloc[start_index:end_index].iloc[-1] > df['low'].iloc[start_index:end_index].iloc[0]:
                    y1 = df['low'].loc[pat[0]:pat[1]].values
                    x1 = np.arange(len(y1)).reshape(-1, 1)
                    slope1, angle1 = calculate_slope_angle(x1, y1)

                    y2 = df['high'].loc[pat[1]:pat[2]].values
                    x2 = np.arange(len(y2)).reshape(-1, 1)
                    slope2, angle2 = calculate_slope_angle(x2, y2)

                    if angle1 < -60 and angle2 > 60:
                        double_tops.append((pat[0], pat[2]))

            if len(pat) == 3:
                pat.pop(0)
                pat.pop(0)

        return double_tops

    df['date'] = pd.to_datetime(df['date'])
    double_tops = detect_double_tops(df)

    coordinates = []
    for dt in double_tops:
        coordinates.append({
            'x0': df['date'][dt[0]].strftime('%Y-%m-%d %H:%M:%S'),
            'y0': df['high'][dt[0]],
            'x1': df['date'][dt[1]].strftime('%Y-%m-%d %H:%M:%S'),
            'y1': df['high'][dt[1]]
        })

    return jsonify(coordinates)

if __name__ == '__main__':
    app.run(debug=True)
