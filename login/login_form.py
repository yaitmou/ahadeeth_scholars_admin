from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Length, Email  ,EqualTo


class LoginForm(FlaskForm):
    email = StringField('أدخل الايميل',
                        validators=[DataRequired(),Email()]) 
    password = PasswordField('أدخل كلمة السر',validators=[DataRequired(),
                                                   EqualTo('password')])
    
    
    submit = SubmitField("دخول")
    