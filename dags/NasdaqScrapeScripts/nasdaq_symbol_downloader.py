from datetime import datetime
from ftplib import FTP
from pathlib import Path
import sys 

class NasdaqSymbolDownloader:

    def __init__(self, path):
        self.BASEPATH = path
        pass


    def download_history(self):
        current_date_str = str(datetime.today().strftime('%Y%m%d'))

        if not Path(self.BASEPATH).is_dir():
            Path(self.BASEPATH).mkdir(parents=True, exist_ok=True)

        ftp = FTP('ftp.nasdaqtrader.com', 'anonymous', 'anonymous@debian.org')
        ftp.cwd('/SymbolDirectory/')
        files = ["nasdaqlisted.txt", "otherlisted.txt"]
        for f in files:
            try:
                full_path = self.BASEPATH + current_date_str + "_" + f
                print("Full path", full_path)
                localfile = open(full_path, 'wb')
                ftp.retrbinary('RETR ' + f, localfile.write)
                localfile.close()
            # TODO: What type of exception am I expecting?
            except Exception as e:
                print(e)
                print('Couldn\'t download file: {}'.format(f))
                print("Unexpected error:", sys.exc_info()[0])
        ftp.quit()