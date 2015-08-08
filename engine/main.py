#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import webapp2

import os
import json
import webapp2
from engine.search_events_interface import EventSearch
import jinja2
import urllib

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__).split('engine')[0]+"web\\"),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)


class Web(webapp2.RequestHandler):
    def get(self):
        city = ""
        category = ""
        time = ""
        res = EventSearch()
        test = res.get_events(city=None if city == "" else city, category=None if category == "" else category, date_and_time=None if time == "" else time)
        # self.response.write(test)
        # test = {
        #     'city': 'Jerusalem',
        #     'time': "12",
        #     'name': 'event!!'
        # }
        template_val = {
            'events': test,
        }
        template = JINJA_ENVIRONMENT.get_template('index.html')
        self.response.write(template.render(template_val))


class MainHandler(webapp2.RequestHandler):
    def get(self):
        self.response.write( os.path.dirname(__file__).split('engine')[0]+"web\\")
        self.redirect("/home", permanent=True)

app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/home', Web)
], debug=True)


