__author__ = 'ItamarSharify'
import os
import webapp2
from engine.search_events_interface import EventSearch
import jinja2

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

class Web(webapp2.RequestHandler):
    def get(self ):
        city = ""
        category = ""
        time = ""
        res = EventSearch()
        test = res.get_events(city=None if city == "" else city, category=None if category == "" else category, date_and_time=None if time == "" else time)
        template_val ={
            'events': test,
        }
        template = JINJA_ENVIRONMENT.get_template('index.html')
        self.response.write(template.render(template_val))

app = webapp2.WSGIApplication([
('/home', Web)
], debug=True)