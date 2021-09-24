import requests
import json
import pandas as pd
import csv
import os
import psycopg2
from datetime import datetime, timedelta

# https://api.nasdaq.com/api/quote/AAPL/historical?assetclass=stocks&fromdate=2011-04-19&limit=9999&todate=2021-04-19


class NasdaqDailyPriceDownloader:

    def __init__(self):
        pass

    def getUrl(self, symbol):
        return "https://api.nasdaq.com/api/quote/{}/historical?".format(symbol)

    def getConnection(self, db_host, db_db, db_username, db_password, db_port):
        return psycopg2.connect(
            host=db_host,
            database=db_db,
            user=db_username,
            password=db_password,
            port=db_port,
        )

    def getSymbols(self, db_host, db_db, db_username, db_password, db_port):
        conn = self.getConnection(
            db_host, db_db, db_username, db_password, db_port)
        sql = "SELECT symbol FROM Symbols WHERE source = %s"
        cur = conn.cursor()
        data = ('nasdaq', )
        allSymbols = []
        cur.execute(sql, data)
        allSymbols = [r[0] for r in cur.fetchall()]
        return allSymbols

    def download_daily_prices(self, basepath, db_host, db_db, db_username, db_password, db_port):
        symbols = self.getSymbols(
            db_host, db_db, db_username, db_password, db_port)
        for symbol in symbols:
            url = self.getUrl(symbol)
            local_filename = basepath + symbol + ".csv"
            if os.path.exists(local_filename):
                return False
            headers = {
                'authority': 'api.nasdaq.com',
                'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                'accept': 'application/json, text/plain, */*',
                'sec-ch-ua-mobile': '?0',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
                'origin': 'https://www.nasdaq.com',
                'sec-fetch-site': 'same-site',
                'sec-fetch-mode': 'cors',
                'sec-fetch-dest': 'empty',
                'referer': 'https://www.nasdaq.com/',
                'accept-language': 'sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7',
            }
            fromDateStr = (datetime.today() - timedelta(1)).strftime('%Y-%m-%d')
            toDateStr = datetime.today().strftime('%Y-%m-%d')
            params = (
                ('assetclass', 'stocks'),
                ('fromdate', fromDateStr),
                ('limit', '9999'),
                ('todate', toDateStr),
            )
            s = requests.Session()
            s.headers.update(headers)
            with s.get(url, stream=True, headers=headers, params=params) as r:
                decoded_content = r.content.decode('utf-8')
                json_loaded = json.loads(decoded_content)
                try:
                    with open(local_filename, 'wb') as f:
                        df_header = json_loaded["data"]["tradesTable"]["headers"]
                        df_keys = df_header.keys()
                        df_data = json_loaded["data"]["tradesTable"]["rows"]
                        final_rows = []
                        for row in df_data:
                            tmp_row = []
                            for key in df_header:
                                tmp_row.append(row[key])
                            final_rows.append(tmp_row)
                        with open(local_filename, "w") as csvfile:
                            csvwriter = csv.writer(csvfile)
                            csvwriter.writerow(df_keys)
                            csvwriter.writerows(final_rows)
                    return True
                except:
                    filename = "{}errors/{}_{}.txt".format(basepath, symbol, "error")
                    f = open(filename, "a")
                    f.write(decoded_content)
                    return False
