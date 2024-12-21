from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
    print("Hello World")
    return 'Hello World'



if __name__ == '__main__':
    app.debug = True
    app.run()