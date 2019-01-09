import os
import datetime
import re
from pprint import pprint
from tabulate import tabulate
from collections import defaultdict
from itertools import combinations

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.dates import date2num

import sqlite3


def _graph_stat(data, stat="Messages", period="Month", name="total", message_data=None):
    """
    The real graph stat function
    Graph parameterized stat from get_all_stats
    """

    # Parse data and sort by dates
    if not message_data:
        message_data = data[stat][period][name]
    dates = date2num(list(message_data.keys()))
    counts = np.array(list(message_data.values()))
    dates, counts = zip(*sorted(zip(dates, counts)))

    ### BAR GRAPH ###
    bar = plt.bar(dates, counts, )
    # bar = plt.bar(dates, counts, width=width_dict[period])
    ax = plt.subplot(111)
    ax.xaxis_date()


class SQL():
    def __init__(self):
        self.conn = sqlite3.connect('/home/zaibo/sample.db')
        # self.conn = sqlite3.connect('/home/zaibo/code/type/db/typetext.db')
        self.cursor = self.conn.cursor()

    def select(self, query):
        self.cursor.execute(query)
        self.conn.commit()
        return self.cursor.fetchall()


sql = SQL()
log_data = sql.select("SELECT * FROM LOG")
print(len(log_data))
