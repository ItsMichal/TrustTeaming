from flask import Flask
from flask_classful import FlaskView
from flask import render_template
from flask_socketio import emit
import sys
import json
from data.DataManager import DataManager
sys.path.append("..") #python bs
from views import LoginView
from auth import AuthCore
from flask_socketio import  Namespace
from abc import ABC

#Deprec
# class BaseCore(ABC, FlaskView, Namespace):
#     authCore = None
#     dataMgr = None

#     def __init__(self, options):
#         FlaskView.__init__(self)
        
#         if 'namespace' in options:
#             print(options.get('namespace', ''))

#             Namespace.__init__(self, namespace=options.get('namespace', ''))
#         self.dataMgr = DataManager()
#         self.authCore = options['authCore']
        
