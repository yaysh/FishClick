from datetime import datetime

import pandas as pd
import psycopg2
import os, sys

from .nasdaq_symbol_file_processor_db import NasdaqSymbolFileProcessorDatabaseHandler

class NasdaqSymbolFileProcessor:

    def __init__(self, PATH, DB_HOST, DB_DB, DB_USERNAME, DB_PASSWORD, DB_PORT):
        self.basepath = PATH
        self.db_handler = NasdaqSymbolFileProcessorDatabaseHandler(DB_HOST, DB_DB, DB_USERNAME, DB_PASSWORD, DB_PORT)

    def handle_files(self):
        for f in os.listdir(self.basepath):
            if f.endswith(".txt"):
                full_path = os.path.join(self.basepath, f)
                self.insertSymbolsToDatabase(full_path)
                self.moveFileToHistory(full_path)


    def hasNasdaqInName(self, f):
        if "nasdaq" in f.lower():
            return True
        return False


    def hasOtherInName(self, f):
        if "other" in f.lower():
            return True
        return False


    def getSymbols(self, path):
        if "nasdaq" in path:
            df = pd.read_csv(path, delimiter="|", header=0)
            df = df[:-1]
            nqSymbols = df["Symbol"].to_list()
            return list(set(nqSymbols))
        if "other" in path:
            df = pd.read_csv(path, delimiter="|", header=0)
            df = df[:-1]
            otherSymbols = df["NASDAQ Symbol"].to_list()
            return list(set(otherSymbols))


    def insertSymbolsToDatabase(self, path):
        symbols = self.getSymbols(path)
        conn = self.db_handler.getConnection()
        sql = "INSERT INTO symbols (symbol, active, source) VALUES (%s, %s, %s) ON CONFLICT (symbol) DO UPDATE SET active = true;"
        if "nasdaqlisted.txt" in path:
            self.db_handler.setAllSymbolsFromSourceToNotActive("nasdaq")
            for symbol in symbols:
                cur = conn.cursor()
                data = (symbol, True, "nasdaq")
                cur.execute(sql, data)
                cur.close()
            conn.commit()
        if "otherlisted.txt" in path:
            self.db_handler.setAllSymbolsFromSourceToNotActive("other")
            for symbol in symbols:
                cur = conn.cursor()
                data = (symbol, True, "other")
                cur.execute(sql, data)
                cur.close()
            conn.commit()


    def moveFileToHistory(self, path):
        pathSplit = path.split('/')
        filename = pathSplit[len(pathSplit) - 1]
        path_in_history = self.basepath + "history/" + filename
        if os.path.exists(path_in_history):
            os.remove(path)
        else:
            os.rename(path, self.basepath + "history/" + filename)