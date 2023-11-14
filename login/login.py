from flask import Blueprint, session, redirect, url_for, flash, render_template,request
from login.login_form import LoginForm
from config import USER_NAME,PASSWORD

login_bp = Blueprint('login',__name__,template_folder='templates',static_folder='static',static_url_path='/login/static')

@login_bp.route('/',methods=['GET', 'POST'])
def login():
    form = LoginForm()
    session["logged_in"] = False
    if form.validate_on_submit():
        if form.email.data==USER_NAME and form.password.data == PASSWORD:
            session["logged_in"] = True
            return redirect(url_for('hadiths.home'))
        else:
            flash('لايمكنك الدخول, تحقق من الايميل وكلمة السر','danger')
            
    return render_template('login.html', title='Login', form=form)
    
