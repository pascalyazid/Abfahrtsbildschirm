from PyQt5.QtCore import *
from PyQt5.QtWidgets import *
from PyQt5.QtGui import *
from PyQt5.QtWebEngineWidgets import *
from PyQt5.QtPrintSupport import *
import os
import sys
import pyautogui

# main window
class MainWindow(QMainWindow):

    # constructor
    def __init__(self, *args, **kwargs):
        super(MainWindow, self).__init__(*args, **kwargs)
        # creating a tab widget
        self.tabs = QTabWidget()
        self.tabs.setTabBarAutoHide(True)
        # making document mode true
        self.tabs.setDocumentMode(True)

        # making tabs as central widget
        self.setCentralWidget(self.tabs)

        self.urlbar = QLineEdit()

        # creating first tab
        self.add_new_tab(QUrl('file:///C:/Users/Pascal/Desktop/IoT-Abfahrtsbildschirm/index.html'), 'Homepage')

        # showing all the components
        self.showMaximized()
        self.showFullScreen()
        self.show()

        # setting window title
        self.setWindowTitle("IOT-Abfahrtsbildschirm")

    # method for adding new tab
    def add_new_tab(self, qurl = QUrl('file:///C:/Users/Pascal/Desktop/IoT-Abfahrtsbildschirm/index.html'), label ="Blank"):

        # creating a QWebEngineView object
        browser = QWebEngineView()

        # setting url to browser
        browser.setUrl(qurl)

        # setting tab index
        i = self.tabs.addTab(browser, label)
        self.tabs.setCurrentIndex(i)


    # method for navigate to url
    def navigate_to_url(self):

        # get the line edit text
        # convert it to QUrl object
        q = QUrl(self.urlbar.text())

        # if scheme is blank
        if q.scheme() == "":
            # set scheme
            q.setScheme("http")

        # set the url
        self.tabs.currentWidget().setUrl(q)
# creating a PyQt5 application
app = QApplication(sys.argv)

# setting name to the application
app.setApplicationName("Geek PyQt5")

# creating MainWindow object
window = MainWindow()

# loop
app.exec_()
