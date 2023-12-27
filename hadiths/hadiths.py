from flask import Blueprint, session, render_template,request,jsonify, redirect, url_for
from login.login_form import LoginForm
import models
import json

hadiths_bp = Blueprint('hadiths',__name__, template_folder='templates', static_folder='static', static_url_path='/hadiths/static')

@hadiths_bp.route("/getnarrator", methods=["POST"])
def getnarrator():
    
    narr_list = models.getAuthorsName(id = "")
    return json.dumps(narr_list)       

# get the book details based on collection
@hadiths_bp.route("/getbook", methods=["POST"])
def getbook():
    collection_id = request.form.get('data_collection')
    
    json_book=models.getHadithBooks(collection_id)
    
    return json.dumps(json_book)

@hadiths_bp.route("/getchapter", methods=["POST"])
def getchapter():
    data = request.json
    book_chap, hadith = models.getHadithChapters(data['data_book'],None)
        
    return jsonify(chap=book_chap,hadith=hadith)

@hadiths_bp.route("/getbookchapters", methods=["POST"])
def getbookchapters():
    data = request.json
    book_chap = models.getChapters(data['data_book'])
        
    return jsonify(chap=book_chap)

@hadiths_bp.route("/updatehadith", methods=["POST"])
def gethadith():
    chapterid = request.form.get('data_chapter')
    
    hadith = models.getHadiths(chapterid,"") 
    
    return jsonify(data1 = hadith)

@hadiths_bp.route("/getprevhadithNumber", methods=["POST"])
def getprevhadithNumber():
    data = request.json
    prevhadithno = models.get_HadithNumber(data) 
    return jsonify({'status': "Success",'prevhadithno':str(prevhadithno)})

@hadiths_bp.route("/getSanad", methods=["POST"])
def getSanad():
    hadithid = request.form.get('hadithid')
    
    narrator_lst = models.getHadithSanad(hadithid)
    return jsonify(narrator_lst)

@hadiths_bp.route("/getComments", methods=["POST"])
def getComments():
    hadithid = request.form.get('hadithid')
    
    hadith = models.getHadithComments(hadithid)
    
    return jsonify(hadith)

@hadiths_bp.route("/getmoallaka", methods=["POST"])
def getmoallaka():
    hadithid = request.form.get('hadithid')
    
    narrator_lst = models.getHadithMoallaka(hadithid)
    
    return jsonify(data1 = narrator_lst)

@hadiths_bp.route("/getnarratorinfo", methods=["POST"])
def getnarratorinfo():
    narratorid = request.form.get('narratorid')
    
    li =models.getAuthorsInfo(narratorid)
    
    return json.dumps(li) 


@hadiths_bp.route("/ahadiths",methods=['GET','POST'])
def home():
    if not session.get('logged_in'):
        form = LoginForm()
        return redirect(url_for('login.login'))
    else: 
        s_coll_id = session.get('coll_id')
        s_book_id = session.get('book_id')
        s_chapter_id = session.get('chapter_id')
        collection, book, chapter, hadith = models.get_loaddata(s_coll_id,s_book_id,s_chapter_id)
        
        
    return render_template("hadiths.html",coll=collection,book=book,chapter=chapter,hadith=hadith,
                           data=None, coll_id = s_coll_id, book_id=s_book_id, chapter_id=s_chapter_id )


@hadiths_bp.route("/gethadithinfo",methods=["POST"])
def gethadithinfo():
    data = request.json
    if(data['book']):
        book = data['book']
    else:
        book = None
    if(data['chapter']):
        chapter = data['chapter']
    else:
        chapter = None 
    collection, book, chapter, hadith = models.get_loaddata(data['collection'],book,chapter)
    
    return jsonify(collection=collection,book=book,chap=chapter,hadith=hadith)    
        
@hadiths_bp.route("/getcollection",methods=["POST"])
def getcollection():
    collection = models.getHadithCollections(None)
    
    return jsonify(collection=collection)  

@hadiths_bp.route("/getbooks",methods=["POST"])
def getbooks():
    data = request.json
    book = models.getHadithBooks(data['collection'])
    
    return jsonify(book=book)
      

@hadiths_bp.route('/submit', methods=["POST"])
def submit():
   
    data = request.json
    mlist = data['moallakaList']
    slist = data['sanadList']
    klist = data['keywords']
    #update Comments on Sanad and Matn
    x = models.insert_Comments(data)
    
    #if len(klist)!=0:
    x = models.insert_Keywords(data['hadith_id'],klist)

    #Moallaka chain update
    if len(mlist)!=0:
        x = models.insert_Moallakka(data['hadith_id'],mlist)
        
        
    #Sanad chain update
    
    if(len(slist)!=0):
        x = models.insert_Sanad(data['hadith_id'],slist)
        
    session['last_modified'] = data['hadith_id']
    session['coll_id'] = data['coll_id']
    session['book_id'] = data['book_id']
    session['chapter_id'] = data['chapter_id']
    return jsonify({'status': "Success"})

@hadiths_bp.route("/insertchapter", methods=["POST"])
def insertchapter():
    data = request.json
    x = models.insert_Chapter(data)
    return jsonify(str(x))
    
@hadiths_bp.route("/deletechapter", methods=["POST"])
def deletechapter():
    data = request.json
    x = models.delete_Chapter(data)
    return jsonify({'status': "Success"})

@hadiths_bp.route("/updatechapter", methods=["POST"])
def updatechapter():
    data = request.json
    x = models.update_Chapter(data)
    return jsonify({'status': "Success"})

@hadiths_bp.route("/updatechapno", methods=["POST"])
def updatechapno():
    data = request.json
    models.update_ChapNo(data)
    return jsonify({'status': "Success"})

@hadiths_bp.route("/updatehadno", methods=["POST"])
def updatehadno():
    data = request.json
    models.update_HadNo(data)
    return jsonify({'status': "Success"})

@hadiths_bp.route("/updatehadithchapter", methods=["POST"])
def updatehadithchapter():
    data = request.json
    x = models.update_HadithChapter(data)
    return jsonify({'status': "Success"})

@hadiths_bp.route("/inserthadith", methods=["POST"])
def inserthadith():
    data = request.json
    x = models.insert_Hadith(data)
    return jsonify(str(x))

@hadiths_bp.route("/updatenarrname", methods=["POST"])
def updatenarrname():
    data = request.json
    x = models.updateHadithAuthor_name(data)
    return jsonify({'status': "Success"})

@hadiths_bp.route("/insertcollection", methods=["POST"])
def insertcollection():
    data = request.json
    x = models.insert_Collection(data)
    return jsonify(str(x))

@hadiths_bp.route("/updatecollection", methods=["POST"])
def updatecollection():
    data = request.json
    x = models.update_Collection(data)
    return jsonify({'status': "Success"})

@hadiths_bp.route("/updatecollno", methods=["POST"])
def updatecollno():
    data = request.json
    models.update_CollNo(data)
    return jsonify({'status': "Success"})

@hadiths_bp.route("/deletecollection", methods=["POST"])
def deletecollection():
    data = request.json
    x = models.delete_Collection(data)
    return jsonify({'status': "Success"})

@hadiths_bp.route("/insertbook", methods=["POST"])
def insertbook():
    data = request.json
    x,flag = models.insert_Book(data)
    return jsonify(str(x),str(flag))

@hadiths_bp.route("/updatebook", methods=["POST"])
def updatebook():
    data = request.json
    x = models.update_Book(data)
    return jsonify({'status': "Success"})

@hadiths_bp.route("/updatebookno", methods=["POST"])
def updatebookno():
    data = request.json
    models.update_BookNo(data)
    return jsonify({'status': "Success"})

@hadiths_bp.route("/deletebook", methods=["POST"])
def deletebook():
    data = request.json
    x = models.delete_Book(data)
    return jsonify({'status': "Success",'x':str(x)})

@hadiths_bp.route("/deletehadith", methods=["POST"])
def deletehadith():
    data = request.json
    x,cnt = models.delete_Hadith(data)
    return jsonify(str(cnt))

@hadiths_bp.before_request
def setup():
    session.permanent = True
