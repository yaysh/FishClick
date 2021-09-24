from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from airflow.models import Variable

from datetime import datetime
from datetime import timedelta
import os

from NasdaqScrapeScripts.nasdaq_symbol_downloader import NasdaqSymbolDownloader
from NasdaqScrapeScripts.nasdaq_symbol_file_processor import NasdaqSymbolFileProcessor
from NasdaqScrapeScripts.nasdaq_daily_prices_download import NasdaqDailyPriceDownloader

# SYMBOL_PATH=os.environ.get('SYMBOL_PATH')
# DB_HOST=os.environ.get('DB_HOST')
# DB_DB=os.environ.get('DB_DB')
# DB_USERNAME=os.environ.get('DB_USERNAME')
# DB_PASSWORD=os.environ.get('DB_PASSWORD')
# DB_PORT=os.environ.get('DB_PORT')

SYMBOL_PATH = Variable.get("SYMBOL_PATH")
DB_HOST = Variable.get("DB_HOST")
DB_DB = Variable.get("DB_DB")
DB_USERNAME = Variable.get("DB_USERNAME")
DB_PASSWORD = Variable.get("DB_PASSWORD")
DB_PORT = Variable.get("DB_PORT")
HISTORICAL_PRICE_PATH = Variable.get("HISTORICAL_PRICE_PATH")

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': datetime(2021, 7, 19),
    'email_on_failure': False,
    'email_on_retry': False,
    'schedule_interval': '@daily',
    'retries': 1,
    'retry_delay': timedelta(seconds=5),
}

def download_nasdaq_symbols(basepath):
    nasdaq_symbol_downloader = NasdaqSymbolDownloader(basepath)
    nasdaq_symbol_downloader.download_history()

def import_nasdaq_symbols_file(basepath, db_host, db_db, db_username, db_password, db_port):
    nasdaq_symbol_file_processor = NasdaqSymbolFileProcessor(basepath, db_host, db_db, db_username, db_password, db_port)
    nasdaq_symbol_file_processor.handle_files()

def download_daily_prices(basepath, db_host, db_db, db_username, db_password, db_port):
    nasdaq_daily_price_downloader = NasdaqDailyPriceDownloader()
    nasdaq_daily_price_downloader.download_daily_prices(basepath, db_host, db_db, db_username, db_password, db_port)

with DAG('scrape_nasdaq_ftp', 
    start_date=datetime(2021, 7, 19), 
    schedule_interval="@daily", 
    catchup=False) as dag:

    nasdaq_symbols_download_files = PythonOperator(
        task_id='nasdaq_symbols_download_files', 
        python_callable=download_nasdaq_symbols, 
        op_kwargs={ 'basepath': SYMBOL_PATH}
    )

    nasdaq_symbols_import_files = PythonOperator(
        task_id='nasdaq_symbols_import_files', 
        python_callable=import_nasdaq_symbols_file, 
        op_kwargs={ 
            'basepath': SYMBOL_PATH,
            'db_host': DB_HOST,
            'db_db': DB_DB,
            'db_username': DB_USERNAME,
            'db_password': DB_PASSWORD,
            'db_port': DB_PORT,
        }
    )

    nasdaq_daily_prices_download = PythonOperator(
        task_id='nasdaq_symbols_import_files', 
        python_callable=download_daily_prices, 
        op_kwargs={ 
            'basepath': HISTORICAL_PRICE_PATH,
            'db_host': DB_HOST,
            'db_db': DB_DB,
            'db_username': DB_USERNAME,
            'db_password': DB_PASSWORD,
            'db_port': DB_PORT,
        }
    )
    # TODO: Add nasdaq daily prices processor
    # TODO: daily prices download should only download prices and save to a csv
    nasdaq_symbols_download_files >> nasdaq_symbols_import_files >> nasdaq_daily_prices_download #>> nasdaq_daily_prices_process