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
        self.cursor = self.conn.cursor()

    def select(self, query):
        self.cursor.execute(query)
        self.conn.commit()
        return self.cursor.fetchall()

    def update(self, query, args):
        self.cursor.execute(query, args)
        self.conn.commit()


def adjust_wpm():
    sql = SQL()
    log_data = sql.select("SELECT * FROM log WHERE type='normal'")

    for row in log_data:
        log_id, content_id, date, wpm, typ, complete = row

        raw_row = sql.select(
            "SELECT * FROM content WHERE id="+str(content_id))
        if len(raw_row) == 0:
            continue
        text_row = raw_row[0]
        text = text_row[2]
        words = text.split(" ")
        word_len = len(words[-1])
        space_len = len(words) - 1
        letters = 0
        for word in words[:-1]:
            letters += len(word)
        time = letters / (float(wpm) / 60 * 5)
        new_wpm = ((letters + word_len + space_len) / time / 5) * 60
        sql.update("UPDATE log SET wpm=(?) WHERE id=(?)",
                   (int(round(new_wpm, 0)), log_id))


def remove_lead_space():
    sql = SQL()
    log_data = sql.select("SELECT * FROM content")
    for row in log_data:
        content_id, pn, text, depre = row
        if text[0] == " ":
            text = text[1:]
        sql.update("UPDATE content SET text=(?) WHERE id=(?)",
                   (text, content_id))


remove_lead_space()
adjust_wpm()
