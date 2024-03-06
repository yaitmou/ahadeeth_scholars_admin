from config import db
from bson import ObjectId, json_util
from pymongo import UpdateOne

def getAuthorsName(id):
    
    if(id !=""):
        query = {'_id':ObjectId(id)}
    else:
        query = {}
    narrators = list(db.HadithAuthors.find(query,
                                   {"narrator_ar":1}))
    narr_list = []
    for n in narrators:
        n['_id'] = str(n['_id'])
    return narrators

def getHadithCollections(id):
    if(id !=None):
        query = {"_id":ObjectId(id)}
    else:
        query = {}
    
    collection = list(db.HadithCollection.find(query).sort('collectionno',1))
    
    for i,c in enumerate(collection):
        c['_id'] = str(c['_id'])
        if("flag" in c):
            c['flag'] = c['flag']
        else:
            c['flag'] = 1
        if("collectionno" in c):
            c['collectionno'] = c['collectionno']
        else:
            c['collectionno'] = i + 1
        
    return collection 

def getHadithBooks(id):
    if(id !=None):
        query = {"collection":ObjectId(id)}
    else:
        query = {}
    book = list(db.HadithBook.find(query,
                                   {"_id":1,"booktitle_ar":1,"flag":1,"save_flag":1,"booknumber":1}).sort('booknumber',1))
    for b in book:
        b['_id'] = str(b['_id']) 
        b['booktitle_ar'] = str(b['booktitle_ar'])
        b['booknumber'] = str(b['booknumber'])
        if("flag" in b):
            b['flag'] = b['flag']
        else:
            b['flag'] = 1
        
    return book 

def getChapters(id):
    if(id !=""):
        query = {"book":ObjectId(id)}
    else:
        query = {}
    book_chap = list(db.HadithChapter.find(query,
                                   {"_id":1,"arChapter":1,"flag":1,"save_flag":1,"chapterno":1}).sort('chapterno',1))
    for b in book_chap:
        b['_id'] = str(b['_id'])
        b['arChapter'] = str(b['arChapter'][0]).split(')')[1] if len(str(b['arChapter'][0]).split(')')) > 1 else str(b['arChapter'][0]).split(')')[0]
        if("flag" in b):
            b['flag'] = b['flag']
        else:
            b['flag'] = 1
    return book_chap

def getHadithChapters(id,ch_id):
    bkid = id
    if(id !=""):
        query = {"book":ObjectId(id)}
    else:
        query = {}
    book_chap = list(db.HadithChapter.find(query,
                                   {"_id":1,"arChapter":1,"flag":1,"save_flag":1,"chapterno":1}).sort('chapterno',1))
    chap_count = ""
    hadiths = []
    
    for b in book_chap:
        b['_id'] = str(b['_id'])
        b['arChapter'] = str(b['arChapter'][0]).split(')')[1] if len(str(b['arChapter'][0]).split(')')) > 1 else str(b['arChapter'][0]).split(')')[0]
        if("flag" in b):
            b['flag'] = b['flag']
        else:
            b['flag'] = 1
        
        if(chap_count == "" and ch_id == None and b['flag'] == 1):
            chap_count = b['_id']
            hadiths = getHadiths(chap_count,id) 
        elif(b['_id']==ch_id):
            chap_count = b['_id']
            hadiths = getHadiths(chap_count,bkid)  
        elif(chap_count == "" and ch_id == None and b['flag'] == 0):
            hadiths = getHadiths(chap_count,id)
        
    return book_chap,hadiths  

def getHadiths(id,bookid):
    if(id !=""):
        query = {'$or':[{"chapter":ObjectId(id)},{'$and':[{"chapter":None},{"book":bookid}]}]}
    else:
        query = {"book":ObjectId(bookid)}
    hadith = list(db.HadithBody.find(query,
                                {"_id","body_ar","hadithno","save_flag"}).sort('hadithno',1))
    for h in hadith:
        h['_id'] = str(h['_id'])
        if("hadithno" in h):
            h['hadithno'] = h['hadithno']
        else:
            h['hadithno'] = ""
        if("save_flag" not in h):
            h['save_flag'] = False
    return hadith

def getHadithComments(hadithid):
    query = {"_id":ObjectId(hadithid)}
    hadith = list(db.HadithBody.find(query,
                                {"body_ar","chainComment","hadithComment","keywords"}))
    for h in hadith:
        h['_id'] = str(h['_id'])
    return(hadith)


def getHadithSanad(hadithid):
    query = {"_id": ObjectId(hadithid)}

    pipeline = [
        {"$match": query},
        {"$unwind": "$chain"},
        {"$lookup": {
            "from": "HadithAuthors",
            "localField": "chain",
            "foreignField": "_id",
            "as": "narrator"
        }},
        {"$unwind": "$narrator"},
        {"$project": {
            "narrator_id": "$narrator._id",
            "narrator_ar": "$narrator.narrator_ar",
            "_id": 0
        }}
    ]
    narrator_lst = []
    narrator = list(db.HadithBody.aggregate(pipeline))
    for n in narrator:
        narrator_lst.append([str(n["narrator_id"]),n["narrator_ar"]]) 
    return narrator_lst

def getHadithMoallaka(hadithid):
    query = {"_id":ObjectId(hadithid)}
    hadith = list(db.HadithBody.find(query,
                                {"moallaka"}))
    narrator_lst = []
    for h in hadith:
        if(len(h)>1):
            sample = h['moallaka']
            for i in range(len(sample)):
                li = []
                for j in sample[i]:
                    narrator = getAuthorsName(j)
                    for n in narrator:
                        li.append([n["_id"],n["narrator_ar"]]) 
                narrator_lst.append(li)
        
    return narrator_lst


def getAuthorsInfo(narratorid):
    query = {"_id":ObjectId(narratorid)}
    narrator = list(db.HadithAuthors.find(query,
                                {"narrator_ar":1,
                "bio":1,"nstudents":{"$size":"$students"},"nteachers":{"$size":"$teachers"}
                        }))
    hadithno = list(db.HadithBody.find({'chain':{'$in':[ObjectId(narratorid)]}},{'_id'}))
    li =[]
    index = len(hadithno)
    li.append(index)
    for narr in narrator:
        narr['_id'] = str(narr["_id"])
        narr['nstudents'] = json_util.dumps(narr.get('nstudents'))
        narr['nteachers'] = json_util.dumps(narr.get('nteachers'))
        narr['bio'] = str(narr.get('bio'))
        narr['narrator_ar'] = str(narr.get('narrator_ar'))
    li.append(narr)
    return li

def get_loaddata(c_id,b_id,ch_id):
    collection = getHadithCollections(None)
    coll_lst = []
    b_lst = []
    ch_lst = []
    hadith = []
    first_coll_count = 0
    for c in collection:
        id = c['_id']
        coll = c['collection']
        coll_lst.append([c['_id'],c['collection'],c['flag'],c['save_flag'],c['collectionno']])
        
        if(first_coll_count==0):
            if (c_id != None):
                id = c_id
            book = getHadithBooks(id)
            book_lst = []
            first_book_count = 0
            for b in book:
                book_id = b["_id"]
                chap_lst = []
                if(first_book_count == 0 and b['flag']==1):
                    if(b_id!=None):
                        book_id = b_id
                    chapter,hadiths = getHadithChapters(book_id,ch_id)
                    for ch in chapter:
                        chap_lst.append([ch['_id'],ch['arChapter'],ch['flag'],ch['save_flag'],ch['chapterno']])
                    if(first_book_count == 0):
                        hadith = hadiths
                    first_book_count+=1
                    ch_lst = chap_lst
                
                book_lst.append([b["_id"],b["booktitle_ar"],b['flag'],b['save_flag'],b['booknumber']])
            first_coll_count += 1
            b_lst = book_lst
            
    return coll_lst,b_lst,ch_lst, hadith

def get_hadiths_ch():
    #query = {"_id":ObjectId(hadithid)}
    had = []
    hadiths = list(db.HadithBody.aggregate([
                    {'$lookup':{
                        'from': "HadithChapter",
                        'localField':"chapter",
                        'foreignField':"_id",
                        'as': "Chapter"
                    }},
                    {'$lookup':{'from': "HadithBook",'localField':"Chapter.book",'foreignField':"_id",'as': "Book"}},
                    {'$lookup':{'from': "HadithCollection",'localField':"Book.collection",'foreignField':"_id",'as': "Collection"}},
                    {'$unwind':'$Chapter'},{'$unwind':'$Book'},{'$unwind':'$Collection'},
                    {'$project':{"_id":1,"save_flag":1,"chapterId":"$Chapter._id","bookId":"$Book._id","collectionId":"$Collection._id"
                    }},
                    #{'$match': query}
                ]))
    false_coll_ids = set()
    false_book_ids = set()
    false_chap_ids = set()
    for h in hadiths:
        had.append(h)
        if h.get("save_flag") is False or h.get("save_flag") is None:
            false_coll_ids.add(h.get("collectionId"))
            false_book_ids.add(h.get("bookId"))
            false_chap_ids.add(h.get("chapterId"))
    return list(false_coll_ids),list(false_book_ids),list(false_chap_ids),had

def insert_Comments(data):
    myquery = { "_id" : ObjectId(data['hadith_id']) }
    newvalues = {"$set" :{"hadithComment": data['hadeethCmnt'],
                            "chainComment": data['chainComment'],
                            "save_flag":data['save_flag'],
                            "body_ar":data['matn']}}
    x = db.HadithBody.update_one(myquery, newvalues)
    chapter_id = ObjectId(data['chapter_id'])
    book_id = ObjectId(data['book_id'])
    coll_id = ObjectId(data['coll_id'])
    saveflag_ch = list(db.HadithBody.find({'chapter':chapter_id},{'save_flag':1}))
    cnt = 0
    for c in saveflag_ch:
        if('save_flag' in c and c['save_flag']):
            cnt = cnt + 1
    
    if(cnt!=0 and cnt == len(saveflag_ch)):
        db.HadithChapter.update_one({'_id':chapter_id},{'$set':{'save_flag':True}})
        
    else:
        db.HadithChapter.update_one({'_id':chapter_id},{'$set':{'save_flag':False}})
        
    saveflag_bk = list(db.HadithChapter.find({'book':book_id},{'save_flag':1}))
    bcnt = 0
    for b in saveflag_bk:
        if('save_flag' in b and b['save_flag']):
            bcnt = bcnt + 1
    if(bcnt!=0 and bcnt == len(saveflag_bk)):
        db.HadithBook.update_one({'_id':book_id},{'$set':{'save_flag':True}})
    else:
        db.HadithBook.update_one({'_id':book_id},{'$set':{'save_flag':False}})
    saveflag_col = list(db.HadithBook.find({'collection':coll_id},{'save_flag':1}))
    ccnt = 0
    for cl in saveflag_col:
        if(cl['save_flag']):
            ccnt = ccnt + 1
    if(ccnt!=0 and ccnt == len(saveflag_col)):
        db.HadithCollection.update_one({'_id':coll_id},{'$set':{'save_flag':True}})
    else:
        db.HadithCollection.update_one({'_id':coll_id},{'$set':{'save_flag':False}}) 
    return(x.modified_count)

def insert_Moallakka(id,mlist):
    myquery = { "_id" : ObjectId(id) }
    m_id = []
    for i in range(0,len(mlist)):
        val = [x for x in mlist['subList'+str(i+1)][0]]
        li=[]
        for v in val:
            if(ObjectId.is_valid(v) and v!="0"):
                li.append(ObjectId(v))
        if(len(li)!=0):
            m_id.append(li)
    x = db.HadithBody.update_one(myquery,{"$unset":{"moallaka":""}})
    if len(m_id)!=0 :
        x = db.HadithBody.update_one(myquery,
            { "$addToSet": { "moallaka": { "$each": m_id } } })

    return(x.modified_count)

def insert_Keywords(id,klist):
    myquery = { "_id" : ObjectId(id) }
    x = db.HadithBody.update_one(myquery,{"$unset":{"keywords":""}})
    if len(klist)!=0 :
        x = db.HadithBody.update_one(myquery,
            { "$push": { "keywords": { "$each": klist } } }) 

    return(x.modified_count)

def insert_Sanad(id,slist):
    myquery = { "_id" : ObjectId(id) }
    st = 0
    sanad_li = []
    del_li = []
    inserted_flag = 0
    chain = list(db.HadithBody.find(myquery,{'chain':1,}))
    for s in range(0,len(slist)):
        if(ObjectId.is_valid(slist[s])):
            sanad_li.append(ObjectId(slist[s]))
        else:
            if s==0:
                hadiths = ObjectId(id)
            x = db.HadithAuthors.insert_one({'narrator_ar':slist[s],'teachers':[],'students':[], 'hadiths':hadiths})
            inserted_flag = 1
            sanad_li.append(x.inserted_id)
    sanad_li = list(reversed(sanad_li))
    for ch in chain:
        for c in ch['chain']:
            if not any(ObjectId(c) == subch for subch in sanad_li):
                del_li.append(ObjectId(c))
    if(del_li):
        del_AuthorDetails(del_li,id)
    update_newAuthorDetails(sanad_li,id)
    db.HadithBody.update_one(myquery,{"$unset":{"chain":""}})
    if(len(sanad_li)!=0):
        x = db.HadithBody.update_one(myquery,
            { "$push": { "chain": { "$each": sanad_li } } }) 
        st = x.modified_count 
    return(st)
def del_AuthorDetails(del_li,id):
    for dlist in del_li:
        chain = list(db.HadithBody.find({'chain': {'$elemMatch': {'$in': [dlist]}}},{'_id':1,'chain':1}))
        student = []
        teacher = []
        curr_student = []
        curr_teacher = []
        stud_del = []
        teacher_del = []
        for ch in chain:
            ind = ch['chain'].index(dlist)
            if(ch['_id']==ObjectId(id)):
                curr_student = set(ch['chain'][:ind])
                curr_teacher = set(ch['chain'][ind+1:])
            else:
                if(len(ch['chain'][:ind])>0):
                    student.append(ch['chain'][:ind])
                if(len(ch['chain'][ind+1:])>0):
                    teacher.append(ch['chain'][ind+1:])
        for stud in curr_student:
            if not any(stud in sub_student for sub_student in student):
                stud_del.append(stud)
        for teach in curr_teacher:
            if not any(teach in sub_teacher for sub_teacher in teacher):
                teacher_del.append(teach)
        if(len(stud_del)>0):
            db.HadithAuthors.update_one(
                {'_id': dlist},
                {'$pull': {'students': {'$in': stud_del}}}#,'hadiths':{'$in':[ObjectId(id)]}
                )
        if(len(teacher_del)>0):
            db.HadithAuthors.update_one(
                {'_id': dlist},
                {'$pull': {'teachers': {'$in': teacher_del}}}#,'hadiths':{'$in':[ObjectId(id)]}
                )
    return
def update_newAuthorDetails(sanadList,id):
    for i in sanadList:
        del_AuthorDetails([i],id)
        stud_list = sanadList[:sanadList.index(i)]
        teach_list = sanadList[sanadList.index(i) + 1:]
        x = db.HadithAuthors.update_one({'_id':i},{'$addToSet':{'teachers':{'$each':teach_list},'students':{'$each':stud_list}}})#,'hadiths':{'$each':[ObjectId(id)]}
        
    return
def insert_Chapter(data):
    try:
        x = db.HadithChapter.insert_one({
            'chapterno' : data['chapterno'],
            'chaptitle' :[],
            'arChapter' : [data['arChapter']],
            'book':ObjectId(data['book']),
            'flag':0,
            'save_flag':False
        })
        st = x.inserted_id
        #Update HadithChapter with increment chapternumber according to the newly inserted chapter
        query = {"$and": [{'book': ObjectId(data['book'])},{'chapterno': {'$gte': data['chapterno']}}, {'_id': {'$ne': st}}]}
        dbChap = list(db.HadithChapter.find(query).sort('chapterno'))
        chno = data['chapterno'] + 1
        bulk_updates = [UpdateOne({'_id':ObjectId(doc['_id'])},{'$set':{'chapterno': chno + i}}) for i,doc in enumerate(dbChap)]
        if bulk_updates:
           db.HadithChapter.bulk_write(bulk_updates) 
        db.HadithBook.find_one_and_update(
            { "_id" : ObjectId(data['book']) },
            { "$set": { "flag" :1}})
    except Exception as e:
        print(f"An error occurred : {e}")
    return(st)


def delete_Chapter(data):
    try:
        st = db.HadithChapter.delete_one({"_id" : ObjectId(data["chapter"])})
        if st.deleted_count == 1:
            db.HadithChapter.update_many(
                {'$and':[{'chapterno': {'$gte': data['chapterno']}},{'book':ObjectId(data['book'])}]},
                {'$inc': {'chapterno': -1}}
            )
            book_count = list(db.HadithChapter.find({ "book": ObjectId(data['book']) }))
            newvalues = 0 if len(book_count) < 1 else 1
            query_col = { "_id": ObjectId(data['book']) }
            st_col = db.HadithBook.update_one(query_col,{'$set': {'flag': newvalues}})
    except Exception as e:
        print(f"An error occurred : {e}")
    return(len(book_count))

def update_Chapter(data):
    try:
        query = { "_id": ObjectId(data["id"]) }
        newvalues = { "$set": { "arChapter": [data['arChapter']] } }
        st = db.HadithChapter.update_one(query,newvalues)
        db.HadithChapter.find_one_and_update(
            { "$and":[query,{"chapterno":-1}] },
            { "$set": { "chapterno" :1}})
    except Exception as e:
        print(f"An error occurred : {e}")
    return(st)

def update_ChapNo(data):
    try:
        inc = 0
        query = ""
        if(data['oldchapno']>data['chapterno']):
            query ={'$and':[{'book':ObjectId(data['book'])},{'chapterno':{'$gte':data['chapterno']}},{'chapterno':{'$lte':data['oldchapno']}}]} 
            inc = 1
        elif(data['oldchapno']<data['chapterno']):
            query ={'$and':[{'book':ObjectId(data['book'])},{'chapterno':{'$gte':data['oldchapno']}},{'chapterno':{'$lte':data['chapterno']}}]}
            inc = -1
        if(query):
            
            cur = list(db.HadithChapter.find(query,{'chapterno':1}).sort('chapterno',1))
            hadno = list(db.HadithBody.find({'chapter':cur[0]['_id']},{"hadithno":1}).sort('hadithno',1))
            hadno = hadno[0]['hadithno'] if(hadno) else 1
            for doc in cur:
                if(doc['chapterno']==data['oldchapno']):
                    values = {'$set':{'chapterno':data['chapterno']}}
                else:
                    values = {'$set':{'chapterno':doc['chapterno'] + inc}}
                db.HadithChapter.update_one({'_id': doc['_id']},values)
            
            cursor = list(db.HadithChapter.find(query,{'chapterno':1}).sort('chapterno',1))
            for doc in cursor:
                hadcur = list(db.HadithBody.find({'chapter':doc['_id']},{'hadithno':1}).sort('hadithno',1))
                for haddoc in hadcur:
                    db.HadithBody.update_one({'_id': haddoc['_id']},{"$set":{'hadithno':hadno}})
                    hadno = hadno + 1
    except Exception as e:
        print(f"An error occurred: {e}")
    return

def update_HadNo(data):
    try:
        inc = 0
        query = ""
        if(data['oldhadithno']>data['hadithno']):
            query ={'$and':[{'collection':ObjectId(data['collection'])},{'hadithno':{'$gte':data['hadithno']}},{'hadithno':{'$lte':data['oldhadithno']}}]} 
            inc = 1
        elif(data['oldhadithno']<data['hadithno']):
            query ={'$and':[{'collection':ObjectId(data['collection'])},{'hadithno':{'$gte':data['oldhadithno']}},{'hadithno':{'$lte':data['hadithno']}}]}
            inc = -1
        if(query):
            cur = db.HadithBody.find(query,{'hadithno':1})
            for doc in cur:
                if(doc['hadithno']==data['oldhadithno']):
                    values = {'$set':{'hadithno':data['hadithno']}}
                else:
                    values = {'$set':{'hadithno':doc['hadithno'] + inc}}
                db.HadithBody.update_one({'_id': doc['_id']},values)
        
    except Exception as e:
        print(f"An error occurred: {e}")
    return

def update_HadithChapter1(data):
    query = { "_id": ObjectId(data["hadithid"]) }
    newvalues = { "$set": { "chapter": ObjectId(data['chapter']), "flag": 1 } }
    newhadno = 0
    oldhadno = db.HadithBody.find_one({"_id": ObjectId(data["hadithid"])}, {"hadithno": 1})["hadithno"]
    hadno = db.HadithBody.find_one({"chapter": ObjectId(data['chapter'])}, {"hadithno": 1}, sort=[('hadithno', -1)])
    if(hadno):
        newhadno = hadno["hadithno"]
        newhadno = newhadno if(oldhadno<newhadno) else newhadno + 1
    else:
        book1 = db.HadithChapter.find_one({'_id': ObjectId(data['chapter'])},{'chapterno':1,'book':1})
        bkno = db.HadithBook.find_one({'_id':book1['book']},{'booknumber':1})['booknumber']
        all_books = db.HadithBook.find({'$and':[{'collection':ObjectId(data['collection'])},{'booknumber':{'$lte':bkno}},{'flag':1}]},
                                        {'booknumber':1}, sort=[('booknumber',-1)])
        for book in  all_books:
            if(book['_id'] == book1['book']):
                chap = db.HadithChapter.find_one({'$and':[{'book':book['_id']},{'flag':1},{'chapterno':{'$lt':book1['chapterno']}}]},{'chapterno':1},sort=[('chapterno',-1)])
            else:
                chap = db.HadithChapter.find_one({'$and':[{'book':book['_id']},{'flag':1}]},{'chapterno':1},sort=[('chapterno',-1)])
            if(chap):
                newhadno = db.HadithBody.find_one({'chapter': chap['_id']},{'hadithno':1},sort=[('hadithno',-1)])['hadithno']
                if(newhadno):
                    break
        #newhadno = newhadno + 1 if(newhadno>0) else 1
        newhadno = newhadno if(newhadno>0) else 0
        newhadno = newhadno if(oldhadno<newhadno) else newhadno + 1
        
    hData={"oldhadithno":oldhadno,
           "hadithno":newhadno,
           "collection":data["collection"]}
    
    st = db.HadithBody.update_one(query,newvalues)
    update_HadNo(hData)
    chapterCount_new = getHadiths(data['chapter'],None)
    
    if(data['oldchapter'].strip()!=""):
        chapterCount_old = getHadiths(data['oldchapter'],None)
        query_old = { "_id": ObjectId(data['oldchapter']) }
        if(len(chapterCount_old)<1):
            newvalues = { "$set": { "flag": 0 } }
            st_ch = db.HadithChapter.update_one(query_old,newvalues)
        else:
            newvalues = { "$set": { "flag": 1 } }
            st_ch = db.HadithChapter.update_one(query_old,newvalues)
    
    query_new = { "_id": ObjectId(data['chapter']) }
    if(len(chapterCount_new)<1):
        newvalues = { "$set": { "flag": 0 } }
        st_ch = db.HadithChapter.update_one(query_new,newvalues)
    else:
        newvalues = { "$set": { "flag": 1 } }
        st_ch = db.HadithChapter.update_one(query_new,newvalues)
    
    return(st)

def update_HadithChapter(data):
    query = { "_id": ObjectId(data["hadithid"]) }
    newvalues = { "$set": { "chapter": ObjectId(data['chapter']), "flag": 1 } }
    newhadno = 0
    oldhadno = db.HadithBody.find_one({"_id": ObjectId(data["hadithid"])}, {"hadithno": 1})["hadithno"]
    hadno = db.HadithBody.find_one({"chapter": ObjectId(data['chapter'])}, {"hadithno": 1}, sort=[('hadithno', -1)])
    if(hadno):
        newhadno = hadno["hadithno"]
        newhadno = newhadno if(oldhadno<newhadno) else newhadno + 1
    else:
        book1 = db.HadithChapter.find_one({'_id': ObjectId(data['chapter'])},{'chapterno':1,'book':1})
        #bkno = db.HadithBook.find_one({'_id':book1['book']},{'booknumber':1})['booknumber']
        newchno = db.HadithChapter.find_one({"_id":ObjectId(data['chapter'])},{"chapterno":1})["chapterno"]
        oldchno = db.HadithChapter.find_one({"_id":ObjectId(data['oldchapter'])},{"chapterno":1})["chapterno"]
        if(newchno > oldchno):
            all_chaps = db.HadithChapter.find({'$and':[{'book':book1['book']},{'chapterno':{'$lte':newchno,'$gte':oldchno}}]},
                                        {'_id':1},sort=[('chapterno', 1)])
            ch = []
            for c in all_chaps:
                ch.append(c['_id'])
                
            hads = db.HadithBody.find({'$and':[{'chapter':{'$in':ch}},{'hadithno':{'$gte':oldhadno}}]},{'hadithno':1},sort=[('hadithno', -1)])[0]
            
            
        else:
            all_chaps = db.HadithChapter.find({'$and':[{'book':book1['book']},{'chapterno':{'$lte':oldchno,'$gte':newchno}}]},
                                        {'_id':1},sort=[('chapterno', 1)])
            ch = []
            for c in all_chaps:
                ch.append(c['_id'])
            hads = db.HadithBody.find({'chapter':{'$in':ch}},{'hadithno':-1},sort=[('hadithno', 1)])[0]
        if(hads):
            newhadno = hads["hadithno"]
        else:
            newhadno = 0
        
    hData={"oldhadithno":oldhadno,
           "hadithno":newhadno,
           "collection":data["collection"]}
    
    st = db.HadithBody.update_one(query,newvalues)
    update_HadNo(hData)
    chapterCount_new = getHadiths(data['chapter'],None)
    
    if(data['oldchapter'].strip()!=""):
        chapterCount_old = getHadiths(data['oldchapter'],None)
        query_old = { "_id": ObjectId(data['oldchapter']) }
        if(len(chapterCount_old)<1):
            newvalues = { "$set": { "flag": 0 } }
            st_ch = db.HadithChapter.update_one(query_old,newvalues)
        else:
            newvalues = { "$set": { "flag": 1 } }
            st_ch = db.HadithChapter.update_one(query_old,newvalues)
    
    query_new = { "_id": ObjectId(data['chapter']) }
    if(len(chapterCount_new)<1):
        newvalues = { "$set": { "flag": 0 } }
        st_ch = db.HadithChapter.update_one(query_new,newvalues)
    else:
        newvalues = { "$set": { "flag": 1 } }
        st_ch = db.HadithChapter.update_one(query_new,newvalues)
    
    return(st)


def insert_Hadith(data):
    try:
        if(data['chapter']==""):
            ch = None
        else:
            ch = ObjectId(data['chapter'])
        x = db.HadithBody.insert_one(
        {
            'chapter': ch,
            'book': ObjectId(data['book']),
            'collection':ObjectId(data['collection']),
            'body_ar' : data['body_ar'],
            'hadithno' : data['hadithno'],
            'save_flag':False
        })
        st = x.inserted_id 
        # update hadith number according to the newly inserted hadiths
        query = {"$and": [{'hadithno': {'$gte': data['hadithno']}}, {'_id': {'$ne': st}},{'collection': ObjectId(data['collection'])}]}
        result = list(db.HadithBody.find(query).sort('hadithno'))
        hadnum = data['hadithno'] + 1
        bulk_updates = [UpdateOne({'_id':ObjectId(doc['_id'])},{'$set':{'hadithno': hadnum + i}}) for i,doc in enumerate(result)]
        if bulk_updates:
            db.HadithBody.bulk_write(bulk_updates) 
        if(st!=None):   
            x1 = db.HadithChapter.update_one({ "_id": ch },{ "$set": { "flag": 1 } })
    except Exception as e:
        print(f"An error has occured : {e}")
    return(st)

def updateHadithAuthor_name(data):
    query = { "_id": ObjectId(data["id"]) }
    newvalues = { "$set": { "narrator_ar": data['narrator_ar'] } }
    st = db.HadithAuthors.update_one(query,newvalues)
    return(st)

def insert_Collection(data):
    try:
        colCursor = db.HadithCollection.find({ "collectionno" : { "$exists" : False } })
        for i,doc in enumerate(colCursor):
            db.HadithCollection.find_one_and_update({'_id':doc['_id']},{'$set':{'collectionno': i + 1}})
        x = db.HadithCollection.insert_one(
        {
            'collection' : data['collection'],
            'flag' : 0,
            'save_flag':False,
            'collectionno': data['collectionno']
        })
        st = x.inserted_id
        #Update HadithCollection with increment collectionnumber according to the newly inserted collection
        db.HadithCollection.update_many(
            {"$and": [{'collectionno': {'$gte': data['collectionno']}}, {'_id': {'$ne': st}}]},
            {'$inc': {'collectionno': 1}}
        )
    except Exception as e:
        print(f"An error has occured : {e}")
    return(st)

def update_Collection(data):
    query = { "_id": ObjectId(data["id"]) }
    newvalues = { "$set": { "collection": data['collection'] } }
    st = db.HadithCollection.update_one(query,newvalues)
    return(st)

def update_CollNo(data):
    try:
        colCursor = db.HadithCollection.find({ "collectionno" : { "$exists" : False } })
        for i,doc in enumerate(colCursor):
            db.HadithCollection.update_one({'_id':doc['_id']},{'$set':{'collectionno': i + 1}})
        inc = 0
        query = ""
        if(data['oldcollno']>data['collectionno']):
            query ={'$and':[{'collectionno':{'$gte':data['collectionno']}},{'collectionno':{'$lte':data['oldcollno']}}]} 
            inc = 1
        elif(data['oldcollno']<data['collectionno']):
            query ={'$and':[{'collectionno':{'$gte':data['oldcollno']}},{'collectionno':{'$lte':data['collectionno']}}]}
            inc = -1
        if(query):
            cur = db.HadithCollection.find(query,{'collectionno':1})
            for doc in cur:
                if(doc['collectionno']==data['oldcollno']):
                    values = {'$set':{'collectionno':data['collectionno']}}
                else:
                    values = {'$set':{'collectionno':doc['collectionno'] + inc}}
                db.HadithCollection.update_one({'_id': doc['_id']},values)
        
    except Exception as e:
        print(f"An error occurred: {e}")
    return



def delete_Collection(data):
    try:
        st = db.HadithCollection.delete_one({"_id" : ObjectId(data["collection"])})
        if st.deleted_count == 1:
            db.HadithCollection.update_many(
                {'collectionno': {'$gte': data['collectionno']}},
                {'$inc': {'collectionno': -1}}
            )
            
    except Exception as e:
        print(f"An error is occured : {e}")
    return(st)

def insert_Book(data):
    try:
        #Inserting new book into HadithBook
        x = db.HadithBook.insert_one({
            'collection': ObjectId(data['collection']),
            'booknumber': data['booknumber'],
            'booktitle_ar': data['booktitle_ar'],
            'flag': 0,
            'save_flag': False
        })
        st = x.inserted_id
        #Update HadithBook with increment booknumber according to the newly inserted book
        db.HadithBook.update_many(
            {"$and": [{'collection':ObjectId(data['collection'])},{'booknumber': {'$gte': data['booknumber']}}, {'_id': {'$ne': st}}]},
            {'$inc': {'booknumber': 1}}
        )
        # Update flag in HadithCollection
        coll_count = getHadithBooks(data['collection'])
        newvalues = 0 if len(coll_count) < 1 else 1
        query_col = { "_id": ObjectId(data['collection']) }
        st_col = db.HadithCollection.update_one(
            query_col,
            {'$set': {'flag': newvalues}}
        )

    except Exception as e:
        print(f"An error occurred: {e}")
    return(st,len(coll_count))

def update_Book(data):
    query = { "_id": ObjectId(data["id"]) }
    newvalues = { "$set": { "booktitle_ar": data['booktitle_ar'] } }
    st = db.HadithBook.update_one(query,newvalues)
    return(st)

def delete_Book(data):
    try:
        st = db.HadithBook.delete_one({"_id" : ObjectId(data["book"])})
        if st.deleted_count == 1:
            db.HadithBook.update_many(
                {"$and": [{'booknumber': {'$gte': data['booknumber']}}, {'collection':ObjectId(data['collection'])}]},
                {'$inc': {'booknumber': -1}}
            )
            coll_count = getHadithBooks(data['collection'])
            newvalues = 0 if len(coll_count) < 1 else 1
            query_col = { "_id": ObjectId(data['collection']) }
            st_col = db.HadithCollection.update_one(query_col,{'$set': {'flag': newvalues}})
    except Exception as e:
        print(f"An error occurred: {e}")
    return(len(coll_count))

def update_BookNo(data):
    try:
        inc = 0
        query = ""
        if(data['oldbookno']>data['booknumber']):
            query ={'$and':[{'collection':ObjectId(data['collection'])},{'booknumber':{'$gte':data['booknumber']}},{'booknumber':{'$lte':data['oldbookno']}}]} 
            inc = 1
        elif(data['oldbookno']<data['booknumber']):
            query ={'$and':[{'collection':ObjectId(data['collection'])},{'booknumber':{'$gte':data['oldbookno']}},{'booknumber':{'$lte':data['booknumber']}}]}
            inc = -1
        if(query):
            cur = list(db.HadithBook.find(query,{'booknumber':1}).sort('booknumber',1))
            cur_first_id = cur[0]['_id']
            chid = list(db.HadithChapter.find({'book':cur_first_id},{"chapterno":1}).sort('chapterno',1))
            chid = chid[0]['_id'] if(chid) else 1
            hno = list(db.HadithBody.find({'chapter':chid},{"hadithno":1}).sort('hadithno',1))
            hno = hno[0]['hadithno'] if(hno) else 1
            for doc in cur:
                if(doc['booknumber']==data['oldbookno']):
                    values = {'$set':{'booknumber':data['booknumber']}}
                else:
                    values = {'$set':{'booknumber':doc['booknumber'] + inc}}
                db.HadithBook.update_one({'_id': doc['_id']},values)
            cursor = list(db.HadithBook.find(query,{'booknumber':1}).sort('booknumber',1)) 
            for bdoc in cursor:
                chapcur = list(db.HadithChapter.find({'book':bdoc['_id']},{'chapterno':1}).sort('chapterno',1))
                for cdoc in chapcur:
                    hadcur = list(db.HadithBody.find({'chapter':cdoc['_id']},{'hadithno':1}).sort('hadithno',1))
                    for haddoc in hadcur:
                        db.HadithBody.update_one({'_id': haddoc['_id']},{"$set":{'hadithno':hno}})
                        hno = hno + 1
        
    except Exception as e:
        print(f"An error occurred: {e}")
    return


def update_save_hadiths(data):
    query = {'$or':[{'chainComment':None},{'hadithComment':None}]}
    newvalues = { "$set": { "save_flag": 0 } }
    st_col = db.HadithBody.update_one(query,newvalues)

def delete_Hadith(data):
    try:
        st = list(db.HadithBody.find({"_id" : ObjectId(data["hadithid"])},{"chapter":1}))
        ch = [c['chapter'] for c in st][0]
        st = db.HadithBody.delete_one({"_id" : ObjectId(data["hadithid"])})
        if st.deleted_count:
            chapterCount_new = getHadiths(ch,None)
            db.HadithBody.update_many({
                "$and":[{'collection':ObjectId(data["collection"])},{'hadithno': {'$gte':data["hadithno"]}}]},
                {"$inc":{'hadithno': -1}}
            )
            newvalues = 0 if len(chapterCount_new)<1 else 1
            st_ch = db.HadithChapter.update_one({"_id" : ch},{'$set': {'flag': newvalues}})
    except Exception as e:
        print(f"An error has occured : {e}")
    return(st,len(chapterCount_new))

def get_HadithNumber(data):
    try:
        max_hadith_no = 0
        match_conditions = []
        if data["book"]:
            match_conditions.append({"bookId": ObjectId(data["book"])})
        if data["chapter"]:
            match_conditions.append({"chapterId": ObjectId(data["chapter"])})
        query = {'$and': match_conditions}
        hadiths = list(db.HadithBody.aggregate([
                        {'$lookup':{'from': "HadithChapter",'localField':"chapter",'foreignField':"_id",'as': "Chapter"}},
                        {'$lookup':{'from': "HadithBook",'localField':"Chapter.book",'foreignField':"_id",'as': "Book"}},
                        {'$unwind':'$Chapter'},{'$unwind':'$Book'},
                        {'$project':{"_id":1,"hadithno":1,"chapterId":"$Chapter._id","bookId":"$Book._id"}},
                        {'$match': query}
        ]))
        had_no = [doc['hadithno'] for doc in hadiths]
        max_hadith_no = max(had_no)
        
    except Exception as e:
        print(f"An error has occured in get_HadithNumber : {e}")
    return max_hadith_no