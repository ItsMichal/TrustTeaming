from flask import Flask
from flask_classful import FlaskView
from flask import render_template
from flask_socketio import emit
import sys
import json
from DataManager import DataManager
sys.path.append("..") #python bs
from views import LoginView
from auth import AuthCore
from flask_socketio import  Namespace
from abc import ABC

class BaseCore(ABC, FlaskView, Namespace):
    authCore = None
    dataMgr = None

    def __init__(self, authCore=None, namespace=""):
        super().__init__(namespace=namespace)
        self.dataMgr = DataManager()
        self.authCore = authCore
        
