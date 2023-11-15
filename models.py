from config import db
from bson import ObjectId, json_util

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
    
    collection = list(db.HadithCollection.find(query))
    
    for c in collection:
        c['_id'] = str(c['_id'])
        if("flag" in c):
            c['flag'] = c['flag']
        else:
            c['flag'] = 1
        
    return collection 

def getHadithBooks(id):
    if(id !=None):
        query = {"collection":ObjectId(id)}
    else:
        query = {}
    book = list(db.HadithBook.find(query,
                                   {"_id":1,"booktitle_ar":1,"flag":1,"save_flag":1}))
    for b in book:
        b['_id'] = str(b['_id'])
        b['booktitle_ar'] = str(b['booktitle_ar'])
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
                                   {"_id":1,"arChapter":1,"flag":1,"save_flag":1}))
    for b in book_chap:
        b['_id'] = str(b['_id'])
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
                                   {"_id":1,"arChapter":1,"flag":1,"save_flag":1}))
    chap_count = ""
    hadiths = []
    
    for b in book_chap:
        b['_id'] = str(b['_id'])
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
                                {"_id","body_ar","hadithno","save_flag"}))
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
                                {"body_ar","chainComment","hadithComment"}))
    for h in hadith:
        h['_id'] = str(h['_id'])
    return(hadith)

#not using
def getHadithSanad1(hadithid):
    query = {"_id":ObjectId(hadithid)}
    hadith = list(db.HadithBody.find(query,
                                    {"chain"}))
    narrator_lst = []
    for h in hadith:
        if 'chain' in h:
            for narr in h['chain']:
                narrator = getAuthorsName(narr)
                for n in narrator:
                    narrator_lst.append([n["_id"],n["narrator_ar"]]) 
                
    return narrator_lst
#--------
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
        narr['nstudents'] = json_util.dumps(narr['nstudents'])
        narr['nteachers'] = json_util.dumps(narr['nteachers'])
        narr['bio'] = str(narr['bio'])
        narr['narrator_ar'] = str(narr['narrator_ar'])
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
        coll_lst.append([c['_id'],c['collection'],c['flag'],c['save_flag']])
        
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
                        chap_lst.append([ch['_id'],ch['arChapter'],ch['flag'],ch['save_flag']])
                    if(first_book_count == 0):
                        hadith = hadiths
                    first_book_count+=1
                    ch_lst = chap_lst
                
                book_lst.append([b["_id"],b["booktitle_ar"],b['flag'],b['save_flag']])
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
                            "body_ar":data['matn'],
                            "hadithno":data['hadithno']}}
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

def insert_Sanad(id,slist):
    myquery = { "_id" : ObjectId(id) }
    st = 0
    sanad_li = []
    for s in range(0,len(slist)):
        if(ObjectId.is_valid(slist[s])):
            sanad_li.append(ObjectId(slist[s]))
    sanad_li = list(reversed(sanad_li))
    if(len(sanad_li)!=0):
        db.HadithBody.update_one(myquery,{"$unset":{"chain":""}})
        x = db.HadithBody.update_one(myquery,
            { "$push": { "chain": { "$each": sanad_li } } }) 
        st = x.modified_count
    return(st)


def insert_Chapter(data):
    maxnum = 0
    chapno = db.HadithChapter.aggregate([{ 
        '$match' : {'book' : ObjectId(data['book'])}
    },{"$group":{
           "_id": "$book","maxno": { "$max": "$chapterno"  }}}])
    for ch in chapno:
        if(ch['maxno']<0):
            maxnum = 0
        maxnum = ch['maxno']+1
    x = db.HadithChapter.insert_one(
    {
        'chapterno' : maxnum,
        'chaptitle' :[],
        'arChapter' : [data['arChapter']],
        'book':ObjectId(data['book']),
        'flag':0,
        'save_flag':False
    })
    st = x.inserted_id
    db.HadithBook.find_one_and_update(
   { "_id" : ObjectId(data['book']) },
   { "$set": { "flag" :1}})
    return(st)


def delete_Chapter(data):
    st = db.HadithChapter.delete_one({"_id" : ObjectId(data["chapter"])})
    book_count = list(db.HadithChapter.find({ "book": ObjectId(data['book']) }))
    newvalues = ""
    if(len(book_count)<1):
        newvalues = { "$set": { "flag": 0 } }
    else:
        newvalues = { "$set": { "flag": 1 } }
    query_col = { "_id": ObjectId(data['book']) }
    st_col = db.HadithBook.update_one(query_col,newvalues)
    return(len(book_count))

def update_Chapter(data):
    
    query = { "_id": ObjectId(data["id"]) }
    newvalues = { "$set": { "arChapter": [data['arChapter']] } }
    st = db.HadithChapter.update_one(query,newvalues)
    return(st)

def update_HadithChapter(data):
    query = { "_id": ObjectId(data["hadithid"]) }
    newvalues = { "$set": { "chapter": ObjectId(data['chapter']), "flag": 1 } }
    st = db.HadithBody.update_one(query,newvalues)
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
    if(data['chapter']==""):
        ch = None
    else:
        ch = ObjectId(data['chapter'])
    x = db.HadithBody.insert_one(
    {
        'chapter': ch,
        'book': ObjectId(data['book']),
        'body_ar' : data['body_ar'],
        'save_flag':False
    })
    st = x.inserted_id 
    
    if(st!=None):
        x1 = db.HadithChapter.update_one({ "_id": ch },{ "$set": { "flag": 1 } })
    return(st)

def updateHadithAuthor_name(data):
    query = { "_id": ObjectId(data["id"]) }
    newvalues = { "$set": { "narrator_ar": data['narrator_ar'] } }
    st = db.HadithAuthors.update_one(query,newvalues)
    return(st)

def insert_Collection(data):
    
    x = db.HadithCollection.insert_one(
    {
        'collection' : data['collection'],
        'flag' : 0,
        'save_flag':False
    })
    st = x.inserted_id
    return(st)

def update_Collection(data):
    query = { "_id": ObjectId(data["id"]) }
    newvalues = { "$set": { "collection": data['collection'] } }
    st = db.HadithCollection.update_one(query,newvalues)
    return(st)

def delete_Collection(data):
    st = db.HadithCollection.delete_one({"_id" : ObjectId(data["collection"])})
    return(st)

def insert_Book(data):
    maxnum = 0
    """ bookno = db.HadithBook.aggregate([{ 
        '$match' : {'collection' : ObjectId(data['collection'])}
    },{"$group":{
           "_id": "$collection","maxno": { "$max": "$booknumber"  }}}])
    for b in bookno:
        if(b['maxno']<1):
            maxnum = 1
        maxnum = b['maxno']+1 """
    x = db.HadithBook.insert_one(
    {
        'collection' : ObjectId(data['collection']),
        'booknumber' : maxnum,
        'booktitle_ar': data['booktitle_ar'],
        'flag' : 0,
        'save_flag':False
    })
    st = x.inserted_id
    coll_count = getHadithBooks(data['collection'])
    newvalues = ""
    if(len(coll_count)<1):
        newvalues = { "$set": { "flag": 0 } }
    else:
        newvalues = { "$set": { "flag": 1 } }
    query_col = { "_id": ObjectId(data['collection']) }
    st_col = db.HadithCollection.update_one(query_col,newvalues)
    
    return(st,len(coll_count))

def update_Book(data):
    query = { "_id": ObjectId(data["id"]) }
    newvalues = { "$set": { "booktitle_ar": data['booktitle_ar'] } }
    st = db.HadithBook.update_one(query,newvalues)
    return(st)

def delete_Book(data):
    st = db.HadithBook.delete_one({"_id" : ObjectId(data["book"])})
    coll_count = getHadithBooks(data['collection'])
    newvalues = ""
    if(len(coll_count)<1):
        newvalues = { "$set": { "flag": 0 } }
    else:
        newvalues = { "$set": { "flag": 1 } }
    query_col = { "_id": ObjectId(data['collection']) }
    st_col = db.HadithCollection.update_one(query_col,newvalues)
    return(len(coll_count))

def update_save_hadiths(data):
    query = {'$or':[{'chainComment':None},{'hadithComment':None}]}
    newvalues = { "$set": { "save_flag": 0 } }
    st_col = db.HadithBody.update_one(query,newvalues)

def delete_Hadith(data):
    st = list(db.HadithBody.find({"_id" : ObjectId(data["hadithid"])},{"chapter":1}))
    ch = [c['chapter'] for c in st][0]
    st = db.HadithBody.delete_one({"_id" : ObjectId(data["hadithid"])})
    chapterCount_new = getHadiths(ch,None)
    
    
    if(len(chapterCount_new)<1):
        newvalues = { "$set": { "flag": 0 } }
        st_ch = db.HadithChapter.update_one({"_id" : ch},newvalues)
    else:
        newvalues = { "$set": { "flag": 1 } }
        st_ch = db.HadithChapter.update_one({"_id" : ch},newvalues)
    return(st,len(chapterCount_new))
