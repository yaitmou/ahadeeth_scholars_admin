from flask import Blueprint, session, redirect, url_for, flash, render_template,request,jsonify
from login.login_form import LoginForm
from config import db
from bson import ObjectId, json_util
import json


narrator_bp = Blueprint('narratordetails',__name__, template_folder='templates', static_folder='static', static_url_path='/narratordetails/static')

@narrator_bp.route("/<id>")
def about(id):
    id_auth = str(id)
    base3 = db.HadithAuthors.aggregate([
        {'$lookup':{
            'from': "HadithBody",
            'localField':"hadiths",
            'foreignField':"_id",
            'as': "hadith"
        }},
        {"$unwind": {
            "path": "$hadith",
            "preserveNullAndEmptyArrays": True  
        }},
        {"$project":{"narrator_ar":1,"varriation":1,"bio":1,"hadith_id":"$hadith._id","hadith_arbody":"$hadith.body_ar"}}, 
        {'$match': {'_id': ObjectId(id_auth)}}
    ])

    stud_list = []
    teacher_list = []
    st = db.HadithAuthors.aggregate([
        {'$lookup':{
            'from': "HadithAuthors",
            'localField':"students",
            'foreignField':"_id",
            'as': "stud"
        }},
        {"$project":{"student_ar":"$stud.narrator_ar"}}, 
        {'$match': {'_id': ObjectId(id_auth)}}
    ])
    tr = db.HadithAuthors.aggregate([
        {'$lookup':{
            'from': "HadithAuthors",
            'localField':"teachers",
            'foreignField':"_id",
            'as': "teacher"
        }},
        {"$project":{"teacher_ar":"$teacher.narrator_ar"}}, 
        {'$match': {'_id': ObjectId(id_auth)}}
    ])
    for s in st:
        stud_list= s['student_ar']
    for t in tr:
        teacher_list=t['teacher_ar']

    return render_template("narrator.html", narrator=base3, teachers = teacher_list, students = stud_list)

#For saving name varriations for the specified narrator
@narrator_bp.route("/<id>", methods=["POST"])
def save_varr_ar(id):
    id_auth = str(id)
    base3 = db.HadithAuthors.aggregate([
        {'$lookup':{
            'from': "HadithBody",
            'localField':"hadiths",
            'foreignField':"_id",
            'as': "hadith"
        }},
        {"$unwind":"$hadith"},
        {"$project":{"narrator_ar":1,"varriation":1,"bio":1,"hadith_id":"$hadith._id","hadith_arbody":"$hadith.body_ar"}}, 
        {'$match': {'_id': ObjectId(id_auth)}}
    ])
        
    stud_list = []
    teacher_list = []
    st = db.HadithAuthors.aggregate([
        {'$lookup':{
            'from': "HadithAuthors",
            'localField':"students",
            'foreignField':"_id",
            'as': "stud"
        }},
        {"$project":{"student_ar":"$stud.narrator_ar"}}, 
        {'$match': {'_id': ObjectId(id_auth)}}
    ])
    tr = db.HadithAuthors.aggregate([
        {'$lookup':{
            'from': "HadithAuthors",
            'localField':"teachers",
            'foreignField':"_id",
            'as': "teacher"
        }},
        {"$project":{"teacher_ar":"$teacher.narrator_ar"}}, 
        {'$match': {'_id': ObjectId(id_auth)}}
    ])
    for s in st:
        stud_list= s['student_ar']
    for t in tr:
        teacher_list=t['teacher_ar']
    if request.method == "POST" :
        if "Submit_Name" in request.form:
            val = request.form.getlist('input_text[]')
            val = [x.strip() for x in val]
            varriation = {}
            varriation_out = {}
            varriation[id_auth] = val
            for k,v in varriation.items():
                varriation_out[k] = list(filter(None, v))
            for ids,varr in varriation_out.items():
                if varr:
                    auth_query = {"_id" : ObjectId(str(ids))}
                    auth_values = {"$addToSet":{ "varriation":{
                                        "$each": varr}}}
                    y = db.HadithAuthors.update_one(auth_query,auth_values)
                    
        base3 = db.HadithAuthors.aggregate([
            {'$lookup':{
                'from': "HadithBody",
                'localField':"hadiths",
                'foreignField':"_id",
                'as': "hadith"
            }},
            {"$unwind":"$hadith"},
            {"$project":{"narrator_ar":1,"varriation":1,"bio":1,"hadith_id":"$hadith._id","hadith_arbody":"$hadith.body_ar"}}, 
            {'$match': {'_id': ObjectId(id_auth)}}
        ])
    
    return render_template("narrator.html", narrator=base3,teachers = teacher_list, students = stud_list)

#delete name varriations from HadithAuthors
@narrator_bp.route("/delVarriation", methods=["POST"])
def delVarriation():
    auth_id = request.form.get('author')
    varr_del = request.form.get('varr_auth')
    auth_query = {"_id" : ObjectId(auth_id)}
    y = db.HadithAuthors.update_one(auth_query,
        {'$pull': { 'varriation': varr_del }})
    data = {'message': 'Done', 'code': 'SUCCESS','updated':y.modified_count}
    return json.dumps(data)
    