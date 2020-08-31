# Matcha

Matcha is an online dating application that allow users to connect based on preferences.

## Requirements
* npm v6.13.4
* Node v12.16.1: https://nodejs.org/en/download/
* [MAMP](https://www.mamp.info/en/windows/) It comes with the latest PHP, Apache, phpMyAdmin, and MySQL

## Installation
### Get source code
* You can get the source code from https://github.com/Benybodipo/matcha-sql/
* Unzip the the file and you'll get a folder

### Install and set up server
* Download [MAMP](https://www.mamp.info/en/windows/) and install it by following the prompts
* Once Installed switch the server on
* Open your command line into the unzipped(matcha) folder and type **npm install** to install the packages and dependencies
* Set up your databse credentials in **app.js** lines 50 to 54, in **config/connection.js** lines 9 to 13 and **seed.js** lines 9 to 12
* To create the tatabase and tables as well as seed the users table type on the command line **node seed.js**


### How to run program
* Once completed the previus action type **npm start** to get the server running
* From the browser's navigation bar type 127.0.0.1:7500

### Technologies
* HTML
* CSS
* Javascript (Nodejs, JQuery)
* MySQL
