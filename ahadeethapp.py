from flask import Flask


app= Flask(__name__)
app.config.from_object('config')

from login.login import login_bp
from hadiths.hadiths import hadiths_bp
from narratordetails.narrator import narrator_bp

app.register_blueprint(login_bp, url_prefix='/')
app.register_blueprint(hadiths_bp, url_prefix='/')
app.register_blueprint(narrator_bp, url_prefix='/')

if __name__ == '__main__':
    app.run(host='0.0.0.0')