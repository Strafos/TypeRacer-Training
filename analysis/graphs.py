import os
import datetime
import re
import dateutil.parser
from pprint import pprint
from tabulate import tabulate
from collections import defaultdict
from itertools import combinations

import sqlite3
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.dates import date2num

from helpers import bucket_datetime

DATABASE_PATH = '/home/zaibo/code/type/db/typetext.db'


class SQL():
    """SQLite interface for database"""

    def __init__(self):
        self.conn = sqlite3.connect(DATABASE_PATH)
        # self.conn = sqlite3.connect('/home/zaibo/code/type/db/typetext.db')
        self.cursor = self.conn.cursor()

    def select(self, query):
        self.cursor.execute(query)
        self.conn.commit()
        return self.cursor.fetchall()


def graph_data(dates, wpms):

    ### BAR GRAPH ###
    bar = plt.plot(dates, wpms)
    # bar = plt.bar(dates, wpms, width=.5)
    ax = plt.subplot(111)
    ax.xaxis_date()


def process_data(data):
    # Do not weight WPM by text length
    # Graph WPM
    if len(data) < 1:
        raise Exception("No data to process")
    processed = []

    log_id, content_id, date, wpm, race_type, complete = data[0]

    curr_date = bucket_datetime(dateutil.parser.parse(date), "Day")
    row_counter = 1
    tot_wpm = int(wpm)
    counter = 1
    while counter < len(data):
        log_id, content_id, date, wpm, race_type, complete = data[counter]

        # Turn date into datetime object
        dt_date = bucket_datetime(dateutil.parser.parse(date), "Day")

        while dt_date == curr_date:
            tot_wpm += int(wpm)
            row_counter += 1
            counter += 1

            if counter == len(data):
                break

            log_id, content_id, date, wpm, race_type, complete = data[counter]
            dt_date = bucket_datetime(dateutil.parser.parse(date), "Day")

        processed.append((curr_date, tot_wpm/row_counter))
        tot_wpm = int(wpm)
        curr_date = dt_date
        row_counter = 1

    dates, wpms = zip(*sorted(processed))
    return dates, wpms


"""Currently this graphs unweighted wpm per day for normal"""

sql = SQL()
log_data = sql.select("SELECT * FROM log WHERE type='normal'")
dates, wpms = process_data(log_data)
graph_data(dates, wpms)

plt.show(block=True)
