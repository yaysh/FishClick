import os, sys, psycopg2
from psycopg2 import connect, extensions, sql

class NasdaqSymbolFileProcessorDatabaseHandler:

    def __init__(self, DB_HOST, DB_DB, DB_USERNAME, DB_PASSWORD, DB_PORT):
        self.DB_HOST = DB_HOST
        self.DB_DB = DB_DB
        self.DB_USERNAME = DB_USERNAME
        self.DB_PASSWORD = DB_PASSWORD
        self.DB_PORT = DB_PORT
        self.createDatabaseIfDoesntExist()
        self.createTableIfDoesntExist()

    def getConnection(self):
        return psycopg2.connect(
            host=self.DB_HOST,
            database=self.DB_DB,
            user=self.DB_USERNAME,
            password=self.DB_PASSWORD,
            port=self.DB_PORT
        )

    def createTableIfDoesntExist(self):
        sql = """
        CREATE TABLE IF NOT EXISTS symbols (
            symbol varchar(10) PRIMARY KEY,
            active boolean default false,
            source varchar(25)
        );
        """
        conn = self.getConnection()
        cur = conn.cursor()
        cur.execute(sql)
        cur.close()
        conn.commit()

    def createDatabaseIfDoesntExist(self):
        sql = """
        SELECT datname FROM pg_database WHERE datname = %s
        """
        conn = self.getConnection()
        data = (self.DB_DB.lower(),)
        cur = conn.cursor()
        cur.execute(sql, data)
        db_results = cur.fetchall()
        if len(db_results) == 0:
            if len(self.DB_DB) <= 0:
                sys.exit(1)
            conn = self.getConnection()
            autocommit = extensions.ISOLATION_LEVEL_AUTOCOMMIT
            conn.set_isolation_level( autocommit )
            data = (self.DB_DB,)
            cur = conn.cursor()
            cur.execute("CREATE DATABASE " + self.DB_DB)
        cur.close()
        conn.commit()


    def setAllSymbolsFromSourceToNotActive(self, source):
        conn = self.getConnection()
        sql = "UPDATE symbols set active = false WHERE source = %s;"
        data = (source,)
        cur = conn.cursor()
        cur.execute(sql, data)
        cur.close()
        conn.commit()