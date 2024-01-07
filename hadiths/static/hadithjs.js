$(document).ready(function(){

        let narrator_list = ""
        let moallaka_list = ""
        let hadith_id = ""
        let rows = $("#hadeeth tbody tr");
        let hadrows = $("#hadTabbody tr");
        let currentIndex = 0;
        let prevselBookId = ""
        let prevselChapId = ""
        let prevselCollId = ""
        let prevselHadId = ""
        const chkdBgColor = 'rgb(24, 139, 240)';
        let hadith_table_id = "";
        let old_chapter_id = "";
        let btnFlag = 1;
        let isBtnSanadClicked = false;
        let isBtnKeyClicked = false;
        let sumwidth=0;
        let moal_count = 1  ///for moallaka 2D array to display on table

        let tdBookContent = "";
        let tdChapContent = "";
        let tdCollContent = "";
        const coll_div = $("#collectionBlock2");
        const book_div = $("#bookBlock2");
        const chap_div = $("#chapterBlock2");
                
        const coll_header = coll_div.find(".headerDiv #coll_name");
        const book_header = book_div.find(".headerDiv #book_name");
        const chap_header = chap_div.find(".headerDiv #chap_name");
                
        const bookContentDivs = book_div.find("#bkDiv")
        const chapterContentDivs = chap_div.find("#chDiv")
        const collcontentDivs = coll_div.find("#clDiv");
        
        const coll_div2 = $("#collectionBlock2");
        const book_div2 = $("#bookBlock2");
        const chap_div2 = $("#chapterBlock2");

        const coll_header2 = $(coll_div2).find(".headerDiv");
        const book_header2 = $(book_div2).find(".headerDiv");
        const chap_header2 = $(chap_div2).find(".headerDiv");
        
        //synchronous call for getting Narrators list
        $.ajax({
            url:"/getnarrator",
            type:"POST",
            dataType:'json',
            async: false,
            success:function(result){                   
                narrator_list=result;},
            error: function(error) {
                console.log(error);}
        });

        //ajax call to /getSanad for displaying the sanad on the table
        function get_sanad(hadithid)
        {
            $.ajax({url:"/getSanad",
                type:"POST",
                dataType:'json',
                data:{hadithid:hadithid},
                success:function(result){
                    var data = result;
                    len = data.length - 1
                    $('#tableSanadList> tbody tr:last-child').append('<td><i id="btnSanad" class="fa fa-plus-circle w3-text-theme" ></i></td>') // + btn at the beginning
                    $('#sanaddisplay').css("display",(data.length==0)?"none":""); //for displayng the heading for Sanad chain
                    for (var i= len ;i>=0;i--){
                        var doc = data[i]
                        $('#chainTable > tbody:last-child').append('<td  id="'+
                         doc[0] +'"><span class="linkSpan">'+ doc[1]+'</span></td>'); //display narrator name to chaintable
                        $('#tableSanadList> tbody tr:last-child').append('<td></td>')
                        com = getNarratorListtoCombobox("Sanadlist",0,doc[0])
                        $("#tableSanadList > tbody tr td:last-child").append(com) //display narrator combo for editing (tableSanadList)
                        com.select2({
                        }).on('change',function (){
                            adjustIconMargin($(this));
                        }).on('select2:open',function(){
                            $('.select2-container--above').attr('id','fix');
                            $('#fix').removeClass('select2-container--above').addClass('select2-container--below');
                        });
                        $("#tableSanadList > tbody tr td:last-child").append('<i id="btnSanad" class="fa fa-plus-circle w3-text-theme" ></i>') //+btn at the end
                    }
                },
                error: function(error) {
                    console.log(error);
                }
            });
        }
        
        //ajax call to /getmoallaka for displaying moallaka on the table
        function get_moallaka(hadithid)
        {
            $.ajax({url:"/getmoallaka",
                type:"POST",
                dataType:'json',
                data:{hadithid:hadithid},
                success:function(result){
                    var data = result.data1;
                    moallaka_list = data;
                    $('#moaladisplay').css("display",(data.length==0)?"none":""); //for displayng the heading for Moallakka chain
                    for (var i= 0 ;i<data.length;i++){ //2-d array
                        var doc = data[i]
                        for(var d = 0;d<doc.length;d++){
                            var dat = doc[d];
                            $('#moalaTable > tbody:last-child').append('<td  id="'+ dat[0] +'"><span class="linkSpan">'+ dat[1]+'</span></td>'); //displaying on moalatable
                            $('#'+ dat[0]).css({"padding-right":"20px","padding-bottom":"5px"});
                        }
                        $('#moalaTable > tbody:last-child').append('<tr></tr>')
                    }  
                },
                error: function(error) {
                    console.log(error);
                }
            });
        }

        //ajax call to /getComments and keywords for displaying the comments on the textarea
        function get_comments(hadithid)
        {
            $.ajax({url:"/getComments",
                type:"POST",
                dataType:'json',
                data:{hadithid:hadithid},
                success:function(result){
                    for (var i= 0 ;i<result.length;i++){
                        var doc = result[i]
                        $('#chainComment').val(doc['chainComment'])
                        $('#hadeethComment').val(doc['hadithComment'])
                        $('#tableKeyList> tbody tr:last-child').append('<td><i id="btnKey" class="fa fa-plus-circle w3-text-theme" ></i></td>') // + btn to add keyword
                        if(doc['keywords'] && doc['keywords'].length !== 0)
                        {
                            $("#addKeyTable").css('display','block');
                            isBtnKeyClicked= !isBtnKeyClicked;
                            var table = $("#addKeyTable").width()-300;
                            for(var d = 0;d<doc['keywords'].length;d++)
                            {
                                var tr=$("#tableKeyList tr:last");
                                var tdwidth=tr.find('td:nth-last-child(2)').width();
                                sumwidth = sumwidth + tdwidth;
                                var com = $('<div style="position: relative;"></div>'); // Wrap in a container for relative positioning
                                var inputKey = $('<input type="text" name="input_key" data-max-height="200px" value="'+ doc['keywords'][d] +'" style="width: 150px">');
                                var close = $('<a href="" rel="close"><i class="fa fa-times-circle" style="font-size:15px; color:red; position: absolute; top: -10px; right: -5px;"></i></a>');
                                com.append(inputKey);
                                com.append(close);
                                if (sumwidth <= table)
                                {
                                    var clickedIndex = $("#tableKeyList").closest('td').index();
                                    var td = $('<td ></td>');
                                    td.append(com);
                                    var targetTd = tr.find('td').eq(clickedIndex);
                                    if (targetTd.length > 0) targetTd.before(td); else tr.append(td);
                                }
                                else
                                {
                                    var newRow = $('<tr><td></td></tr>');
                                    newRow.find('td').append(com);
                                    newRow.append($('<td></td>').append($("#btnKey").clone()));
                                    tr.find('td:last').remove();
                                    tr.after(newRow);
                                    sumwidth = 0;
                                }
                            }
                        } 
                        else
                        {
                            $("#addKeyTable").css('display','none');
                        }  
                    } 
                },
                error: function(error) {
                    console.log(error)
                }
            });
        }

        //function to clear the sanad, moallaka and keyword tables
        function clear_chklist(){
            moal_count = 1
            btnFlag = 1
            isBtnSanadClicked = false;
            isBtnKeyClicked = false;
            $('#chkMoallaka').prop('checked', false);
            $("#addSanadTable, #addMoalaTable, #addKeyTable").css('display', 'none');
            $("#addMoalaTable").find("div").each(function(){$(this).closest("tr").remove();});
            $("#tableSanadList").find("td").each(function(){$(this).remove();});
            $("#tableKeyList").find("td").each(function(){$(this).remove();}); 
            $('#chainComment').val("")
            $('#hadeethComment').val("")
            $('#responseTab').css('display','block');
            hidePopup();
            $('#hadpopup1').hide();
        }
        // fun to get clear the comments and other tabs under the #hadeeth table and get the details of corresponding hadithid passed.
        function hadeethTabClick(hadithid){
            clear_chklist() //chainComment, hadeethComment, Moallaka and Sanad Table to clear and hide popup-overlay and #responseTab display block
            
            get_sanad(hadithid) //get corresponding sanad list
            
            get_moallaka(hadithid) //get corresponding moallaka list
            
            get_comments(hadithid) // get corresponding comments and keywords
        }
        //function to clear the hadeeth details block
        function clear_hadithDetails(){
            $('#chainTable tbody').empty();
            $('#moalaTable tbody').empty();
            $('#responseTab').css('display','none');
            isBtnSanadClicked = false;
            isBtnKeyClicked = false;
        }
        function getHadithNumber(data){
            var hno = 0;
            $.ajax({
                url: "/getprevhadithNumber",
                type: "POST",
                async: false,
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: function (result) {
                    if(result['prevhadithno']>0)
                        hno = Number(result['prevhadithno']) + 1;
                }
            });
            return hno
        }
        function getPrevHadithNumber(chtr,bktr){
            let hadithNumber = 0
            while(!hadithNumber){
                if(chtr.length<= 0){
                    if(bktr.length <= 0){
                        hadithNumber = hadithNumber + 1
                    }else{
                        hadithNumber = getHadithNumber({'book' : bktr.find('input[type="hidden"]').val(),'chapter':null});
                        bktr = bktr.prev();
                    }
                }else{
                    hadithNumber = getHadithNumber({'book' : null,'chapter':chtr.find('input[type="hidden"]').val()});
                    chtr = chtr.prev();
                }
            }
            return hadithNumber  
        }
        function toggle_checkmark(td,data,selectedId){
            for (var i=0;i<data.length;i++){
                var doc = data[i];
                if(doc[0] == selectedId){
                    if(doc[3] == true ){if(td.find('.checkmark').length==0){
                        const iele = document.createElement("i");
                        iele.className = "checkmark w3-text-theme";
                        iele.style.fontSize = "15px";
                        iele.id = selectedId;
                        td.append(iele);}}
                    else{
                        if(td.find('.checkmark').length>0){td.find('.checkmark').remove()}
                    }
                }
            }
        }
        function getCheckedIds(tabName){
            let idList = new Array();
            let tdList = new Array();
            let trList = new Array();
            tabName.forEach(function(name){
                let chdtd =$(name + ' td').filter(function(){
                    return $(this).css('background-color') == chkdBgColor
                });
                trList.push((chdtd.length > 0)?chdtd.closest('tr'):"");
                tdList.push(chdtd);
                idList.push((chdtd.length > 0)?chdtd.find('input[type=hidden]').val() :"");
            });
            return [trList,tdList,idList];
        }
        ////////////hadeeth table click to show popup for changing the chapter/////
        $("#hadTabbody").on('click','td', function() {
            const selftd = $(this);
            event.preventDefault();
            const tdIndex = selftd.index();
            let checkedTabList = ['#chapterTabBody','#bookTabBody','#collectionTabBody']
            let [trList,tdList,idList] = getCheckedIds(checkedTabList)
            let [ch, bk, cl] = idList
            let [checkedtr, chdbooktr, chdcolltr] = trList
            const relval = selftd.find('a').attr('rel'); 
            $('#hadpopup1').hide();

            if(relval == "save"){
                const hid = selftd.parent('tr').find('input[type="hidden"][name="hadithid_card"]').val();
                const tdinput = selftd.parent('tr').find('input[type="hidden"]').parent('td')
                const tdText = tdinput.text().trim();
                if(hid == "" &&  tdText!=""){
                    const chtr = checkedtr.prev();
                    const bktr = chdbooktr.prev();
                    var prevHadithno = (tdinput.closest('tr').prev().find('p').text())?Number(tdinput.closest('tr').prev().find('p').text().match(/\((-?\d+)\)/)[1]) + 1:
                    (tdinput.closest('tr').next().find('p').text())?Number(tdinput.closest('tr').next().find('p').text().match(/\((-?\d+)\)/)[1]) - 1:0;
                    prevHadithno = (prevHadithno<=0)?getPrevHadithNumber(chtr,bktr):prevHadithno;
                    var chData = {
                        'chapter':ch,
                        'book':bk,
                        'collection': cl,
                        'body_ar' : tdText,
                        'hadithno' : prevHadithno
                    };
                    $.ajax({url:"/inserthadith",
                        type:"POST",
                        contentType: 'application/json',
                        data:JSON.stringify(chData),
                        success:function(result){
                            $('#addTD').toggleClass('fa-plus fa-times');
                            trList.forEach(function($tr){
                                if($tr.find('.checkmark').length>0){$tr.find('.checkmark').remove()};
                            })
                            tdinput.attr('contenteditable','False');
                            tdinput.removeClass("w3-edittd");
                            const hadno = prevHadithno
                            const pele = document.createElement('p');
                            hadindex = tdinput.closest('tr').index()+1
                            let balSymbol = (tdText.length>100)?"...":""
                            pele.textContent = ' ('+hadno+')'+tdText.substring(0, 100)+balSymbol;
                            tdinput.append(pele);
                            
                            let ind = hadno
                            $('#hadTabbody tr').each(function(index){
                                if(index>=hadindex){
                                    ind = ind + 1;
                                    var extractedText = $(this).find('td:eq(1)').find('p').text().replace(/\(\d+\)/, '')
                                    $(this).find('td:eq(1)').find('p').text(' (' + ind + ')').append(extractedText)
                                }
                            })
                            tdinput.contents().filter(function(){return this.nodeType===3;}).remove()
                            tdinput.find('input[type="hidden"]').val(result);
                            //change from save to edit chapter mode                            
                            const anchorele = selftd.find('a[rel="save"]')
                            anchorele.attr('rel','edit')
                            const iele = anchorele.find('i')
                            iele.toggleClass('fa-save fa-edit ');
                            $('#hadeeth > tbody').prepend('<tr><td style="border: 1px solid black;border-collapse: collapse;" ><input type="hidden"  id="hadithid" name="hadithid" value="'+ 
                            result +'" /><p contenteditable="True">'+ tdText.trim()+'</p></td></tr>');
                            let hadeethlen = $("#hadeeth tbody tr").length;
                            for(let ind=0;ind<hadeethlen;ind++){
                                let nind = ind + 1;
                                if(ind<(hadindex - 1)){
                                    var row1 = $("#hadeeth tbody tr").eq(ind).detach(true);
                                    var row2 = $("#hadeeth tbody tr").eq(nind).detach(true);
                                    $("#hadeeth tbody tr").eq(nind).after(row1)
                                    $("#hadeeth tbody tr").eq(ind).after(row2) 
                                }
                            }
                            clear_hadithDetails()
                            rows = $("#hadeeth tbody tr");
                            showCurrentRow(); 

                        }
                    });   
                }else{$(this).parent('tr').find("td:eq(1)").focus();}
            }else if(relval == "del"){
                const tdhadithid = selftd.parent('tr').find('input[type="hidden"][name="hadithid_card"]').val();
                
                if(tdhadithid==""){
                    selftd.parent('tr').remove();
                    $('#addTD').toggleClass('fa-plus fa-times');
                    var chdHadtd = $('#hadTabbody td').filter(function() {
                        return $(this).find('input[name=hadithid_card]').val() == prevselHadId;
                    }).trigger('click')
                }
                else{
                    const hadnumber = Number($(selftd).closest('tr').find('p').text().match(/\((-?\d+)\)/)[1])
                    var haddata = {
                        'hadithid':tdhadithid,
                        'collection': cl,
                        'hadithno' : hadnumber
                    };
                    $.ajax({url:"/deletehadith",
                        type:"POST",
                        contentType: 'application/json',
                        data:JSON.stringify(haddata),
                        success:function(result){
                                let trNext = selftd.parent('tr').next();
                                let trPrev = selftd.parent('tr').prev();
                                const hadindex = $(selftd).closest('tr').index()
                                $('#hadTabbody tr').each(function(index){
                                    if(index>=hadindex){
                                        let ind = Number($(this).find('td:eq(1)').find('p').text().match(/\((-?\d+)\)/)[1]) - 1
                                        var extractedText = $(this).find('td:eq(1)').find('p').text().replace(/\(\d+\)/, '')
                                        $(this).find('td:eq(1)').find('p').text(' (' + ind + ')').append(extractedText)
                                    }
                                });
                                $("#hadeeth tbody tr").each(function(){
                                    if($(this).find('input[type="hidden"][name="hadithid"]').val() == tdhadithid){
                                        $(this).remove();
                                    }
                                });
                                rows = $("#hadeeth tbody tr")
                                if(selftd.parent('tr').find('td:eq(1)').css('background-color')==chkdBgColor){
                                    clear_hadithDetails();rows = $("#hadeeth tbody tr");
                                    if(trNext.length>0){trNext.find('td:eq(1)').trigger('click');}
                                    else if(trPrev.length>0){trPrev.find('td:eq(1)').trigger('click');}}
                                selftd.parent('tr').remove();
                                
                                var coll_data={collection:cl,book:bk,chapter:ch};
                            $.ajax({url:"/gethadithinfo",
                            type:"POST",
                            contentType: 'application/json',
                            data:JSON.stringify(coll_data),
                            success:function(result){
                                var book = result.book
                                let chapter = result.chap;
                                var collection = result.collection;
                                
                                const chtd = checkedtr.find('td:eq(0)');
                                toggle_checkmark(chtd,chapter,ch)
                                const bktd = chdbooktr.find('td:eq(0)');
                                toggle_checkmark(bktd,book,bk)
                                const colltd = chdcolltr.find('td:eq(0)');
                                toggle_checkmark(colltd,collection,cl)
                            }});    
                        }
                    });
                    
                }

                
            }else{
                let htdval = ""
                hadith_id = ""
                rows.each(function() {if ($(this).css("display") === "table-row") {
                        htdval = $(this).find('td').find('input[type="hidden"]').val();}});
                
                if (tdIndex === 2 | tdIndex ===1) {hadith_id = selftd.parent('tr').find('input[type="hidden"]').val();}
                if(hadith_id!=""){
                    let emptyRow = $('#hadTabbody tr').filter(function(){
                        return $(this).find('input[type="hidden"][name="hadithid_card"]').val()==""
                    });
                    hadith_table_id = hadith_id;
                    currentIndex = selftd.parent('tr').index();
                    if (tdIndex === 1){
                        if(hadith_id != htdval){
                            if(emptyRow.length == 0){
                                $("#hadTabbody td").css({backgroundColor: '',color: ''}); //clear the selection of the tbody
                                clear_hadithDetails()
                                showCurrentRow(hadith_id);
                            }
                        }
                        if ($('#addTD').hasClass('fa-times')) {
                            if(emptyRow.length == 0){ 
                                addNewRow('#hadTabbody','hadithid_card',currentIndex);
                                showCurrentRow(hadith_id);
                                $('#hadTabbody>tr').find('td[contenteditable="true"]').focus(); 
                            }else{emptyRow.find('td:eq(1)').focus();}
                        }
                    }
                    if (tdIndex === 2) {
                        $("#btnOk").prop("disabled", true);
                        //to get the corresponding chapter of book selected and display on the hadpopup
                        let selector = document.getElementById("hadChap");
                        selector.innerHTML = "";
                        $('#chapterTabBody tr').each(function(){
                            const td = $(this).find('td:eq(1)');
                            const chapid = td.find('input[type=hidden]').val();
                            const tr = document.createElement("tr");
                        
                            const td1 = document.createElement("td");
                            td1.style.textAlign = "right";
                            td1.style.fontSize = "10px"; 
                        
                            const chapoption = document.createElement("input");
                            chapoption.type = "radio";
                            chapoption.className = "form-radio-input";
                            chapoption.name = "optChapter";
                            chapoption.value = chapid;
                            if (ch == chapid) {chapoption.checked = true}
                            td1.appendChild(chapoption);

                            const td2 = document.createElement("td");
                            td2.style.textAlign = "right";
                                    
                            const hiddenInput = document.createElement("input");
                            hiddenInput.type = "hidden";
                            hiddenInput.id = "hadchapid";
                            hiddenInput.name = "hadchapid";
                            hiddenInput.value = chapid;

                            const p = document.createElement("p");
                            p.textContent = td.text().trim();
                            td2.appendChild(hiddenInput);
                            td2.appendChild(p);
                                    
                            tr.appendChild(td1);
                            tr.appendChild(td2);
                        

                            selector.appendChild(tr);
                        })
                        //Show the popup
                        $('#hadpopup1').show();
                        //get the position for where to display the popup
                        const parentElement = selftd.parent();
                        const trPosition = parentElement.offset();
                        const trHeight = selftd.height();
                        const popupTop = trPosition.top + trHeight; 

                        // Set the position of the popup
                        $('#hadpopup1').css({ left:trPosition.left , top: popupTop });    
                    }
                }
            }
        }); 
        
        ////////////ajax call to /getnarratorinfo to get the author details on the popup window/////////////////
        function get_narrator_info(narratorid)
        {
            $.ajax({url:"/getnarratorinfo",
                type:"POST",
                dataType:'json',
                data:{narratorid:narratorid},
                success:function(result){
                    for (var i= 1 ;i<result.length;i++){
                        var doc = result[i]
                        var name = $(".popup-content table tbody tr").find(".data_name")
                        if (doc['narrator_ar']) {name.text(doc['narrator_ar']);name.attr('id',doc['_id']);}
                        else{name.text("No Data")}
                        var hadithno = $(".popup-content table tbody tr").find(".data_hadno")
                        hadithno.text(result[0]);
                        var nstudents =  $(".popup-content table tbody tr").find(".data_students")
                        if(doc['nstudents']){nstudents.text(doc['nstudents']);}
                        else{nstudents.text("No Data");}
                        var nteachers = $(".popup-content table tbody tr").find(".data_teachers")
                        if(doc['nteachers']){nteachers.text(doc['nteachers']);}
                        else{nteachers.text('No Data');}
                        var bio = $(".popup-content table tbody tr").find(".data_bio")
                        if(doc['bio']){bio.text(doc['bio']);}
                        else{bio.text("No Data");}
                        $("#alink").attr("href", '/'+narratorid);
                    } 
                    showPopup()
                },
                error: function(error) {
                    console.log(error)
                }
            });
        }
      
        //////////span click on the chainTable click to show the popup with the author details//////
        $("#chainTable").on('click','span', function() {
            const parentElement = $(this).parent();
            const trPosition = parentElement.offset();
            let popupTop = trPosition.top - 130;
            if (window.innerHeight<510){popupTop = $("#hadeeth").offset().top + 20;}
            if (window.innerHeight>800){popupTop = trPosition.top + 20;}
             
            $td=$(this).closest('td');
            $('.popup-overlay').css({ left:trPosition.left  , top: popupTop }); 
            get_narrator_info($td.attr('id'))
            const td = $('.popup-content').find('table tbody tr td[contenteditable="True"]'); 
            setTimeout(function () {td.focus();}, 50);
            td.addClass("w3-edittd");
        });
        ///function to save narrator name in popup-overlay 
        $("#saveNarratorName").on('click', function() {
            event.preventDefault();
            const td = $(this).closest('td').prev('td');
            const tdid = '#chainTable #'+td.attr('id')
            const mid = '#moalaTable #'+td.attr('id')
            const tdtxt = td.text().trim()
            var narrData = {
                'id': td.attr('id'),
                'narrator_ar': tdtxt
            };
            $.ajax({url:"/updatenarrname",
                type:"POST",
                contentType: 'application/json',
                data:JSON.stringify(narrData),
                success:function(result){
                    $(tdid).find('span').html(tdtxt);
                    $(mid).find('span').html(tdtxt);
                    for(var n=0;n<narrator_list.length;n++){
                        var doc = narrator_list[n]
                        if(doc['_id'] ==td.attr('id')){
                            doc['narrator_ar'] = tdtxt;
                            narrator_list[n] = doc;
                        }
                    }
                },
                error: function (error) {
                console.log("AJAX Error in saveNarratorName :", error);
                }
            });   
        });
        ///positioning the popup-overlay on windows resize
        $(window).resize(function() {updatePopupLeftPosition($('.popup-overlay'))});
        function updatePopupLeftPosition($this) {
            let popupTop = $("#responseTab").offset().top - 120;
            if (window.innerHeight<650){popupTop = $("#hadeeth").offset().top + 20;}
            if (window.innerHeight>800){popupTop = $("#responseTab").offset().top + 20;}
            let newLeft = $("#responseTab").offset().left + 20;
            if (window.innerWidth>800){newLeft = $("#chainTable").offset().left + 70;} // Get the new left position
            $('.popup-overlay').css({ left: newLeft , top: popupTop });}
        
        ////////////////////////////////////////////////////////////////////////////////////////
        ////span click on the moalaTable to show the popup/////
        $("#moalaTable").on('click','span', function() {
            const parentElement = $(this).parent();
            const trPosition = parentElement.offset();
            const popupTop = trPosition.top + 20; 
            $td=$(this).closest('td');
            $('.popup-overlay').css({ left:trPosition.left + 30 , top: popupTop }); 
            get_narrator_info($td.attr('id'))
            const td = $('.popup-content').find('table tbody tr td[contenteditable="True"]');
            setTimeout(function () { td.focus(); }, 50);
            td.addClass("w3-edittd");
        });
        
        function updateBookTable(coll){
            var coll_data={collection:coll};
            $.ajax({url:"/getbooks",
                type:"POST",
                contentType: 'application/json',
                data:JSON.stringify(coll_data),
                success:function(result){
                    book = result.book;
                    for (var i=0;i<book.length;i++){
                        var doc = book[i]
                        if(doc["flag"] == 0){
                            var chdBooktr = $('#bookTabBody tr').filter(function() {
                            return $(this).find('input[type=hidden][name=bookHidden]').val() == doc['_id'] & $(this).find('.deleteRow').length==0;
                            });
                            if(chdBooktr.find('td:eq(1)').css('background-color')!=chkdBgColor){
                                const dropdownDiv = '<a href="" class="deleteRow" rel="del"><i class="fa fa-minus w3-text-theme" ></i></a>' 
                                chdBooktr.find('td:eq(0)').append(dropdownDiv)                                     
                            }
                        }
                    } 
                }
            });
        }
        function updatechapterTable(book){
            let book_data={data_book:book};
            $.ajax({url:"/getbookchapters",
                type:"POST",
                contentType: 'application/json',
                data:JSON.stringify(book_data),
                success:function(result){
                    chap = result.chap;
                    for (var i=0;i<chap.length;i++){
                        var doc = chap[i]
                        if(doc["flag"] == 0){
                            var chdChaptr = $('#chapterTabBody tr').filter(function() {
                            return $(this).find('input[type=hidden][name=chapter]').val() == doc['_id'] & $(this).find('.deleteRow').length==0;
                            });
                            if(chdChaptr.find('td:eq(1)').css('background-color')!=chkdBgColor){
                                const dropdownDiv = '<a href="" class="deleteRow" rel="del"><i class="fa fa-minus w3-text-theme" ></i></a>' 
                                chdChaptr.find('td:eq(0)').append(dropdownDiv)                                     
                            }
                        }
                    } 
                }
            });
        }
        function newBookTable(book){
            let selector = document.getElementById("bookTabBody");
            selector.innerHTML = "";
            var firstrec = null;
            var j = book.length;
            for (var i=book.length - 1;i>=0;i--){var doc = book[i];if(doc[2]==1){j = i;break;}}
            for (var i=0;i<book.length;i++){
                var doc = book[i]
                
                const tr = document.createElement("tr");
                
                const td1 = document.createElement("td");
                td1.style.textAlign = "center";
                td1.style.width = "5px"; 
                
                const iele = document.createElement("i");
                iele.className = "checkmark w3-text-theme";
                iele.style.fontSize = "15px";
                iele.id = doc[0];

                //del icon for chapters with no hadiths
                const delIcon = document.createElement("a");
                delIcon.href = "";
                delIcon.className = "deleteRow";
                delIcon.setAttribute("rel", "del");
                const icon = document.createElement("i");
                icon.className = "fa fa-minus w3-text-theme";
                icon.style.fontSize = "15px";
                delIcon.appendChild(icon);
                //if there is no hadith minus button else checkbox
                if (doc[2] == 1) {
                    if(doc[3]){
                        td1.appendChild(iele); }}
                    else{td1.appendChild(delIcon);} 
                
                const td2 = document.createElement("td");
                td2.style.textAlign = "right";
                td2.style.whiteSpace ="wrap";
                td2.style.overflowY = "auto";
                td2.style.wordBreak = "break-all";
                td2.style.width = "150px";
                td2.style.maxWidth = "150px";
                
                if (doc[2] == 1 && firstrec == null){
                    if(btnFlag==0 && i==j){td2.style.backgroundColor ="rgb(24, 139, 240)";
                        td2.style.color = "white"; firstrec = doc;}
                    else if(btnFlag==1)
                        {td2.style.backgroundColor ="rgb(24, 139, 240)";
                        td2.style.color = "white"; firstrec = doc;
                    }
                }
                
                const hiddenInput = document.createElement("input");
                hiddenInput.type = "hidden";
                hiddenInput.id = "bookHidden";
                hiddenInput.name = "bookHidden";
                hiddenInput.value = doc[0];

                const p = document.createElement("p");
                
                const span = document.createElement("span")
                p.textContent = "("+doc[4]+") ";span.textContent=doc[1];

                p.appendChild(span)
                td2.appendChild(hiddenInput);
                td2.appendChild(p);

                const td3 = document.createElement("td");
                td3.style.textAlign = "left";
                td3.style.width="2px";
                td3.style.paddingLeftm = "2%";

                const anchorElement = document.createElement("a")
                anchorElement.setAttribute("href","");
                anchorElement.setAttribute("rel","edit");
                
                const editIcon = document.createElement("i");
                editIcon.className = "fa fa-edit w3-text-theme";
                editIcon.style.fontSize = "15px";
                
                anchorElement.appendChild(editIcon)
                td3.appendChild(anchorElement);

                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td3);

                selector.appendChild(tr);
                
            }
            var chdbooktd = $('#bookTabBody td').filter(function() {
                return $(this).css('background-color') == chkdBgColor;
            });
            updateBookName(chdbooktd.find('p').find('span'))
        }
        function newChapterTable(chap){
            let selector = document.getElementById("chapterTabBody");
            selector.innerHTML = "";
            var firstrec = null;
            var j = chap.length;
            for (var i=chap.length - 1;i>=0;i--){var doc = chap[i];if(doc[2]){if(doc[2]==1){j = i;break;}}else{if(doc["flag"]==1){j = i;break;}}}
            for (var i=0;i<chap.length;i++){
                var doc = chap[i]
                const tr = document.createElement("tr");
                
                const td1 = document.createElement("td");
                td1.style.textAlign = "center";
                td1.style.width = "5px"; 
                
                const iele = document.createElement("i");
                iele.className = "checkmark w3-text-theme";
                iele.style.fontSize = "15px";
                iele.id = doc[0];

                //del icon for chapters with no hadiths
                const delIcon = document.createElement("a");
                delIcon.href = "";
                delIcon.className = "deleteRow";
                delIcon.setAttribute("rel", "del");
                const icon = document.createElement("i");
                icon.className = "fa fa-minus w3-text-theme";
                icon.style.fontSize = "15px";
                delIcon.appendChild(icon);
                //if there is no hadith minus button else checkbox
                if(doc[2]){if(doc[2] == 1){if(doc[3]){td1.appendChild(iele);}}else{td1.appendChild(delIcon);}}else{if(doc["flag"] == 1){if(doc["save_flag"]){td1.appendChild(iele);}}else{td1.appendChild(delIcon);}}
                
                const td2 = document.createElement("td");
                td2.style.textAlign = "right";
                td2.style.whiteSpace ="wrap";
                td2.style.overflowY = "auto";
                td2.style.wordBreak = "break-all";
                td2.style.width = "150px";
                td2.style.maxWidth = "150px";
                if(doc[2]){if (doc[2] == 1 && firstrec == null){if(btnFlag==0 && i==j){
                td2.style.backgroundColor = "rgb(24, 139, 240)";
                td2.style.color ="white";firstrec = doc;}else if(btnFlag==1){td2.style.backgroundColor = "rgb(24, 139, 240)";td2.style.color ="white";firstrec = doc;}}}
                else{if (doc["flag"] == 1 && firstrec == null) {if(btnFlag==0 && i==j){td2.style.backgroundColor = "rgb(24, 139, 240)";
                td2.style.color ="white"; firstrec = doc;}else if(btnFlag==1){td2.style.backgroundColor = "rgb(24, 139, 240)";
                td2.style.color ="white"; firstrec = doc;}}}
                
                const hiddenInput = document.createElement("input");
                hiddenInput.type = "hidden";
                hiddenInput.id = "chapter";
                hiddenInput.name = "chapter";
                if(doc[0]){hiddenInput.value = doc[0];}else{hiddenInput.value = doc["_id"];}
                

                const p = document.createElement("p");
                const span = document.createElement("span")
                if(doc[1]){p.textContent = "("+doc[4]+")";span.textContent=doc[1]}else{p.textContent = "("+doc["chapterno"]+")";span.textContent=doc["arChapter"];}

                td2.appendChild(hiddenInput);
                p.appendChild(span)
                td2.appendChild(p);

                const td3 = document.createElement("td");
                td3.style.textAlign = "left";
                td3.style.width ="2px";
                td3.style.paddingLeft="2%";

                const anchorElement = document.createElement("a")
                anchorElement.setAttribute("href","");
                anchorElement.setAttribute("rel","edit");
                
                const editIcon = document.createElement("i");
                editIcon.className = "fa fa-edit w3-text-theme";
                editIcon.style.fontSize = "15px";
                
                anchorElement.appendChild(editIcon)
                td3.appendChild(anchorElement);

                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td3);

                selector.appendChild(tr);
                
            }
        }

        function newHadithTable(hadith){
            let hadbody = document.getElementById("hadTabbody");
            hadbody.innerHTML = "";
            for (var i=0;i<hadith.length;i++){
                var doc = hadith[i]
                $('#hadeeth > tbody:last-child').append('<tr><td style="border: 1px solid black;border-collapse: collapse;" ><input type="hidden"  id="hadithid" name="hadithid" value="'+ 
                    doc['_id'] +'" /><p contenteditable="True">'+ doc["body_ar"]+'</p></td></tr>');
                var htmlString = '<tr><td style="text-align: center;">';
                if (doc['save_flag']) {htmlString += '<i class="checkmark w3-text-theme" style="font-size: 15px;"></i>';}
                else{htmlString += '<a href="" class="deleteRow" rel="del"><i class="fa fa-minus w3-text-theme" style="font-size:15px"></i></a>';}
                htmlString += '</td><td style="text-align: right;"><a href="" style="text-decoration: none;"><input type="hidden" id="hadithid_card" name="hadithid_card" value="' + 
                doc["_id"] + '" /><p> ('+doc["hadithno"]+')' + doc["body_ar"].slice(0, 100) + '...</p></a></td><td style="text-align: right; font-size:10px;"><a href="" rel="edit"><i class="fa fa-edit w3-text-theme" style="font-size:15px"></i></a></td></tr>';
                hadbody.innerHTML += htmlString                  
            }
            
        }

        
        /////key up function for chainComment to activate/deactivate Submit button
        $(function() {
            $("#chainComment").keyup(check_submit).each(function() {
                check_submit();
            });
  
        });
        
        /////key up function for hadeethComment to activate/deactivate Submit button
        $(function() {
            $("#hadeethComment").keyup(check_submit).each(function() {
                check_submit();
            });
        });
        
        /////function activate when hadeethComment lost focus
        $("#hadeethComment").blur(function(){
            if ($(this).val().trim().length == 0)
            {
                $(this).attr("placeholder", "ادخل ملاحضاتك حول متن الحديث");
            }
        });
        
        
       /////hadTabbody drag and drop function/////////////////////////////// 
        $("#hadTabbody").sortable({
            helper: 'clone',
            axis: 'y',
            start: function (event, ui) {
                ui.item.data('oldindex', ui.item.index());
                ui.item.data('content',ui.item.find('td:nth-child(2) p').text())
                ui.item.data('isSave','false')
                if(ui.item.find('td:nth-child(3) a').attr('rel') == "save"){ui.item.data('isSave','true')}
            },
            stop: function(event, ui) {
                if(ui.item.find('td:nth-child(2) input[type=hidden]').val().trim() =="" | ui.item.data('isSave')=='true')
                {
                    $(this).sortable('cancel');
                    if(ui.item.data('isSave')=='true'){ui.item.find('td:nth-child(2)').find('p').focus();}
                    else{ui.item.find('td:nth-child(2)').focus();}
                }
            },
            update: function (event, ui) {
                if(ui.item.data('isSave')=='false'){
                    var prevPosition = ui.item.data('oldindex');
                    var currPosition = ui.item.index()
                    let hadindex = Number(ui.item.data('content').match(/\((-?\d+)\)/)[1]);
                    if(prevPosition > currPosition){
                        let ind = currPosition - prevPosition
                        hadindex = hadindex + ind
                    }
                    var minPos = Math.min(prevPosition, currPosition)
                    var maxPos = Math.max(prevPosition, currPosition) + 1
                    $("#hadTabbody tr").slice(minPos, maxPos).each(function (index, element) {
                
                        if($(element).find('td:nth-child(2) input[name="hadithid"]').val() !="")
                        {
                           const pele = document.createElement('p');
                           const textContent = $(element).find('td:nth-child(2) p').text().replace(/\(\d+\)/, '')
                           pele.textContent = '(' + hadindex + ')' + textContent;
                           $(element).find('td:nth-child(2) p' ).remove()
                           $(element).find('td:nth-child(2)' ).append(pele);
                           hadindex = hadindex + 1 ;
                        }
                    });
                    
                    const newhadIndex = Number(ui.item.find('td:nth-child(2) p').text().match(/\((-?\d+)\)/)[1]);
                    const oldhadIndex = Number(ui.item.data('content').match(/\((-?\d+)\)/)[1]);
                    let [trList,tdList,idList] = getCheckedIds(['#collectionTabBody'])
                    const [selectedCollId] = idList
                    var hadData = {
                        'oldhadithno':oldhadIndex,
                        'hadithno':newhadIndex,
                        'collection': selectedCollId
                    };
                    $.ajax({url:"/updatehadno",
                        type:"POST",
                        contentType: 'application/json',
                        data:JSON.stringify(hadData),
                        success:function(result){
                            if(prevPosition > currPosition){
                                for (let ind = maxPos - 1; ind >= minPos; ind--) {
                                    let nind = ind - 1;
                                    if(nind>=minPos){swapRows(ind,nind)}
                                }
                            }
                            else{
                                for (let ind = minPos; ind < maxPos ; ind++) {
                                        let nind = ind + 1;
                                        if(nind<maxPos){swapRows(ind,nind)}
                                    }
                            }
                            rows = $("#hadeeth tbody tr");
                        }
                    });
                } 
            }
        }).disableSelection();

        function swapRows(ind,nind){
            var row1 = $("#hadeeth tbody tr").eq(ind).detach(true);
            var row2 = $("#hadeeth tbody tr").eq(nind).detach(true);
            $("#hadeeth tbody tr").eq(nind).after(row1)
            $("#hadeeth tbody tr").eq(ind).after(row2)
        }
    ////////////////////////////Next and previous button code///////////////////////////
        $('#nav').on('click', 'a', function () {
            clearemptyRows("");
            var currRow = $(this).attr('rel');
            $('#hadpopup1').hide(); 
            let matn = ""
            if(rows[currentIndex]){
                matn = rows[currentIndex].textContent;}
            let [trList,tdList,idList] = getCheckedIds(['#hadTabbody'])
            let [matnid] = idList;
            if (currRow == "nxtbtn") {
                
                nextRecord(matn,matnid)
                
            } 
            else if (currRow == "prevbtn") {
               
                prevRecord();
            }
            event.preventDefault();
            
        }).find('a.active').trigger('click');
        
    /////////////////nextRecord function//////////////////////////
        function nextRecord(matn,matnid){
            var lastcol = false;
            var rw ="";
            btnFlag = 1; //flag for nextbtn/ for prevbtn, btnFlag = 0
            const rlen = rows.length - 1;
            let exitFlag = false;
            if(currentIndex  == rlen){ //checking end of records in the selected chapter,if so moved to next chapter
                currentIndex = 0;}
            let checkedTabList = ['#chapterTabBody','#bookTabBody','#collectionTabBody','#hadTabbody'];
            let [trList,tdList,idList] = getCheckedIds(checkedTabList);
            let [ch, bk, cl, had] = idList;
            let [checkedtr, chdbooktr, chdcolltr, chdhadtr] = trList;
            let [checkedtd, chdbooktd, chdcolltd, chdhadtd] = tdList ;
            let nextCollIndex =  chdcolltr.index() + 1;
            let nextrowincoll = chdcolltr;
            while(nextCollIndex){
                if(chdcolltd.length>0){
                    if(chdbooktr.length>0){
                    let nextBookIndex =  chdbooktr.index() + 1;
                    let nextrowinbook = chdbooktr;
                    while(nextBookIndex){
                        if(chdbooktd.length>0){
                            if(checkedtr.length>0){
                                
                            let nextChapIndex =  checkedtr.index() + 1;
                            let nextrowinchap = checkedtr;
                            while(nextChapIndex){
                                if(checkedtd.length>0){
                                    let nextHadIndex =  chdhadtr.index() + 1;
                                    let nextrowinhad = chdhadtr;
                                    while(nextHadIndex){
                                        if(chdhadtd.length>0){
                                            submitForm(matn,matnid,ch);
                                        }
                                        nextrowinhad = nextrowinhad.next();
                                        nextHadIndex = nextrowinhad.index() + 1;
                                        if(nextHadIndex) {
                                            var hadnum = Number(chdhadtd.find('p').text().match(/\((-?\d+)\)/)[1])
                                            chdhadtd.find('p').text("("+hadnum+")"+matn.trim().slice(0,100)+ "...")
                                            currentIndex = (currentIndex + 1) % rows.length;
                                            clear_hadithDetails();
                                            showCurrentRow();
                                            exitFlag = true;
                                            break;
                                        } 
                                    }
                                }
                                if(exitFlag) break; else{
                                    nextrowinchap = nextrowinchap.next();
                                    nextChapIndex = nextrowinchap.index() + 1;
                                    if(nextChapIndex) {
                                        var nextRowCheckbox = nextrowinchap.find('.deleteRow');
                                        if(nextRowCheckbox.length == 0){
                                            nextrowinchap.find('td>p').trigger('click');
                                            $('#chDiv').animate({ scrollTop:  $(nextrowinchap).position().top  }, 500);
                                                
                                            $('#nav a[rel="prevbtn"]').removeClass('w3-disabled');
                                            exitFlag = true;
                                            break;
                                        }
                                    }
                                }
                            }
                            
                            }
                        }
                        if(exitFlag) break; else{
                            nextrowinbook = nextrowinbook.next();
                            nextBookIndex = nextrowinbook.index() + 1;
                            if(nextBookIndex){
                                var nextRowbkchk = nextrowinbook.find('.deleteRow');
                                if(nextRowbkchk.length == 0){
                                    nextrowinbook.find('td>p').trigger('click');
                                    var chaptd = $('#chapterTabBody td').filter(function() {
                                        return $(this).css('background-color') == chkdBgColor;
                                    });
                                    if(chaptd.length>0){
                                        exitFlag = true;
                                        break;
                                    }
                                    
                                }
                            }
                        }
                    }
                }
                else{lastcol = true;}
                }
                if(exitFlag) 
                {
                    break; 
                }
                else{
                    nextrowincoll = nextrowincoll.next();
                    nextCollIndex = nextrowincoll.index() + 1;
                    if(nextCollIndex){
                        const nextRowcollchk = nextrowincoll.find('.deleteRow');   
                        if(nextRowcollchk.length == 0){
                            nextrowincoll.find('td>p').trigger('click');
                            var bktd = $('#bookTabBody td').filter(function() {
                                return $(this).css('background-color') == chkdBgColor;
                            });
                            var chtd = $('#chapterTabBody td').filter(function() {
                                return $(this).css('background-color') == chkdBgColor;
                            });
                            if(bktd.length>0)
                            { 
                                if(chtd.length>0){
                                    exitFlag = true;
                                    break;
                                }
                                else{
                                    $('#nav a[rel="nxtbtn"]').trigger('click')
                                    exitFlag = true;
                                }
                            }
                        }
                    }
                    else{
                        $('#nav a[rel="nxtbtn"]').addClass('w3-disabled');$('#nav a[rel="prevbtn"]').removeClass('w3-disabled');
                        currentIndex = rlen
                        clear_hadithDetails() 
                        hadeethTabClick(matnid)
                        
                    }
                }
                if(exitFlag) break;
            }
        }
        
        function prevRecord(){
            btnFlag = 0;
            let checkedtd = $('#chapterTabBody td').filter(function() {
                return $(this).css('background-color') == chkdBgColor;
            });
            let chdbooktd = $('#bookTabBody td').filter(function() {
                return $(this).css('background-color') == chkdBgColor;
            });
            let chdcolltd = $('#collectionTabBody td').filter(function() {
                return $(this).css('background-color') == chkdBgColor;
            });
            if(currentIndex  == 0){ //checking end of records in the selected chapter,if so moved to next chapter
                let chkLength = checkedtd.length;
                if (chkLength > 0) { 
                    var prevrowinchapter = $(checkedtd).closest('tr').prev();
                    var prevIndex = $(prevrowinchapter).index() + 1;
                    
                    while (prevIndex) {
                        var prevRowCheckbox = prevrowinchapter.find('.deleteRow');
                        if(prevRowCheckbox.length == 0){
                            
                                prevrowinchapter.find('td>p').trigger('click');
                                $('#chDiv').animate({ scrollTop:  $(prevrowinchapter).position().top  }, 500);
                                //$('#chDiv').animate({ scrollTop:  prevrowinchapter.find('td>p').position().top  }, 500);
                                $('#nav a[rel="prevbtn"]').removeClass('w3-disabled');
                                break;
                            }
                        prevrowinchapter  = prevrowinchapter.prev();
                        prevIndex = $(prevrowinchapter).index() + 1;
                            
                    }
                    if(!prevIndex){
                            $('#nav a[rel="nxtbtn"]').removeClass('w3-disabled');
                            var prevrowinbook = $(chdbooktd).closest('tr').prev();
                            var prevBookIndex = $(prevrowinbook).index() + 1;
                            
                            while (prevBookIndex) {
                                const prevRowbookchk = prevrowinbook.find('.deleteRow');    
                                if(prevRowbookchk.length == 0){
                                    
                                    prevrowinbook.find('td>p').trigger('click');
                                    var chaptd = $('#chapterTabBody td').filter(function() {
                                        return $(this).css('background-color') == chkdBgColor;
                                    });
                                    if(chaptd.length>0){
                                    $('#nav a[rel="prevbtn"]').removeClass('w3-disabled');
                                    break;
                                    }
                                } 
                                prevrowinbook  = prevrowinbook.prev();
                                prevBookIndex = $(prevrowinbook).index() + 1;
                            }
                            if(!prevBookIndex){
                                $('#nav a[rel="prevbtn"]').removeClass('w3-disabled');
                                var prevrowincoll = $(chdcolltd).closest('tr').prev();
                                var prevCollIndex = $(prevrowincoll).index() + 1;
                                
                                while (prevCollIndex){
                                    
                                    const prevRowcollchk = prevrowincoll.find('.deleteRow');    
                                    
                                    if(prevRowcollchk.length == 0){
                                        btnFlag = 0;
                                        prevrowincoll.find('td>p').trigger('click');
                                        var bktd = $('#bookTabBody td').filter(function() {
                                            return $(this).css('background-color') == chkdBgColor;
                                        });
                                        if(bktd.length>0){
                                            break;
                                        }
                                    }
                                    prevrowincoll  = prevrowincoll.prev()
                                    prevCollIndex = $(prevrowincoll).index() + 1;
                                    btnFlag = 1;
                                }
                                
                                if(!prevrowincoll){$('#nav a[rel="prevbtn"]').addClass('w3-disabled');$('#nav a[rel="nxtbtn"]').removeClass('w3-disabled');}
                                
                            }
                        }
                        
                    }
                }
                else{ //next hadith in the current selected chapter
                    clear_hadithDetails();
                    currentIndex = (currentIndex - 1 + rows.length) % rows.length;
                    
                    showCurrentRow();
                    
                }
            
                
              
            
        }
        function clearemptyRows(btn){
            var buttons = ['#addCollection','#addBook','#addTDKetab','#addTD']
            buttons.forEach(function(btns){
                if(btns != btn){
                    if($(btns).hasClass("fa-times")) $(btns).click();
                }
            });
        }
        /////////////////////Save data to db/////////////////// 
        ////Submit button
        function submitForm(matn,matnid,chid){
            
            var saveflag = false;
            if($('#hadeethComment').val().trim()!="" || $('#chainComment').val().trim()!=""){saveflag=true}
            
            var chdcolltd = $('#collectionTabBody td').filter(function() {
                return $(this).css('background-color') == chkdBgColor;
            });const collchkbox = chdcolltd.find('input[type=hidden][name=collection]').val();
            
            var chdbooktd = $('#bookTabBody td').filter(function() {
                return $(this).css('background-color') == chkdBgColor;
            });const bkchkbox = chdbooktd.find('input[type=hidden][name=bookHidden]').val();
            //get the moallakka list
            var mlist = {};
            if($('#chkMoallaka').is(':checked')) {
                var tableCount = $('table[id^="tableMoalList"]').length;
                for (var i=1;i<=tableCount;i++){
                    var selectCount = $('#tableMoalList'+i+ ' select').length;
                    mlist['subList' + i] = [];
                    var subLists = []
                    input_name = 'input_text1'+i 
                    $('select[name="'+input_name+'"]').each(function() {
                        subLists.push($(this).val());
                    });
                    mlist['subList' + i].push(subLists); 
                }
            }
            //get the sanad list
            var slist = new Array();
            
            if (isBtnSanadClicked){
                $('[name=input_text2]').each(function() {
                    if($(this).val()!="0"){
                        slist.push($(this).val())
                    }
                });
                
            }
            //get keywordlist
            var keylist= new Array();
            
            $('[name=input_key]').each(function() {
                    if($(this).val()!="0"){
                        keylist.push($(this).val())
                    }
                });
            

            var formData = {
                'coll_id': collchkbox,
                'book_id': bkchkbox,
                'chapter_id': chid,
                'hadith_id': matnid,
                'hadeethCmnt' : $('#hadeethComment').val().trim(),
                'chainComment' : $('#chainComment').val().trim(),
                'sanadList' : slist,
                'moallakaList' : mlist,
                'matn': matn.trim(),
                'save_flag' : saveflag,
                'keywords': keylist,
                'sanadFlag':isBtnSanadClicked
                
            };
            
        // send a POST request to the Flask server with the form data
             $.ajax({
                url: '/submit',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(formData),
                success: function(response) {
                        var coll_data={collection:collchkbox,book:bkchkbox,chapter:chid};
                        $.ajax({url:"/gethadithinfo",
                        type:"POST",
                        contentType: 'application/json',
                        data:JSON.stringify(coll_data),
                        success:function(result){
                            var data = result.hadith;
                            var book = result.book
                            let chapter = result.chap;
                            var collection = result.collection;
                            
                            const hadtr = $('#hadTabbody tr').filter(function() {
                                return $(this).find('input[type=hidden][name=hadithid_card]').val() ==matnid;
                            });
                            const hadtd = hadtr.find('td:eq(0)');
                            for (var i=0;i<data.length;i++){
                                var doc = data[i];
                                if(doc['_id'] == matnid){
                                    if(doc['save_flag']==true){
                                        if(hadtd.find('.checkmark').length==0){
                                            const iele1 = document.createElement("i");
                                            iele1.className = "checkmark w3-text-theme";
                                            iele1.style.fontSize = "15px";
                                            iele1.id = matnid;if(hadtd.find('.deleteRow').length>0){hadtd.find('.deleteRow').remove()}
                                            hadtr.find('td:eq(0)').append(iele1);}}
                                    else{if(hadtd.find('.checkmark').length>0){hadtd.find('.checkmark').remove()}}
                                }
                            }
                            const chtr = $('#chapterTabBody tr').filter(function() {
                                return $(this).find('input[type=hidden][name=chapter]').val() == chid;
                            });
                            const chtd = chtr.find('td:eq(0)');
                            
                            for (var i=0;i<chapter.length;i++){
                                var doc = chapter[i]
                                
                                if(doc[0] == chid){
                                    if(doc[3] == true ){if(chtd.find('.checkmark').length==0){
                                        const iele2 = document.createElement("i");
                                        iele2.className = "checkmark w3-text-theme";
                                        iele2.style.fontSize = "15px";
                                        iele2.id = chid;
                                        chtd.append(iele2);}}
                                    else{
                                        if(chtd.find('.checkmark').length>0){chtd.find('.checkmark').remove()}
                                    }
                                }
                            }
                            const bktr = $('#bookTabBody tr').filter(function() {
                                return $(this).find('input[type=hidden][name=bookHidden]').val() == bkchkbox;
                            });
                            const bktd = bktr.find('td:eq(0)');
                            for (var i=0;i<book.length;i++){
                                var doc = book[i];
                                if(doc[0] == bkchkbox){
                                    if(doc[3] == true ){if(bktd.find('.checkmark').length==0){
                                        const iele3 = document.createElement("i");
                                        iele3.className = "checkmark w3-text-theme";
                                        iele3.style.fontSize = "15px";
                                        iele3.id = bkchkbox;
                                        bktd.append(iele3);}}
                                    else{
                                        if(bktd.find('.checkmark').length>0){bktd.find('.checkmark').remove()}
                                    }
                                }
                            }
                            const colltr = $('#collectionTabBody tr').filter(function() {
                                return $(this).find('input[type=hidden][name=collection]').val() == collchkbox;
                            });
                            const colltd = colltr.find('td:eq(0)');
                            for (var i=0;i<collection.length;i++){
                                var doc = collection[i];
                                if(doc[0] == collchkbox){
                                    if(doc[3] == true ){if(colltd.find('.checkmark').length==0){
                                        const iele = document.createElement("i");
                                        iele.className = "checkmark w3-text-theme";
                                        iele.style.fontSize = "15px";
                                        iele.id = collchkbox;
                                        colltd.append(iele);}}
                                    else{
                                        if(colltd.find('.checkmark').length>0){colltd.find('.checkmark').remove()}
                                    }
                                }
                            }
                        },   
                        error: function(error) {
                            console.log(error);
                            
                        }
                    
                    });
                },
                error: function(error) {
                    console.log(error);
                    
                }
            }); 
              
        }
///////////////////EOC//////////////////////////////////


        showCurrentRow(); // function call to show one hadith on the pagination table

        // Function to show the current row and hide the others on the pagination table
        function showCurrentRow(id) {
            for (var i = 0; i < rows.length; i++) {
                const input = rows[i].querySelector('input[type="hidden"]');
                if(id!="" && input.value==id){currentIndex = i;}
                
                if (i == currentIndex) {
                    
                    rows[i].style.display = "table-row";
                    //alert(rows[i].querySelector('td p'))//.style.width = '100%'
                    
                    hadrows = $("#hadTabbody tr");
                    for (var j = 0; j < hadrows.length; j++) {
                        const hadinput = hadrows[j].querySelector('input[type="hidden"]');
                        const col = hadrows[j].querySelector('td:nth-child(2)');
                        if(input.value == hadinput.value){
                            var ahatab = $('#AhadithTable').parent('div')
                            $(ahatab).animate({ scrollTop:  $(hadinput).closest('td').position().top -75 }, 500);
                            //const bkscroll = $('input[type=checkbox][name=book]:checked');
                            var chdbooktd = $('#bookTabBody td').filter(function() {
                                return $(this).css('background-color') == chkdBgColor;
                            });
                            if (chdbooktd.length > 0) {
                            $('#bkDiv').animate({ scrollTop:  chdbooktd.position().top   }, 500);}
                            col.style.backgroundColor = 'rgb(24, 139, 240)';
                            col.style.color = 'white';
                        }else{col.style.backgroundColor = '';col.style.color = '';}
                    }
                    
                    hadeethTabClick(input.value)
                } else {
                    rows[i].style.display = "none";
                }
                if(currentIndex==0){
                    $('#nav a[rel="prevbtn"]').removeClass('w3-disabled');
                    $('#nav a[rel="nxtbtn"]').removeClass('w3-disabled');
                }
                else{
                    $('#nav a[rel="prevbtn"]').removeClass('w3-disabled');
                    $('#nav a[rel="nxtbtn"]').removeClass('w3-disabled');
                }
            }
            
        }
        
        ////////////////////////EONext and previous button code including pagination////////////////////////

        

        /////function activate when chainComment lost focus
        $("#chainComment").blur(function(){
            
            if ($(this).val().trim().length == 0)
            {
                $("#chainComment").attr("placeholder","ادخل ملاحضاتك حول سند الحديث");
            }
        });
        
        ///function for activate/deactivate Submit button
        function check_submit() {
            
           if($(this).attr('id')!=undefined){
                var val="";
                if($(this).attr('id')=="hadeethComment"){
                    val = $('#chainComment').val().trim();
                }
                else{
                    val = $('#hadeethComment').val().trim();
                }
                if (($(this).val().trim().length == 0) && (val.length == 0)) {
                    //$('#Submit_button').prop('disabled', true);
                    //$('#Submit_button').removeClass('sbtbtn active');
                    $('#Submit_button').addClass('sbtbtn active');
                } else {
                    $('#Submit_button').prop('disabled', false);
                    $('#Submit_button').addClass('sbtbtn active');
                }
            }
        }
        /////Adding Keywords ----> chKey change when checked display block
        $('#chKey').click(function() {
            isBtnKeyClicked = !isBtnKeyClicked; // Toggle the click state
            if (isBtnKeyClicked) {
                $("#addKeyTable").css('display','block');
            }
            else{
                $("#addKeyTable").css('display','none');
                $("#tableKeyList").find("td").each(function(){
                    id = $(this).attr('id');
                    //$(this).remove();
                }) 
            }     
        });
        $("#btnKey").click(function(){
            var clickedIndex = $(this).closest('td').index();
            flag=0
             // Check if any existing input field is empty
            $("#btnDivKey").find("input[type='text']").each(function() {
                if ($(this).val().trim() === '') {
                    flag = 1;
                    return false; // Exit the loop if an empty input is found
                }
            });
            if(flag === 0)
            {
                com=$('<input type="text" name="input_key" data-max-height="200px" style="width: 150px">')
                var tr=$("#tableKeyList tr:last");
                var table = $("#addKeyTable").width()-300;
                var tdwidth=tr.find('td:nth-last-child(2)').width();
                sumwidth = sumwidth + tdwidth
                if (sumwidth <= table)
                {
                    var td = $('<td ></td>')
                    td.append(com)
                    var targetTd = tr.find('td').eq(clickedIndex);
                    if (targetTd.length > 0) {
                        targetTd.before(td);
                    } else {
                        tr.append(td);
                    }
                }
                else
                {

                    var newRow = $('<tr><td></td></tr>');
                    newRow.find('td').append(com);
                    newRow.append($('<td></td>').append($("#btnKey").clone()));
                    // Remove the button from the previous row
                    tr.find('td:last').remove();
                    tr.after(newRow);
                    sumwidth = 0;

                  
                }
                
            }


        });
        $("#tableKeyList").on('click','#btnKey', function() {
            var clickedIndex = $(this).closest('td').index();
            flag=0
             // Check if any existing input field is empty
            $("#btnDivKey").find("input[type='text']").each(function() {
                if ($(this).val().trim() === '') {
                    flag = 1;
                    return false; // Exit the loop if an empty input is found
                }
            });
            if(flag === 0)
            {
                var com = $('<div style="position: relative;"></div>'); // Wrap in a container for relative positioning
                var inputKey = $('<input type="text" name="input_key" data-max-height="200px" style="width: 150px">');
                var close = $('<a href="" rel="close"><i class="fa fa-times-circle" style="font-size:15px; color:red; position: absolute; top: -10px; right: -5px;"></i></a>');
                com.append(inputKey);
                com.append(close);
                
                var tr=$("#tableKeyList tr:last");
                var table = $("#addKeyTable").width()-300;
                var tdwidth=tr.find('td:nth-last-child(2)').width();
                sumwidth = sumwidth + tdwidth;
                if (sumwidth <= table)
                {
                    var td = $('<td ></td>');
                    td.append(com);
                    //td.append(close);
                    var targetTd = tr.find('td').eq(clickedIndex);
                    if (targetTd.length > 0) {
                        targetTd.before(td);
                    } else {
                        tr.append(td);
                    }
                }
                else
                {

                    var newRow = $('<tr><td></td></tr>');
                    newRow.find('td').append(com);
                    newRow.append($('<td></td>').append($("#btnKey").clone()));
                    // Remove the button from the previous row
                    tr.find('td:last').remove();
                    tr.after(newRow);
                    sumwidth = 0;

                  
                }
                
            }


        });
        $('#tableKeyList').on('click', 'a[rel="close"]', function (event) {
            event.preventDefault();
            var clickedClose = $(this);
            var tdToRemove = clickedClose.closest('td');
            var tr = tdToRemove.closest('tr');
            var table = $("#addKeyTable").width() - 300;

            // Remove the clicked td
            tdToRemove.remove();

            // Reorganize the remaining tds in the row
            var tds = tr.find('td');
            var sumwidth = 0;

            tds.each(function (index, td) {
                sumwidth += $(td).width();

                // Check if the remaining tds fit within the table width
                if (sumwidth <= table) {
                    // Append the td to the row
                    tr.append(td);
                } else {
                    // Create a new row and append the td to it
                    var newRow = $('<tr><td></td></tr>');
                    newRow.find('td').append(td);
                    tr.after(newRow);
                    sumwidth = $(td).width(); // Reset sumwidth for the new row
                }
            });
        });
       /////Adding Sanad --->chkSanad button when clicked display table sanadlist for editting or adding
        
        $('#chkSanad').click(function() {
            isBtnSanadClicked = !isBtnSanadClicked; // Toggle the click state
            if (isBtnSanadClicked) {
                $("#addSanadTable").css('display','');
                $("#tableSanadList").find("td").each(function(){
                    var selWidth = $(this).find('span').find('.selection').width();
                    var comboWidth = $(this).find('span').width();
                    $(this).find('i').css('margin-right', (selWidth - comboWidth)+ 10);
                })
            }
            else{
                $("#addSanadTable").css('display','none');
                $("#tableSanadList").find("td").each(function(){
                    id = $(this).attr('id');
                    
                }) 
            }     
        });
        
        
        
        $("#tableSanadList").on('click','#btnSanad', function() {
            var clickedIndex = $(this).closest('td').index();
            flag=0
            $("#btnDivSanad").find("select").each(function(){
                if($(this).val()==0){
                    flag = 1;
                }
            })
            if(flag == 0)
            {
                
                com = getNarratorListtoCombobox("Sanadlist",0,0)
                var tr = $(this).closest('tr');
                var td = $('<td></td>')
                td.append(com)
                com.select2({
                }).on('change',function (){
                    //adjustIconMargin($(this));
                    $(this).closest('td').find('span').css('width', $(this).closest('td').width());
                    $(this).closest('td').find('i').css('margin-right', 10);
                }).on('select2:open',function(){
                    $('.select2-container--above').attr('id','fix');
                    $('#fix').removeClass('select2-container--above').addClass('select2-container--below');
                
                });
                //td.append('<button type="button" id="btnSanad" class="fa fa-plus" ></button>')
                td.append('<i id="btnSanad" class="fa fa-plus-circle w3-text-theme" ></i>')
                var targetTd = tr.find('td').eq(clickedIndex);
                if (targetTd.length > 0) {
                    targetTd.after(td);
                } else {
                    tr.append(td);
                }
                //adjustIconMargin(com);
            }

        });
        // Function to adjust the position of the icon element
        function adjustIconMargin(combo){
            $("#tableSanadList").find("td").each(function(){
                var selWidth = $(this).find('span').find('.selection').width();
                var comboWidth = $(this).find('span').width();
                $(this).find('i').css('margin-right', (selWidth - comboWidth)+ 10);
            })
        }
        //function to fill dynamically created combo for adding new node to the Sanad  and Moallakka
        function getNarratorListtoCombobox(listname,count,sel_narr_id){
            var combo;
            if(listname == "Sanadlist"){
                combo = $('<select data-search="true" name="input_text2" data-max-height="200px" style="width: 150px;max-width: 150px"><option value="0">...اختر الراوي</option></select>')
            }
            else if(listname == "Moallist"){
                combo = $('<select data-search="true" name= "input_text1'+count+'" data-max-height="200px" style="width: 150px;" ><option value="0">...اختر الراوي</option></select>');
            }
            for(var n=0;n<narrator_list.length;n++){
                var doc = narrator_list[n]
                var option = new Option(doc['narrator_ar'], doc['_id']);
                if(sel_narr_id == doc['_id']){
                    option.selected = true;
                    
                } 
                combo.append(option).trigger('change');
                
            } 
            return combo;
        }
        //Add Moallakka + button click
        $(document).on('click','#btnAddAuth',function(){
            $td=$(this).closest('td');
            cnt = $td.attr('id');
            com = getNarratorListtoCombobox("Moallist",cnt,0)
            $('#tableMoalList'+cnt+'> tbody tr:last-child').append('<td></td>')
            $("#tableMoalList"+cnt+"> tbody tr td:last-child").append(com)
            com.select2({
            }).on('change',function (){
                $(this).closest('td').find('span').css('width', $(this).closest('td').width());
                
            }).on('select2:open',function(){
                $('.select2-container--above').attr('id','fix');
                $('#fix').removeClass('select2-container--above').addClass('select2-container--below');
            });
        });
        //button click to display the narrator combo and + button for adding moallaka
        $("#btnAddChain").on('click',function() {
            com = getNarratorListtoCombobox("Moallist",moal_count,0)
            
            $('#addMoalaTable > tbody:last-child').append('<tr><td id="'+moal_count+'" ><div id="btnDivMoallakka'+moal_count+
            '"></div><i id="btnAddAuth" class="fa fa-plus-circle w3-text-theme" ></i></td></tr>'); 
            $("#btnDivMoallakka"+moal_count).append('<table id="tableMoalList'+moal_count+'"><tr><td></td></tr></table>')
            $("#tableMoalList"+moal_count+"> tbody tr td:last-child").append(com)
            
            com.select2({
            }).on('change',function (){
                //adjustIconMargin($(this));
                $(this).closest('td').find('span').css('width', $(this).closest('td').width());
            }).on('select2:open',function(){

                $('.select2-container--above').attr('id','fix');
                $('#fix').removeClass('select2-container--above').addClass('select2-container--below');
    
            });
            moal_count = moal_count+1
        });

        ///////////Adding Moallakka --->chkMoallaka change when checked display the btnAddChain button
        $('#chkMoallaka').change(function() {
            if(this.checked) {
                moal_count = 1
                $("#addMoalaTable").css('display','block');
                for (var i= 0 ;i<moallaka_list.length;i++){
                    var doc = moallaka_list[i]
                    $('#addMoalaTable > tbody:last-child').append('<tr><td id="'+moal_count+'"><div id="btnDivMoallakka'+moal_count+'"></div><i id="btnAddAuth" class="fa fa-plus-circle w3-text-theme" ></i></td></tr>');
                    $("#btnDivMoallakka"+moal_count).append('<table id="tableMoalList'+moal_count+'"><tr></tr></table>')

                    for(var d = 0;d<doc.length;d++){
                        var data = doc[d];
                        com = getNarratorListtoCombobox("Moallist",moal_count,data[0])
                        $('#tableMoalList'+moal_count+'> tbody tr:last-child').append('<td></td>')
                        $("#tableMoalList"+moal_count+"> tbody tr td:last-child").append(com)
                        
                        com.select2({
                        }).on('change',function (){
                            //adjustIconMargin($(this));
                            
                            //$(this).find('span .select2').find('span .selection').css('width', $(this).closest('td').width());
                        }).on('select2:open',function(){
        
                            $('.select2-container--above').attr('id','fix');
                            $('#fix').removeClass('select2-container--above').addClass('select2-container--below');
                
                        });
                    }
                    $("#tableMoalList"+moal_count+"").find("td").each(function(){
                        if($(this).find('span').find('.select2-selection').width()> 150)  $(this).find('span').css('width', $(this).width() + 50);
                    })
                    moal_count = moal_count + 1
                    $('#moalaTable > tbody:last-child').append('<tr></tr>')
                } 
                
            }
            else{
                moal_count = 1
                $("#addMoalaTable").css('display','none');
                $("#addMoalaTable").find("div").each(function(){
                    id = $(this).attr('id');
                    $(this).closest("tr").remove();
                })
            }     
        });
      
        $(document).on('click','span[contenteditable=true]', function(){
            $(this).focus();
        });

        $(document).on('click','td[contenteditable=true]', function(){
            $(this).focus();
        });

// Function to show the popup window for Narrators details
        function showPopup() {
            $('.popup-overlay').show();
        }
        // Function to hide the popup window
        function hidePopup() {
            $('.popup-overlay').hide();
            
        }
        // Function for the close button click
        $('.close').click(function() {
            hidePopup();
        });
        function updateCollectionTable(){
            $.ajax({url:"/getcollection",
                type:"POST",
                contentType: 'application/json',
                //data:JSON.stringify(coll_data),
                success:function(result){
                    let selector = document.getElementById("collectionTabBody");
                    collection = result.collection;
                    
                for (var i=0;i<collection.length;i++){
                    var doc = collection[i]
                    if(doc["flag"] == 0)
                    {
                        var chdColltr = $('#collectionTabBody tr').filter(function() {
                        return $(this).find('input[type=hidden][name=collection]').val() == doc["_id"] & $(this).find('.deleteRow').length==0;
                        });
                        if(chdColltr.find('td:eq(1)').css('background-color')!=chkdBgColor){
                            const dropdownDiv = '<a href="" class="deleteRow" rel="del"><i class="fa fa-minus w3-text-theme" style="font-size:15px"></i></a>' 
                            chdColltr.find('td:eq(0)').append(dropdownDiv)                                     
                        }
                        
                    }
                }
            }});
            
            
        }
////////////////////////////////////EOC/////////////////////////////
////////////////////////////////////////////////////////////////////
////////keypress events///////////////////
        $("#collectionTabBody").on('keydown','td', function(e) {
            if(e.which == 13) $('#collectionTabBody a[rel="save"]').click();
            if(e.which == 27) {
                if($('#addCollection').hasClass('fa-times')){
                    $('#addCollection').click();
                }else{
                $('#collectionTabBody a[rel="cancel"]').click();}
            }
        });
        $("#bookTabBody").on('keydown','td', function(e) {
            if(e.which == 13) $('#bookTabBody a[rel="save"]').click();
            if(e.which == 27) {
                if($('#addBook').hasClass('fa-times')){
                    $('#addBook').click();
                }else{
                $('#bookTabBody a[rel="cancel"]').click();}
            }
        });
        $("#chapterTabBody").on('keydown','td', function(e) {
            if(e.which == 13) $('#chapterTabBody a[rel="save"]').click();
            if(e.which == 27) {
                if($('#addTDKetab').hasClass('fa-times')){
                    $('#addTDKetab').click();
                }else{
                $('#chapterTabBody a[rel="cancel"]').click();}
            }
        });
        $("#hadTabbody").on('keydown','td', function(e) {
            if(e.which == 13) $('#hadTabbody a[rel="save"]').click();
            if(e.which == 27) {
                if($('#addTD').hasClass('fa-times')){
                $('#addTD').click();}
            }
        });
 /////////////////////////////collectionTabBody td<p> click////////////////////////////////       
        $("#collectionTabBody").on('click','td>p', function() {
            if($(this).closest('td').css('background-color') != chkdBgColor){
                var hidval = $('#collectionTabBody tr').filter(function() {
                return $(this).find('input[type="hidden"]').val() == "";});
                let hidvallength = hidval.length;
                if($(this).closest('tr').find('td:eq(2)').find('a').attr('rel') == "save"){hidvallength = 1;}
                if(hidvallength == 0){
                    const alltd = $('#collectionTabBody tr').find('td.w3-edittd');
                    cancelEdit(alltd,tdCollContent)
                    
                    const hiddenInputValue = $(this).closest('td').find('input[type="hidden"]').val();
                    
                    $("#collectionTabBody td").css({backgroundColor: '',color: ''});
                    
                    
                    updateCollName($(this).find('span'));
                    let delrow = $(this).closest('tr').find('.deleteRow')
                    if(delrow.length>0){delrow.remove();}    
                    clear_hadithDetails();
                    $('#hadeeth tbody').empty();
                    $('#hadTabbody').empty();
                    $('#bookTabBody').empty();
                    $('#chapterTabBody').empty();// third card
                    $('#hadpopup1').hide();
                    hidePopup()
                    $(this).closest('td').css('backgroundColor', 'rgb(24, 139, 240)');
                    $(this).closest('td').css('color', 'white');
                    updateCollectionTable();
                    
                    var coll_data={collection:hiddenInputValue,book:"",chapter:""};
                    $.ajax({url:"/gethadithinfo",
                        type:"POST",
                        contentType: 'application/json',
                        data:JSON.stringify(coll_data),
                        async:false,
                        success:function(result){
                            var book = result.book; //fill the third card in html
                            newBookTable(book);
                            var chdBooktd = $('#bookTabBody td').filter(function() {
                                return $(this).css('background-color') == chkdBgColor;
                                });
                            if(btnFlag == 0){
                                var chdBooktd = $('#bookTabBody td').filter(function() {
                                return $(this).css('background-color') == chkdBgColor;
                                });
                                const bkchk = chdBooktd.find('p');
                                $(bkchk).trigger('click');
                            }
                            else{
                                var chap = result.chap;
                                newChapterTable(chap);
                                var hadith = result.hadith //fill the first and third cards in html
                                newHadithTable(hadith);
                                rows = $("#hadeeth tbody tr");
                                if(btnFlag == 1){currentIndex = 0;}
                                else if(btnFlag == 0){currentIndex = rows.length - 1;}
                                
                                showCurrentRow() 
                            }
                            
                            if(book.length==0){ 
                                $("#addTDKetab").css("pointer-events", "none");
                                $("#addTDKetab").css("color", "gray");
                                $("#addTD").css("pointer-events", "none");
                                $("#addTD").css("color", "gray"); 
                                
                            } 
                            
                                
                        },
                        error: function(error) {
                            console.log(error);
                        }
                    });
                    if ($('#addCollection').hasClass('fa-times')) {
                        addNewRow('#collectionTabBody','collection',$(this).closest('tr').index())
                        const trNext = $(this).closest('tr').next()
                        $('#collectionTabBody>tr').find('td[contenteditable="true"]').focus()
                    }    
                }   
            }
            
        });
        
/////////////////////////////collectionTabBody save,edit & del button////////////////////////////////
        $('#collectionTabBody').on('click', 'a[rel="edit"], a[rel="save"], a[rel="del"], a[rel="cancel"]', function (event) {
            event.preventDefault();
            const relval = $(this).attr('rel');
            const td = this.closest('tr').querySelector('td:nth-child(2)');
            const collectionId = $(td).find('input[type="hidden"][name="collection"]').val();
            if(relval == "edit"){
                
                const alltd = $('#collectionTabBody tr').find('td.w3-edittd');
                cancelEdit(alltd,tdCollContent);
                
                $(td).find('span').attr('contenteditable', 'true');
                $(td).addClass('w3-edittd');
                $(td).find('span').focus();
                tdCollContent = $(td).find('span').text();
                //appending the cancel button
                const first_td = this.closest('tr').querySelector('td:nth-child(1)')
                const chkmarkEle = $(first_td).find('.checkmark')
                const delEle = $(first_td).find('.fa-minus')
                const cancelEle = '<a href="" rel="cancel"><i class="fa fa-times" style="font-size:15px;color:red"></i></a>'
                if(chkmarkEle.length>0){chkmarkEle.hide();$(first_td).append(cancelEle);}
                else if(delEle.length>0){delEle.hide();$(first_td).append(cancelEle);}
                else{$(first_td).append(cancelEle)}
                //replacing edit by save button
                const anchorele = $(td).closest('tr').find('a[rel="edit"]')
                anchorele.attr('rel','save')
                const iele = anchorele.closest('td').find('i')
                iele.removeClass('fa fa-edit').addClass('fa fa-save w3-text-theme');
            }
            else if(relval == "save"){
                
                if(collectionId == "" ){
                    if($(td).text().trim() != ""){
                        if($(td).closest('tr').prev().length>0)
                        {prevcollnumber = Number($(td).closest('tr').prev().find('p').text().match(/\((-?\d+)\)/)[1]);if(prevcollnumber<0){prevcollnumber=1}}
                        else{prevcollnumber = 0}
                        var collData = {
                            'collectionno':prevcollnumber+1,
                            'collection':$(td).text().trim()
                        };
                        $.ajax({url:"/insertcollection",
                            type:"POST",
                            contentType: 'application/json',
                            data:JSON.stringify(collData),
                            success:function(result){
                                
                                $('#addCollection').toggleClass('fa-plus fa-times');
                                const collno = prevcollnumber+1;
                                const pele = document.createElement('p');
                                const span = document.createElement('span')
                                const collindex = $(td).closest('tr').index()+1
                                span.textContent = $(td).text().trim()
                                pele.textContent = '('+collno+')'
                                pele.appendChild(span)
                                $(td).append(pele);
                                let ind = collno
                                $('#collectionTabBody tr').each(function(index){
                                    if(index>=collindex){
                                        ind = ind + 1;
                                        const span = document.createElement('span')
                                        span.textContent = $(this).find('td:eq(1)').find('span').text().trim()
                                        $(this).find('td:eq(1)').find('p').find('span').remove()
                                        $(this).find('td:eq(1)').find('p').text(' (' + ind + ')').append(span)
                                    }
                                })
                                
                                $(td).contents().filter(function(){return this.nodeType===3;}).remove()
                                $(td).closest('tr').find('input[type="hidden"]').val(result);
                                const anchorele = $(td).closest('tr').find('a[rel="save"]')
                                anchorele.attr('rel','edit')
                                const anchordel = $(td).closest('tr').find('a[rel="del"]')
                                const tddel = anchordel.closest('td')
                                anchordel.remove();
                                const dropdownDiv = '<a href="" class="deleteRow" rel="del"><i class="fa fa-minus w3-text-theme" style="font-size:15px"></i></a>' 
                                tddel.append(dropdownDiv);
                                $(td).removeClass("w3-edittd")
                                const iele = anchorele.closest('td').find('i')
                                iele.removeClass('fa fa-save').addClass('fa fa-edit w3-text-theme');
                                
                                
                            }
                        });  
                        td.setAttribute('contenteditable', 'false');
                        $("#addBook,#addTDKetab,#addTD").css({"pointer-events":"auto","color":"black"});
                    }else{$(td).focus();td.setAttribute('contenteditable', 'true');}
                }else if(collectionId!=""){
                    if($(td).find('span').text().trim()!=""){
                        var collData = {
                            'collection':$(td).find('span').text().trim(),
                            'id': collectionId
                        };
                        $.ajax({url:"/updatecollection",
                            type:"POST",
                            contentType: 'application/json',
                            data:JSON.stringify(collData),
                            success:function(result){
                                tdCollContent = $(td).find('span').text().trim()
                                if(Number($(td).find('p').text().trim().match(/\((-?\d+)\)/)[1])<0){$(td).find('p').text(' (1)'+tdCollContent)}
                                cancelEdit($(td),tdCollContent)
                                if($(td).css('background-color') == chkdBgColor){updateCollName($(td).find('span'));}
                            }
                        }); 
                    }
                }
                
            }
            else if(relval == "del"){
                const id = $(td).closest('tr').find('input[type="hidden"]').val()
                if(id == ""){
                    $('#addCollection').toggleClass('fa-plus fa-times');
                    $(td).closest('tr').remove();
                    var chdColltd = $('#collectionTabBody td').filter(function() {
                        return $(this).find('input[name=collection]').val() == prevselCollId;
                    });
                    $("#addBook,#addTDKetab,#addTD").css({"pointer-events":"auto","color":"black"});
                    chdColltd.closest('tr').find('td>p').trigger('click');
                }
                else{
                    const collnumber = Number($(td).closest('tr').find('p').text().match(/\((-?\d+)\)/)[1])
                    var collData = {
                        'collection':$(td).closest('tr').find('input[type="hidden"]').val(),
                        'collectionno':collnumber
                    };
                    $.ajax({url:"/deletecollection", ///check next
                        type:"POST",
                        contentType: 'application/json',
                        data:JSON.stringify(collData),
                        success:function(result){
                            const collindex = $(td).closest('tr').index()
                            $('#collectionTabBody tr').each(function(index){
                                if(index>collindex){
                                    let ind = Number($(this).find('td:eq(1)').find('p').text().match(/\((-?\d+)\)/)[1]) - 1
                                    const span = document.createElement('span')
                                    span.textContent = $(this).find('td:eq(1)').find('span').text().trim()
                                    $(this).find('td:eq(1)').find('p').find('span').remove()
                                    $(this).find('td:eq(1)').find('p').text(' (' + ind + ')').append(span)
                                }
                            });
                            if($(td).css('background-color')==chkdBgColor){
                                let nxttr = $(td).parent('tr').next();
                                if(nxttr.index()>0){nxttr.find('td>p').trigger('click');}
                                else{nxttr = $(td).parent('tr').prev();
                                    if(nxttr.index()>0){nxttr.find('td>p').trigger('click');}}
                                
                            }
                            $(td).closest('tr').remove();
                                
                                
                        }
                    });
                    
                }
                
            }
            else if(relval == "cancel"){
                if(tdCollContent == $(td).find('span').text()){tdCollContent=$(td).find('span').text().trim();}
                cancelEdit($(td),tdCollContent);
                
            }
        });

///////////////////Drag and Drop of collection//////////////////////////
        $("#collectionTabBody").sortable({
            helper: 'clone',
            axis: 'y',
            start: function (event, ui) {
                ui.item.data('oldindex', ui.item.index());
                ui.item.data('content',ui.item.find('td:nth-child(2) p').text())
                ui.item.data('isSave','false')
                if(ui.item.find('td:nth-child(3) a').attr('rel') == "save"){ui.item.data('isSave','true')}
                
                
            },
            stop: function(event, ui) {
                if(ui.item.find('td:nth-child(2) input[type=hidden]').val().trim() =="" | ui.item.data('isSave')=='true')
                {
                    $(this).sortable('cancel');
                    if(ui.item.data('isSave')=='true'){ui.item.find('td:nth-child(2)').find('p').find('span').focus();}
                    else{ui.item.find('td:nth-child(2)').focus();}
                    
                }
            },
            update: function (event, ui) {
                
                if(ui.item.find('td:nth-child(2) input[type=hidden]').val().trim() !="" )
                {
                    if(ui.item.data('isSave')=='false'){
                    var prevPosition = ui.item.data('oldindex');
                    var currPosition = ui.item.index()
                    
                    var minPos = Math.min(prevPosition, currPosition) 
                    var maxPos = Math.max(prevPosition, currPosition) + 1
                    let ind = 0
                    $("#collectionTabBody tr").slice(minPos, maxPos).each(function (index, element) {
                        if($(element).find('td:nth-child(2) input[type=hidden]').val().trim() ==""){ind = ind + 1}
                        else{
                            const pele = document.createElement('p');
                            const span = document.createElement('span');
                            collindex = index - ind + minPos + 1;
                            span.textContent = $(element).find('td:nth-child(2) span').text().trim();
                            if($(element).find('td:nth-child(3) a').attr('rel') == "save"){span.setAttribute('contenteditable','true');span.focus()}
                            pele.textContent = '(' + collindex + ')';
                            pele.appendChild(span);
                            $(element).find('td:nth-child(2) p' ).remove()
                            $(element).find('td:nth-child(2)' ).append(pele);
                            
                            
                        }
                    });
                    const newcollindex = Number(ui.item.find('td:nth-child(2) p').text().match(/\((-?\d+)\)/)[1]);
                    const oldcollindex = Number(ui.item.data('content').match(/\((-?\d+)\)/)[1]);
                    
                    var collData = {
                        'oldcollno':oldcollindex,
                        'collectionno':newcollindex
                    };
                    $.ajax({url:"/updatecollno",
                        type:"POST",
                        contentType: 'application/json',
                        data:JSON.stringify(collData),
                        success:function(result){console.log("success")}
                    }); 
                } 
                }
            }
            
        }).disableSelection();

/////////////////////////////bookTabBody save,edit & del button////////////////////////////////
        $("#bookTabBody").on('click','td>p', function() {
            
            //if($(this).closest('td').css('background-color') != chkdBgColor)
            //{
                var hidval = $('#bookTabBody tr').filter(function() {
                return $(this).find('input[type="hidden"]').val() == "";});
                let hidvallength = hidval.length;
                if($(this).closest('tr').find('td:eq(2)').find('a').attr('rel') == "save"){hidvallength = 1;}
                if(hidvallength == 0){
                    const alltd = $('#bookTabBody tr').find('td.w3-edittd');
                cancelEdit(alltd,tdBookContent)
                const hiddenInputValue = $(this).closest('td').find('input[type="hidden"]').val();
                $("#bookTabBody td").css({backgroundColor: '',color: ''});
                updateBookName($(this).find('span'));
                let delrow = $(this).closest('tr').find('.deleteRow')
                if(delrow.length>0){delrow.closest('td').html('')}   
                $("#addTDKetab").css("pointer-events", "auto");
                $("#addTDKetab").css("color", "black");
                $("#addTD").css("pointer-events", "none");
                $("#addTD").css("color", "gray"); 
                $(this).closest('td').css({'backgroundColor': 'rgb(24, 139, 240)','color':'white'});
                clear_hadithDetails();
                $('#hadeeth tbody').empty();
                $('#hadTabbody').empty();
                $('#hadpopup1').hide();
                hidePopup()
                var chdcolltd = $('#collectionTabBody td').filter(function() {
                    return $(this).css('background-color') == chkdBgColor;
                });
                if(chdcolltd.length>0){updateBookTable(chdcolltd.find('input[type=hidden][name=collection]').val())};
                var book_data={data_book:hiddenInputValue};
                var chhiddenInputValue = ""   
                //getchapters and their hadiths based on the book
                $.ajax({url:"/getchapter",
                    type:"POST",
                    contentType: 'application/json',
                    data:JSON.stringify(book_data),
                    async: false,
                    success:function(result){
                        
                        var chap = result.chap; //fill the third card in html
                        newChapterTable(chap);
                        var checkedtd = $('#chapterTabBody td').filter(function() {
                            return $(this).css('background-color') == chkdBgColor;
                        });
                        if(checkedtd.length>0)
                        {
                        chhiddenInputValue=checkedtd.find('input[type=hidden][name=chapter]').val();
                        $("#addTD").css({"pointer-events":"auto","color":"black"});
                        $('#chDiv').animate({ scrollTop:  checkedtd.closest('tr').position().top  }, 500);}
                        if(chhiddenInputValue){
                            $.ajax({url:"/updatehadith",
                                type:"POST",
                                dataType:'json',
                                data:{data_chapter: chhiddenInputValue},
                                async:false,
                                success:function(result){
                                    var data = result.data1;
                                    newHadithTable(data);
                                    
                                    rows = $("#hadeeth tbody tr");
                                    if(btnFlag == 1){currentIndex = 0;}
                                    else if(btnFlag == 0){currentIndex = rows.length - 1;}
                                    showCurrentRow();
                                        
                                },
                                error: function(error) {
                                    console.log(error);
                                }
                            });
                        }
                        else{
                            var hadith = result.hadith //fill the first and third cards in html
                            newHadithTable(hadith)
                            
                            rows = $("#hadeeth tbody tr");
                            if(btnFlag == 1){currentIndex = 0;}
                            else if(btnFlag == 0){currentIndex = rows.length - 1;}
                            showCurrentRow()
                        }
                    },
                    error: function(error) {
                        console.log(error);
                    }
                });
                
                
            
                if ($('#addBook').hasClass('fa-times')) {
                    addNewRow('#bookTabBody','bookHidden',$(this).closest('tr').index())
                    const trNext = $(this).closest('tr').next()
                    $('#bookTabBody>tr').find('td[contenteditable="true"]').focus()
                }
            }
            else{
                
            }
            //}
        });//currently working on 
        function addNewRow(tabBody,hiddenName,index){
            const newrow = `
                            <tr>
                                <td style="text-align: center; width:5px">
                                <a href="" class="deleteRow" rel="del" name="hello">
                                    <i class="fa fa-minus w3-text-theme" style="font-size:15px"></i>
                                </a>
                                </td>
                                <td style="text-align: right; white-space:wrap; word-break: break-all; width: 150px; max-width: 150px; "class="w3-edittd"  contenteditable="true">
                                <input type="hidden"  id="`+hiddenName+`" name="`+hiddenName+`" value="" /></td>
                                <td style="text-align: left; width:2px;padding-left: 2%; ">
                                <a href="" rel="save">
                                    <i class="fa fa-save w3-text-theme" rel="save" style="font-size:15px"></i>
                                </a>
                                </td>
                            </tr>
                            `;
            if(index == -1){$(tabBody).append(newrow)}
            else{$(tabBody+'>tr').eq(index).after(newrow)}

            
        }
        function cancelEdit(edittd,text){
            edittd.each(function () {
                const $this = $(this);
                $this.find('span').attr('contenteditable', 'false');
                $this.removeClass('w3-edittd');
                $this.find('span').text(text);
                const $a = $this.closest('tr').find('a[rel="save"]')
                $a.attr('rel','edit')
                $a.closest('td').find('i').removeClass('fa fa-save').addClass('fa fa-edit w3-text-theme');
                const first_td = $this.closest('tr').find('td:eq(0)')
                $(first_td).find('a[rel="cancel"]').remove()
                if($(first_td).find('i').is(':hidden')){$(first_td).find('i').show()}  
            });
        }
        function clearTables($this,tabbody,content){
            const alltd = $(tabbody+' tr').find('td.w3-edittd');
            cancelEdit(alltd,content);
            $(tabbody+' td').css({backgroundColor: '',color: ''});

            let delrow = $this.closest('tr').find('.deleteRow')
            if(delrow.length>0){delrow.remove(); }  
             
            $("#addTD").css("pointer-events", "auto");
            $("#addTD").css("color", "black");
            clear_hadithDetails();
            $('#hadeeth tbody').empty();
            $('#hadTabbody').empty();
            $('#hadpopup1').hide();
            hidePopup();
            $this.closest('td').css('backgroundColor', 'rgb(24, 139, 240)');
            $this.closest('td').css('color', 'white');
        }
        $('#bookTabBody').on('click', 'a[rel="edit"], a[rel="save"], a[rel="del"], a[rel="cancel"]', function (event) {
            event.preventDefault();
            const relval = $(this).attr('rel');
            var chdcolltd = $('#collectionTabBody td').filter(function() {
                return $(this).css('background-color') == chkdBgColor;
            });
            const selectedCollId = chdcolltd.find('input[type=hidden][name=collection]').val();
               
            const td = this.closest('tr').querySelector('td:nth-child(2)');
            const bookId = $(td).find('input[type="hidden"][name="bookHidden"]').val();
            if(relval == "edit"){
                const alltd = $('#bookTabBody tr').find('td.w3-edittd');
                cancelEdit(alltd,tdBookContent)
                $(td).find('span').attr('contenteditable', 'true');
                $(td).addClass('w3-edittd');
                $(td).find('span').focus();
                tdBookContent = $(td).find('span').text();
                const first_td = this.closest('tr').querySelector('td:nth-child(1)')
                const chkmarkEle = $(first_td).find('.checkmark')
                const delEle = $(first_td).find('.fa-minus')
                const cancelEle = '<a href="" rel="cancel"><i class="fa fa-times" style="font-size:15px;color:red"></i></a>'
                if(chkmarkEle.length>0){chkmarkEle.hide();$(first_td).append(cancelEle);}
                else if(delEle.length>0){delEle.hide();$(first_td).append(cancelEle);}
                else{$(first_td).append(cancelEle)}
                
                const anchorele = $(td).closest('tr').find('a[rel="edit"]')
                anchorele.attr('rel','save')
                const iele = anchorele.closest('td').find('i')
                iele.removeClass('fa fa-edit').addClass('fa fa-save w3-text-theme');
            }
            else if(relval == "save"){
                if(bookId=="" ){
                    if($(td).text().trim()!=""){
                        var bookData = {
                            'booknumber':$(td).closest('tr').index()+1,
                            'booktitle_ar':$(td).text().trim(),
                            'collection': selectedCollId
                        };
                        $.ajax({url:"/insertbook",
                            type:"POST",
                            contentType: 'application/json',
                            data:JSON.stringify(bookData),
                            success:function(result){
                                $('#addBook').toggleClass('fa-plus fa-times');
                                if(chdcolltd.closest('tr').find('.checkmark').length>0){chdcolltd.closest('tr').find('.checkmark').remove();}
                                const pele = document.createElement('p');
                                const span = document.createElement('span')
                                bookindex = $(td).closest('tr').index()+1
                                span.textContent = $(td).text().trim()
                                pele.textContent = '('+bookindex+')'
                                pele.appendChild(span)
                                $(td).append(pele);
                                $('#bookTabBody tr').each(function(index){
                                    if(index>=bookindex){
                                        ind = index + 1;
                                        const span = document.createElement('span')
                                        span.textContent = $(this).find('td:eq(1)').find('span').text().trim()
                                        $(this).find('td:eq(1)').find('p').find('span').remove()
                                        $(this).find('td:eq(1)').find('p').text(' (' + ind + ')').append(span)
                                    }
                                })
                                
                                $(td).contents().filter(function(){return this.nodeType===3;}).remove()
                                $(td).closest('tr').find('input[type="hidden"]').val(result[0]);
                                const anchorele = $(td).closest('tr').find('a[rel="save"]')
                                anchorele.attr('rel','edit')
                                const anchordel = $(td).closest('tr').find('a[rel="del"]')
                                const tddel = anchordel.closest('td')
                                anchordel.remove();
                                const dropdownDiv = '<a href="" class="deleteRow" rel="del"><i class="fa fa-minus w3-text-theme" style="font-size:15px"></i></a>' 
                                                       
                                tddel.append(dropdownDiv);
                                $(td).removeClass("w3-edittd")
                                const iele = anchorele.closest('td').find('i')
                                iele.removeClass('fa fa-save').addClass('fa fa-edit w3-text-theme');
                                
                            }
                        }); 
                        td.setAttribute('contenteditable', 'false');
                        $("#addCollection,#addTDKetab,#addTD").css({"pointer-events":"auto","color":"black"});
                    
                    }else{$(td).focus();td.setAttribute('contenteditable', 'true');}
                }else if(bookId!=""){
                    if($(td).find('span').text().trim()!=""){
                        var bookData = {
                            'booktitle_ar':$(td).find('span').text().trim(),
                            'id': bookId
                        };
                        $.ajax({url:"/updatebook",
                            type:"POST",
                            contentType: 'application/json',
                            data:JSON.stringify(bookData),
                            success:function(result){
                                tdBookContent = $(td).find('span').text().trim();
                                cancelEdit($(td),tdBookContent);
                                if($(td).css('background-color') == chkdBgColor){updateBookName($(td).find('span'));}
                                
                            }
                        }); 
                    }
                    
                }
                
                //td.setAttribute('contenteditable', 'false');
            }
            else if(relval == "del"){
                const id = $(td).closest('tr').find('input[type="hidden"]').val()
                if(id == ""){
                    $('#addBook').toggleClass('fa-plus fa-times');
                    $(td).closest('tr').remove();
                    var chdBooktd = $('#bookTabBody td').filter(function() {
                        return $(this).find('input[name=bookHidden]').val() == prevselBookId;
                    }).css({backgroundColor:chkdBgColor,color:'white'});
                    chdBooktd.closest('tr').find('td>p').trigger('click');
                }
                else{
                    var bookData = {
                        'book' : $(td).closest('tr').find('input[type="hidden"]').val(),
                        'booknumber':$(td).closest('tr').index()+1,
                        'collection':selectedCollId
                    };
                    $.ajax({url:"/deletebook",
                        type:"POST",
                        contentType: 'application/json',
                        data:JSON.stringify(bookData),
                        success:function(result){
                            const bookindex = $(td).closest('tr').index()
                            $('#bookTabBody tr').each(function(index){
                                if(index>bookindex){
                                    const span = document.createElement('span')
                                    span.textContent = $(this).find('td:eq(1)').find('span').text().trim()
                                    $(this).find('td:eq(1)').find('p').find('span').remove()
                                    $(this).find('td:eq(1)').find('p').text(' (' + index + ')').append(span)
                                }
                            })
                            if($(td).css('background-color')==chkdBgColor){
                                let nxttr = $(td).parent('tr').next();
                                if(nxttr.index()>0){nxttr.find('td>p').trigger('click');}
                                else{nxttr = $(td).parent('tr').prev();
                                    if(nxttr.index()>0){nxttr.find('td>p').trigger('click');}}
                            }

                            $(td).closest('tr').remove();
                                //updateBookName()
                            $.ajax({url:"/getcollection",
                                type:"POST",
                                contentType: 'application/json',
                                success:function(result){
                                    collection = result.collection;
                                    const cltr = $('#collectionTabBody tr').filter(function() {
                                        return $(this).find('input[type=hidden][name=collection]').val() == selectedCollId;
                                    });
                                    const cltd = cltr.find('td:eq(0)');
                                    for (var i=0;i<collection.length;i++){
                                        var doc = collection[i];
                                        if(doc['_id'] == selectedCollId){
                                            if(doc['save_flag'] == true ){if(cltd.find('.checkmark').length==0){
                                                const iele3 = document.createElement("i");
                                                iele3.className = "checkmark w3-text-theme";
                                                iele3.style.fontSize = "15px";
                                                iele3.id = selectedCollId;
                                                cltd.append(iele3);}}
                                            else{
                                                if(cltd.find('.checkmark').length>0){cltd.find('.checkmark').remove()}
                                            }
                                        }
                                    }
                                }
                            });
                        //delete success ends here
                        }
                    });
                }
                $("#addCollection,#addTDKetab,#addTD").css({"pointer-events":"auto","color":"black"});
                    
            }
            else if(relval == "cancel"){
                if(tdBookContent == $(td).find('span').text()){tdBookContent =$(td).find('span').text().trim();}
                cancelEdit($(td),tdBookContent)
            }
        });
        //////////Drag and drop of books///////////////
        $("#bookTabBody").sortable({
            helper: 'clone',
            axis: 'y',
            start: function (event, ui) {
                ui.item.data('oldindex', ui.item.index());
                ui.item.data('content',ui.item.find('td:nth-child(2) p').text())
                ui.item.data('isSave','false')
                if(ui.item.find('td:nth-child(3) a').attr('rel') == "save"){ui.item.data('isSave','true')}
                
                
            },
            stop: function(event, ui) {
                if(ui.item.find('td:nth-child(2) input[type=hidden]').val().trim() =="" | ui.item.data('isSave')=='true')
                {
                    $(this).sortable('cancel');
                    if(ui.item.data('isSave')=='true'){ui.item.find('td:nth-child(2)').find('p').find('span').focus();}
                    else{ui.item.find('td:nth-child(2)').focus();}
                    
                }
            },
            update: function (event, ui) {
                
                if(ui.item.find('td:nth-child(2) input[type=hidden]').val().trim() !="" )
                {
                    if(ui.item.data('isSave')=='false'){
                    var prevPosition = ui.item.data('oldindex');
                    var currPosition = ui.item.index()
                    
                    var minPos = Math.min(prevPosition, currPosition) 
                    var maxPos = Math.max(prevPosition, currPosition) + 1
                    let ind = 0
                    $("#bookTabBody tr").slice(minPos, maxPos).each(function (index, element) {
                        if($(element).find('td:nth-child(2) input[type=hidden]').val().trim() ==""){ind = ind + 1}
                        else{
                            const pele = document.createElement('p');
                            const span = document.createElement('span');
                            bookindex = index - ind + minPos + 1;
                            span.textContent = $(element).find('td:nth-child(2) span').text().trim();
                            if($(element).find('td:nth-child(3) a').attr('rel') == "save"){span.setAttribute('contenteditable','true');span.focus()}
                            pele.textContent = '(' + bookindex + ')';
                            pele.appendChild(span);
                            $(element).find('td:nth-child(2) p' ).remove()
                            $(element).find('td:nth-child(2)' ).append(pele);
                            
                            
                        }
                    });
                    const newbookIndex = Number(ui.item.find('td:nth-child(2) p').text().match(/\((-?\d+)\)/)[1]);
                    const oldbookIndex = Number(ui.item.data('content').match(/\((-?\d+)\)/)[1]);
                    var chdcolltd = $('#collectionTabBody td').filter(function() {
                        return $(this).css('background-color') == chkdBgColor;
                    });
                    const selectedCollId = chdcolltd.find('input[type=hidden][name=collection]').val();
                    var bookData = {
                        'oldbookno':oldbookIndex,
                        'booknumber':newbookIndex,
                        'collection': selectedCollId
                    };
                    $.ajax({url:"/updatebookno",
                        type:"POST",
                        contentType: 'application/json',
                        data:JSON.stringify(bookData),
                        success:function(result){console.log("success")
                        if(ui.item.find('td:eq(1)').css('background-color') == chkdBgColor){
                            ui.item.find('td:eq(1)').css('background-color',"");
                            ui.item.find('td:eq(1) p').trigger('click')}
                    }
                    });
                } 
                }
            }
            
        }).disableSelection();
//////////////////////////////chapterTabBody save,edit & del button////////////////////////////////
        $("#chapterTabBody").on('click','td>p', function() {
            if($(this).closest('td').css('background-color') != chkdBgColor){
                var hidval = $('#chapterTabBody tr').filter(function() {
                    return $(this).find('input[type="hidden"]').val() == "";});
                let hidvallength = hidval.length;
                if($(this).closest('tr').find('td:eq(2)').find('a').attr('rel') == "save"){hidvallength = 1;}
                if(hidvallength == 0){
                  
                    clearTables($(this),'#chapterTabBody',tdChapContent)
                    
                    const hiddenInputValue = $(this).closest('td').find('input[type="hidden"]').val();
                    var chdbooktd = $('#bookTabBody td').filter(function() {
                        return $(this).css('background-color') == chkdBgColor;
                    });
                    if(chdbooktd.length>0){updatechapterTable(chdbooktd.find('input[type=hidden][name=bookHidden]').val())};
                    
                        //old_chapter_id = this.value
                    $.ajax({url:"/updatehadith",
                        type:"POST",
                        dataType:'json',
                        data:{data_chapter: hiddenInputValue},
                        success:function(result){
                            var data = result.data1;
                            newHadithTable(data);
                            
                            rows = $("#hadeeth tbody tr");
                            if(btnFlag == 1){currentIndex = 0;}
                            else if(btnFlag == 0){currentIndex = rows.length - 1;}
                            showCurrentRow();
                                
                        },
                        error: function(error) {
                            console.log(error);
                        }
                    });
                    if ($('#addTDKetab').hasClass('fa-times')) {
                        addNewRow('#chapterTabBody','chapter',$(this).closest('tr').index())
                        const trNext = $(this).closest('tr').next()
                        $('#chapterTabBody>tr').find('td[contenteditable="true"]').focus()
                    }
                }
            }
        });
        
        $('#chapterTabBody').on('click', 'a[rel="edit"], a[rel="save"], a[rel="del"], a[rel="cancel"]', function (event) {
            event.preventDefault();
            const relval = $(this).attr('rel');
            var chdbooktd = $('#bookTabBody td').filter(function() {
                return $(this).css('background-color') == chkdBgColor;
            });
            var chdcolltd = $('#collectionTabBody td').filter(function() {
                return $(this).css('background-color') == chkdBgColor;
            });
            const selectedCollId = chdcolltd.find('input[type=hidden][name=collection]').val();
            const selectedBookId = chdbooktd.find('input[type=hidden][name=bookHidden]').val();
            const td = this.closest('tr').querySelector('td:nth-child(2)');
            const chapterId = $(td).find('input[type="hidden"][name="chapter"]').val();
            if(relval == "edit"){
                
                const alltd = $('#chapterTabBody tr').find('td.w3-edittd');
                cancelEdit(alltd,tdChapContent);
                
                $(td).find('span').attr('contenteditable', 'true');
                $(td).addClass('w3-edittd');
                $(td).find('span').focus();
                tdChapContent = $(td).find('span').text();

                const first_td = this.closest('tr').querySelector('td:nth-child(1)')
                const chkmarkEle = $(first_td).find('.checkmark')
                const delEle = $(first_td).find('.fa-minus')
                const cancelEle = '<a href="" rel="cancel"><i class="fa fa-times" style="font-size:15px;color:red"></i></a>'
                if(chkmarkEle.length>0){chkmarkEle.hide();$(first_td).append(cancelEle);}
                else if(delEle.length>0){delEle.hide();$(first_td).append(cancelEle);}
                else{$(first_td).append(cancelEle)}

                const anchorele = $(td).closest('tr').find('a[rel="edit"]')
                anchorele.attr('rel','save')
                const iele = anchorele.closest('td').find('i')
                iele.removeClass('fa fa-edit').addClass('fa fa-save w3-text-theme');



            }
            else if(relval == "save"){
                
               if(chapterId=="" ){
                    if($(td).text().trim()!=""){
                        if($(td).closest('tr').prev().length>0)
                        {prevchapnumber = Number($(td).closest('tr').prev().find('p').text().match(/\((-?\d+)\)/)[1]);if(prevchapnumber<0){prevchapnumber=1}}
                        else{prevchapnumber = 0}
                        
                        var chData = {
                            'chapterno':prevchapnumber+1,
                            'arChapter':$(td).text().trim(),
                            'book': selectedBookId
                        };
                        $.ajax({url:"/insertchapter",
                            type:"POST",
                            contentType: 'application/json',
                            data:JSON.stringify(chData),
                            success:function(result){
                                $('#addTDKetab').toggleClass('fa-plus fa-times');
                                if(chdbooktd.closest('tr').find('.checkmark').length>0){chdbooktd.closest('tr').find('.checkmark').remove()}
                                if(chdcolltd.closest('tr').find('.checkmark').length>0){chdcolltd.closest('tr').find('.checkmark').remove()}
                                const chapno = prevchapnumber+1
                                const pele = document.createElement('p');
                                const span = document.createElement('span')
                                chapindex = $(td).closest('tr').index()+1
                                span.textContent = $(td).text().trim()
                                pele.textContent = '('+chapno+')'
                                pele.appendChild(span)
                                $(td).append(pele);
                                let ind = chapno
                                $('#chapterTabBody tr').each(function(index){
                                    if(index>=chapindex){
                                        ind = ind + 1;
                                        const span = document.createElement('span')
                                        span.textContent = $(this).find('td:eq(1)').find('span').text().trim()
                                        $(this).find('td:eq(1)').find('p').find('span').remove()
                                        $(this).find('td:eq(1)').find('p').text(' (' + ind + ')').append(span)
                                    }
                                })
                                //$(td).closest('tr').find('p').text($(td).text().trim()); 
                                $(td).contents().filter(function(){return this.nodeType===3;}).remove()
                                $(td).closest('tr').find('input[type="hidden"]').val(result);
                                const anchorele = $(td).closest('tr').find('a[rel="save"]')
                                anchorele.attr('rel','edit')
                                $(td).removeClass("w3-edittd")
                                const iele = anchorele.closest('td').find('i')
                                iele.removeClass('fa fa-save').addClass('fa fa-edit w3-text-theme');
                                
                            }
                        }); 
                        td.setAttribute('contenteditable', 'false');
                    }
                    else{$(td).focus();td.setAttribute('contenteditable', 'true');}
                }else if(chapterId!=""){
                    if($(td).find('span').text().trim()!=""){
                        var chData = {
                            'arChapter':$(td).find('span').text().trim(),
                            'id': chapterId
                        };
                        $.ajax({url:"/updatechapter",
                            type:"POST",
                            contentType: 'application/json',
                            data:JSON.stringify(chData),
                            success:function(result){
                                
                                tdChapContent = $(td).find('span').text().trim()
                                if(Number($(td).find('p').text().trim().match(/\((-?\d+)\)/)[1])<0){$(td).find('p').text(' (1)'+tdChapContent)}
                                cancelEdit($(td),tdChapContent)
                            }
                        });
                     
                    }
                    //td.setAttribute('contenteditable', 'false');
                }
                
            }
            else if(relval == "del"){
                const id = $(td).closest('tr').find('input[type="hidden"]').val()
                if(id == ""){
                    $('#addTDKetab').toggleClass('fa-plus fa-times');
                    $(td).closest('tr').remove();
                    var chdChaptd = $('#chapterTabBody td').filter(function() {
                        return $(this).find('input[name=chapter]').val() == prevselChapId;
                    })//.css({backgroundColor:chkdBgColor,color:'white'});
                    chdChaptd.closest('tr').find('td>p').trigger('click');
                }
                else{
                    const chapnumber = Number($(td).closest('tr').find('p').text().match(/\((-?\d+)\)/)[1])
                    var chData = {
                        'chapter':$(td).closest('tr').find('input[type="hidden"]').val(),
                        'chapterno':chapnumber,
                        'book':selectedBookId
                    };
                    //if (chData['chapter'].trim()==""){$(td).closest('tr').remove();}
                    //else{
                    $.ajax({url:"/deletechapter",
                        type:"POST",
                        contentType: 'application/json',
                        data:JSON.stringify(chData),
                        success:function(result){
                            const chapindex = $(td).closest('tr').index()
                            $('#chapterTabBody tr').each(function(index){
                                if(index>chapindex){
                                    let ind = Number($(this).find('td:eq(1)').find('p').text().match(/\((-?\d+)\)/)[1]) - 1
                                    const span = document.createElement('span')
                                    span.textContent = $(this).find('td:eq(1)').find('span').text().trim()
                                    $(this).find('td:eq(1)').find('p').find('span').remove()
                                    $(this).find('td:eq(1)').find('p').text(' (' + ind + ')').append(span)
                                    
                                }
                            });
                            $(td).closest('tr').remove();
                            var coll_data={collection:selectedCollId,book:selectedBookId,chapter:''};
                            $.ajax({url:"/gethadithinfo",
                                type:"POST",
                                contentType: 'application/json',
                                data:JSON.stringify(coll_data),
                                success:function(result){
                                    var data = result.hadith;
                                    var book = result.book
                                    let chapter = result.chap;
                                    var collection = result.collection;
                                    
                                    const bktr = $('#bookTabBody tr').filter(function() {
                                        return $(this).find('input[type=hidden][name=bookHidden]').val() == selectedBookId;
                                    });
                                    const bktd = bktr.find('td:eq(0)');
                                    for (var i=0;i<book.length;i++){
                                        var doc = book[i];
                                        if(doc[0] == selectedBookId){
                                            if(doc[3] == true ){if(bktd.find('.checkmark').length==0){
                                                const iele3 = document.createElement("i");
                                                iele3.className = "checkmark w3-text-theme";
                                                iele3.style.fontSize = "15px";
                                                iele3.id = selectedBookId;
                                                bktd.append(iele3);}}
                                            else{
                                                if(bktd.find('.checkmark').length>0){bktd.find('.checkmark').remove()}
                                            }
                                        }
                                    }
                                    const colltr = $('#collectionTabBody tr').filter(function() {
                                        return $(this).find('input[type=hidden][name=collection]').val() == selectedCollId;
                                    });
                                    const colltd = colltr.find('td:eq(0)');
                                    for (var i=0;i<collection.length;i++){
                                        var doc = collection[i];
                                        if(doc[0] == selectedCollId){
                                            if(doc[3] == true ){if(colltd.find('.checkmark').length==0){
                                                const iele = document.createElement("i");
                                                iele.className = "checkmark w3-text-theme";
                                                iele.style.fontSize = "15px";
                                                iele.id = selectedCollId;
                                                colltd.append(iele);}}
                                            else{
                                                if(colltd.find('.checkmark').length>0){colltd.find('.checkmark').remove()}
                                            }
                                        }
                                    }
                                }
                            });    
                                
                        }
                    });
                    //}
                }
            }
            else if(relval == "cancel"){
                if(tdChapContent == $(td).find('span').text()){tdChapContent=$(td).find('span').text().trim();}
                cancelEdit($(td),tdChapContent)
                
            }
            
        });
        //////////Drag and drop of chapters///////////////
        $("#chapterTabBody").sortable({
            helper: 'clone',
            axis: 'y',
            start: function (event, ui) {
                ui.item.data('oldindex', ui.item.index());
                ui.item.data('content',ui.item.find('td:nth-child(2) p').text())
                ui.item.data('isSave','false')
                if(ui.item.find('td:nth-child(3) a').attr('rel') == "save"){ui.item.data('isSave','true')}
                
                
            },
            stop: function(event, ui) {
                if(ui.item.find('td:nth-child(2) input[type=hidden]').val().trim() =="" | ui.item.data('isSave')=='true')
                {
                    $(this).sortable('cancel');
                    if(ui.item.data('isSave')=='true'){ui.item.find('td:nth-child(2)').find('p').find('span').focus();}
                    else{ui.item.find('td:nth-child(2)').focus();}
                    
                }
            },
            update: function (event, ui) {
                
                if(ui.item.find('td:nth-child(2) input[type=hidden]').val().trim() !="" )
                {
                    if(ui.item.data('isSave')=='false'){
                    var prevPosition = ui.item.data('oldindex');
                    var currPosition = ui.item.index()
                    let chapindex = 0
                    if(prevPosition < currPosition){
                        if(prevPosition==0){chapindex = 0}else{const pos = prevPosition - 1;chapindex = Number($('#chapterTabBody tr:eq('+ pos +')').find('td:nth-child(2) p').text().match(/\((-?\d+)\)/)[1]);}}
                    else{if(currPosition==0){chapindex = 0}else{const pos = currPosition - 1;chapindex = Number($('#chapterTabBody tr:eq('+ pos +')').find('td:nth-child(2) p').text().match(/\((-?\d+)\)/)[1]);}}
                    var minPos = Math.min(prevPosition, currPosition)
                    var maxPos = Math.max(prevPosition, currPosition) + 1
                    let ind = 0
                    $("#chapterTabBody tr").slice(minPos, maxPos).each(function (index, element) {
                        
                         if($(element).find('td:nth-child(2) input[type=hidden]').val().trim() !="")
                         {
                            const pele = document.createElement('p');
                            const span = document.createElement('span');
                            chapindex = chapindex - ind + 1;
                            span.textContent = $(element).find('td:nth-child(2) span').text().trim();
                            if($(element).find('td:nth-child(3) a').attr('rel') == "save"){span.setAttribute('contenteditable','true');span.focus()}
                            pele.textContent = '(' + chapindex + ')';
                            pele.appendChild(span);
                            $(element).find('td:nth-child(2) p' ).remove()
                            $(element).find('td:nth-child(2)' ).append(pele);
                        }
                    });
                    const newchapIndex = Number(ui.item.find('td:nth-child(2) p').text().match(/\((-?\d+)\)/)[1]);
                    const oldchapIndex = Number(ui.item.data('content').match(/\((-?\d+)\)/)[1]);
                    var chdbooktd = $('#bookTabBody td').filter(function() {
                        return $(this).css('background-color') == chkdBgColor;
                    });
                    const selectedBookId = chdbooktd.find('input[type=hidden][name=bookHidden]').val();
                    var chData = {
                        'oldchapno':oldchapIndex,
                        'chapterno':newchapIndex,
                        'book': selectedBookId
                    };
                    $.ajax({url:"/updatechapno",
                        type:"POST",
                        contentType: 'application/json',
                        data:JSON.stringify(chData),
                        success:function(result){
                            console.log("success")
                            if(ui.item.find('td:eq(1)').css('background-color') == chkdBgColor){
                                ui.item.find('td:eq(1)').css('background-color',"");
                                ui.item.find('td:eq(1) p').trigger('click')}
                        }
                    });
                } 
                }
            }
            
        }).disableSelection();

        ////////////////////////////////////////////////////
///////////////////Add New collection, book and chapter ////////////////////////////////////////////////
        $('#addTD').on('click', function (){ 
            clearemptyRows("#"+$(this).attr('id'));
           if ($(this).hasClass('fa-plus')) {
                const alltd = $('#hadTabbody tr').find('td.w3-edittd');
                cancelEdit(alltd,"")
                $(this).toggleClass('fa-plus fa-times');
                if($('#hadTabbody tr').length <= 1){
                    if ($('#addTD').hasClass('fa-times')) {
                        addNewRow('#hadTabbody','hadithid_card',-1)
                        const trNext = $(this).closest('tr').next()
                        $('#hadTabbody>tr').find('td[contenteditable="true"]').focus()
                    }
                }
                else{
                    prevselHadId = $('#hadTabbody td').filter(function() {
                        return $(this).css('background-color') == chkdBgColor;
                    }).find('input[name=hadithid_card]').val();
                    $("#hadTabbody td").css({backgroundColor: '',color: ''});
                    clear_hadithDetails();
                    $('#hadeeth tbody tr').css('display','none');
                    $('#hadpopup1').hide();
                    hidePopup()
                    
                }
            }
        else{
            $(this).toggleClass('fa-plus fa-times');
            var chdHadtd = $('#hadTabbody td').filter(function() {
                return $(this).find('input[name=hadithid_card]').val() == prevselHadId;
            });
            $('#hadTabbody tr').each(function(){
                delrow = $(this).find('.deleteRow')
                if(delrow.length>0){
                    if($(delrow).closest('tr').find('input[name=hadithid_card]').val()==""){delrow.closest('tr').remove()}}
            })
            chdHadtd.trigger('click');

        }
        });
        $('#addCollection').on('click', function (){
            if(!collcontentDivs.hasClass("expanded")){$(coll_header).trigger('click');}
            clearemptyRows("#"+$(this).attr('id'));
            if ($(this).hasClass('fa-plus')) {
                const alltd = $('#collectionTabBody tr').find('td.w3-edittd');
                cancelEdit(alltd,tdCollContent)
                $(this).toggleClass('fa-plus fa-times');

                if($('#collectionTabBody tr').length <= 1){
                    if ($('#addCollection').hasClass('fa-times')) {
                        addNewRow('#collectionTabBody','collection',-1)
                        const trNext = $(this).closest('tr').next()
                        $('#collectionTabBody>tr').find('td[contenteditable="true"]').focus()
                    }
                    
                }
                else{
                    prevselCollId = $('#collectionTabBody td').filter(function() {
                        return $(this).css('background-color') == chkdBgColor;
                    }).find('input[name=collection]').val();
                    $("#collectionTabBody td").css({backgroundColor: '',color: ''});
                    updateCollName();
                    $("#addBook,#addTDKetab,#addTD").css({"pointer-events":"none","color":"gray"});
                    clear_hadithDetails();
                    $('#bookTabBody, #chapterTabBody, #hadeeth tbody, #hadTabbody').empty();
                    $('#hadpopup1').hide();
                    hidePopup()
                }
            }
            else{
                $("#addBook,#addTDKetab,#addTD").css({"pointer-events":"auto","color":"black"});
                $(this).toggleClass('fa-plus fa-times');
                var chdColltd = $('#collectionTabBody td').filter(function() {
                    return $(this).find('input[name=collection]').val() == prevselCollId;
                })
                $('#collectionTabBody tr').each(function(){
                    delrow = $(this).find('.deleteRow')
                    if(delrow.length>0){if($(delrow).closest('tr').find('input[name=collection]').val()==""){delrow.closest('tr').remove()}}
                })
                chdColltd.closest('tr').find('td>p').trigger('click');

            }
        });
        $('#addBook').on('click', function (){
            if(!bookContentDivs.hasClass("expanded")){$(book_header).trigger('click');}
            clearemptyRows("#"+$(this).attr('id'));
            if ($(this).hasClass('fa-plus')) {
                const alltd = $('#bookTabBody tr').find('td.w3-edittd');
                cancelEdit(alltd,tdBookContent)
                $(this).toggleClass('fa-plus fa-times');

                if($('#bookTabBody tr').length <= 1){
                    if ($('#addBook').hasClass('fa-times')) {
                        addNewRow('#bookTabBody','bookHidden',-1)
                        const trNext = $(this).closest('tr').next()
                        $('#bookTabBody>tr').find('td[contenteditable="true"]').focus()
                    }
                    
                }
                else{
                    prevselBookId = $('#bookTabBody td').filter(function() {
                        return $(this).css('background-color') == chkdBgColor;
                    }).find('input[name=bookHidden]').val();
                    $("#bookTabBody td").css({backgroundColor: '',color: ''});
                    updateBookName();
                    clear_hadithDetails();
                    $('#chapterTabBody, #hadeeth tbody, #hadTabbody').empty();
                    $('#hadpopup1').hide();
                    hidePopup()
                }
                $("#addCollection,#addTDKetab,#addTD").css({"pointer-events":"none","color":"gray"});
            }
            else{
                $("#addCollection,#addTDKetab,#addTD").css({"pointer-events":"auto","color":"black"});
                $(this).toggleClass('fa-plus fa-times');
                var chdBooktd = $('#bookTabBody td').filter(function() {
                    return $(this).find('input[name=bookHidden]').val() == prevselBookId;
                }).css({backgroundColor:chkdBgColor,color:'white'});
                $('#bookTabBody tr').each(function(){
                    delrow = $(this).find('.deleteRow')
                    if(delrow.length>0){
                        if($(delrow).closest('tr').find('input[name=bookHidden]').val()==""){delrow.closest('tr').remove()}}
                })
                chdBooktd.closest('tr').find('td>p').trigger('click');

            }
            

        });
        $('#addTDKetab').on('click', function (){
            if(!chapterContentDivs.hasClass("expanded")){$(chap_header).trigger('click');} 
            clearemptyRows("#"+$(this).attr('id'));
            if ($(this).hasClass('fa-plus')) {
                const alltd = $('#chapterTabBody tr').find('td.w3-edittd');
                cancelEdit(alltd,tdChapContent)
                $(this).toggleClass('fa-plus fa-times');
                if($('#chapterTabBody tr').length <= 1){
                    if ($('#addTDKetab').hasClass('fa-times')) {
                        addNewRow('#chapterTabBody','chapter',-1)
                        const trNext = $(this).closest('tr').next()
                        $('#chapterTabBody>tr').find('td[contenteditable="true"]').focus()
                    }
                    
                }
                else{
                prevselChapId = $('#chapterTabBody td').filter(function() {
                    return $(this).css('background-color') == chkdBgColor;
                }).find('input[name=chapter]').val();
                $("#chapterTabBody td").css({backgroundColor: '',color: ''});
                $("#addTD").css("pointer-events", "none");
                $("#addTD").css("color", "gray");
                clear_hadithDetails();
                $('#hadeeth tbody').empty();
                $('#hadTabbody').empty();
                $('#hadpopup1').hide();
                hidePopup()
            }
            }
            else{
                $("#addTD").css("pointer-events", "auto");
                $("#addTD").css("color", "black");
                $(this).toggleClass('fa-plus fa-times');
                var chdchaptd = $('#chapterTabBody td').filter(function() {
                    return $(this).find('input[name=chapter]').val() == prevselChapId;
                })//.css({backgroundColor:chkdBgColor,color:'white'});
                $('#chapterTabBody tr').each(function(){
                    delrow = $(this).find('.deleteRow')
                    if(delrow.length>0){
                        if($(delrow).closest('tr').find('input[name=chapter]').val()==""){delrow.closest('tr').remove()}}
                })
                chdchaptd.closest('tr').find('td>p').trigger('click');
 
            }
            
        });
          /////////////////////////////////////////////////////////////////
///////////////////Collapsible Table ////////////////////////////////////////////////
    function updateCollName(chkcoll) {
        var collName = $(chkcoll).text();
        let hele = document.createElement('h4');
        hele.textContent = "المجموعة:" + collName;
        $('#coll_name').html(hele);
    }


// Trigger change event on page load for initially checked checkboxes
var chdcolltd = $('#collectionTabBody td').filter(function() {
    return $(this).css('background-color') == chkdBgColor;
});
updateCollName(chdcolltd.find('span'));
/////////////////////Display Book name //////////////////////////////
function updateBookName(chkbook) {
    var bookName = $(chkbook).text();
    let hele = document.createElement('h4');
    hele.textContent = "الكتاب :"+bookName;
    $('#book_name').html(hele);
    
}

// Attach change event handler


// Trigger change event on page load for initially checked checkboxes
var chdbooktd = $('#bookTabBody td').filter(function() {
    return $(this).css('background-color') == chkdBgColor;
});
updateBookName(chdbooktd.find('p').find('span'));

/////////////////////////////////////////////////////
//////////////////////EOC/////////////////////
        
///////////////////////Showing/hiding modal window for changing hadiths chapter/////////////////

$('#btnCancel').on('click', function() {
    $('#hadpopup1').hide();
});

$(document).on('change', 'input[type=radio][name=optChapter]', function(event) {
    var radioChecked = $('input[name="optChapter"]:checked').length > 0;
    $('#btnOk').prop('disabled', !radioChecked);
});

$('#btnOk').on('click', function() {
    clear_hadithDetails(); //for comments inside first card, moalla table and sanad table
    $('#hadeeth tbody').empty();//first card
    $('#hadTabbody').empty();
    old_chapter_id = "";

    var checkedtd = $('#chapterTabBody td').filter(function() {
        return $(this).css('background-color') == chkdBgColor;
    });
    var chdbooktd = $('#bookTabBody td').filter(function() {
        return $(this).css('background-color') == chkdBgColor;
    });
    var chdcoll = $('#collectionTabBody td').filter(function() {
        return $(this).css('background-color') == chkdBgColor;
    }).find('input[type=hidden][name=collection]').val();
    if (checkedtd.length > 0) {old_chapter_id = checkedtd.find('input[type=hidden][name=chapter]').val();}
    
    let newchapter = $('input[name="optChapter"]:checked').val();
    var popupData = {
        'hadithid': hadith_table_id,
        'chapter': newchapter,
        'oldchapter': old_chapter_id,
        'collection': chdcoll};
    //Save the chapter in hadith and change the flag and change the chapter list to the new hadith change//will start on sunday
    $.ajax({url:"/updatehadithchapter",
        type:"POST",
        contentType: 'application/json',
        data:JSON.stringify(popupData),
        success:function(result){
            
            

            const checkedBook = chdbooktd.find('input[type=hidden][name=bookHidden]').val();;
            let book_data={data_book:checkedBook};
            //getchapters and their hadiths based on the book
            $.ajax({url:"/getchapter",
            type:"post",
            contentType: 'application/json',
            data:JSON.stringify(book_data),
            success:function(result){
                    
                var chap = result.chap;
                let selector = document.getElementById("chapterTabBody");
                selector.innerHTML = "";
                var cntcheck = null;
                for (var i=0;i<chap.length;i++){
                    var doc = chap[i]
                    const tr = document.createElement("tr");
                        
                        const td1 = document.createElement("td");
                        td1.style.textAlign = "center";
                        td1.style.width = "5px";
                        
                        const iele = document.createElement("i");
                        iele.className = "checkmark w3-text-theme";
                        iele.id = doc["_id"];
                        iele.style.fontSize = "15px";
                        //if (doc["_id"] == newchapter){checkbox.checked = true;cntcheck = doc;}

                        //del icon for chapters with no hadiths
                        const delIcon = document.createElement("a");
                        delIcon.href = "";
                        delIcon.className = "deleteRow";
                        delIcon.setAttribute("rel", "del");
                        const icon = document.createElement("i");
                        icon.className = "fa fa-minus w3-text-theme";
                        icon.style.fontSize = "15px";
                        delIcon.appendChild(icon);

                        //if there is no hadith minus button else checkbox
                        if(doc["flag"] == 1){if(doc["save_flag"]==true){td1.appendChild(iele);}}else{td1.appendChild(delIcon);}
                        
                        const td2 = document.createElement("td");
                        td2.style.textAlign = "right";
                        td2.style.whiteSpace ="wrap";
                        td2.style.overflowY = "auto";
                        td2.style.wordBreak = "break-all";
                        td2.style.width = "150px";
                        td2.style.maxWidth = "150px";//background-color: rgb(24, 139, 240);color:white"
                        if (doc["_id"] == newchapter){td2.style.backgroundColor = 'rgb(24, 139, 240)';td2.style.color='white';}

                        const hiddenInput = document.createElement("input");
                        hiddenInput.type = "hidden";
                        hiddenInput.id = "chapter";
                        hiddenInput.name = "chapter";
                        hiddenInput.value = doc["_id"];
                        
                        const p = document.createElement("p");
                        const span = document.createElement("span")
                        p.textContent = "("+doc["chapterno"]+")";span.textContent=doc["arChapter"];

                        td2.appendChild(hiddenInput);
                        p.appendChild(span)
                        td2.appendChild(p);

                        const td3 = document.createElement("td");
                        td3.style.textAlign = "left";

                        const anchorElement = document.createElement("a")
                        anchorElement.setAttribute("href","");
                        anchorElement.setAttribute("rel","edit");
                        
                        const editIcon = document.createElement("i");
                        editIcon.className = "fa fa-edit w3-text-theme";
                        editIcon.style.fontSize = "15px";
                        
                        anchorElement.appendChild(editIcon)
                        td3.appendChild(anchorElement);
                        
                        tr.appendChild(td1);
                        tr.appendChild(td2);
                        tr.appendChild(td3);

                        selector.appendChild(tr);
                        
                    }
                    $.ajax({url:"/updatehadith",
                        type:"POST",
                        dataType:'json',
                        data:{data_chapter: newchapter},
                        success:function(result){
                            var data = result.data1;
                            newHadithTable(data)
                            
                            rows = $("#hadeeth tbody tr");
                            rows.each(function() {
                                if($(this).find('input[type="hidden"]').val() == hadith_table_id)
                                {
                                    currentIndex = $(this).index();}
                            });
                            showCurrentRow()
                            
                            
                            
                        },
                        error: function(error) {
                            console.log(error);
                        }
                    });
                    
                    
                },
                error: function(error) {
                    console.log(error);
                }
            });

/////////////////end///////////////////////


        }
    }); 
    $('#hadpopup1').hide();
    
});

$("#txtSearch").on("keyup", function() {
    var value = $(this).val(),
    $tr =  $("#hadChap tr");
    $("#hadChap tr").each(function(){
        var found = 0;
        $(this).find("p").each(function(){
            found += $(this).text().indexOf(value)
        });
        if (found > -1){
            $(this).closest('tr').show();
        }else{
            $(this).closest('tr').hide();
        }
    });
});












////////////////////////////////////////////////////////////////





function adjustTitleBlock2Height() {
    
    setTimeout(function() {
        var allDivs = $("#TitleBlock2 > div");
        var visibleDivs = $("#TitleBlock2 > div:visible");
        var totalHeight = $("#TitleBlock2").outerHeight();

        // Check if there are visible divs
        if (visibleDivs.length > 0) {
            var heightPerDiv = totalHeight / visibleDivs.length;

            // Set height only for visible divs
            visibleDivs.css({
                height: heightPerDiv,
                
            });
        }

        // Set height to 0 for hidden divs
        allDivs.not(":visible").css({
            height: "",
            
        });
    }, 100); // Add a small delay (adjust the value as needed)
}

        

//////////Haadtabbody expand/collapsible button///////////////
$( "#go1" ).on( "click", function() {
    if($("#go1").hasClass("fa-expand"))
    {
        $("#block1").css({ "width": "45%" });
        $("#TitleBlock2").css({ "display": "inline-block", "width": "5%" });
        $("#TitleCollectionBlock2, #TitleBookBlock2, #TitleChapterBlock2").css({"display":"flex","flex-direction":"row","justify-content":"center"});
        $("#TitleBlock1, #block2").css({ "display": "none" });
        $("#go1").toggleClass("fa-expand fa-minus").css({ "fontSize": "10px" });
    }else
    {
        
        $("#block1").css({ "width": "", "fontSize": "", "borderWidth": "" });
        $("#TitleBlock2").css({ "display": "none", "width": "5%" });
        $("#TitleBlock1").css({"display":"flex","flex-direction":"row","justify-content":"center"});
        $("#block2").css({ "display": "inline-block", "width": "" });
        let goBtns = ["#go2", "#go3", "#go4"];
        goBtns.forEach(function(btn){
            if($(btn).hasClass("fa-minus")){
                $(btn).toggleClass("fa-minus fa-expand").css({ "fontSize": "20px" });
            }
        });
        
        $("#collectionBlock2, #bookBlock2, #chapterBlock2").css({"display":"flex","flex-direction":"column","display":"flex"});
        ///////
        coll_header2.css('height','100%');
        book_header2.css('height','100%');
        chap_header2.css('height','');
        if ($(window).width() >= 1616) {
          $("#collectionBlock2, #bookBlock2").css("height", "7%");
          $("#chapterBlock2").css("height", "82%");
        } else {
          $("#collectionBlock2, #bookBlock2").css("height", "10%");
          $("#chapterBlock2").css("height", "74%");
        }
        $("#go1").removeClass("fa-minus").addClass("fa-expand").css({ "fontSize": "20px" });
    }
    adjustTitleBlock2Height();
    chapterContentDivs.addClass("expanded").removeClass("contentDiv");
    collcontentDivs.addClass("contentDiv").removeClass("expanded");
    bookContentDivs.addClass("contentDiv").removeClass("expanded");
    
    //let htOffset = ($(window).width() >= 1616) ? 300 : 250 ;
    let htOffset = ($(window).width() >= 1616) ? 150 : 120 ;
    chapterContentDivs.height(((chap_div.parent().height()- htOffset)/chap_div.parent().height()) * 100+"vh") ;
    //chapterContentDivs.height(((chap_div.parent().height() - coll_div.height() + book_div.height() - htOffset)/chap_div.parent().height()) * 100+"vh") ;
    //chapterContentDivs.style.height = (($(chap_div).parent().height() - coll_div.clientHeight + book_div.clientHeight - 300) / $(chap_div).parent().height() * 100) + "vh";
});
////////////////ChapterTabbody expand/collapsible button////////////////////////////
$( "#go2" ).on( "click", function() {
    //let htOffset = ($(window).width() >= 1616) ? 300 : 250 ;
    //let htOffset = ($(window).width() >= 1616) ? 150 : 120 ;
    if($("#go2").hasClass("fa-expand"))
    {
        $("#block2" ).css("width", "45%")
        //$("#chapterBlock2").css("height", ($(window).width() >= 1616) ? "800px" : "510px");
        coll_header2.css('height','');
        book_header2.css('height','');
        chap_header2.css('height','');
        $( "#chapterBlock2" ).css("height", "92vh")
        $("#TitleBlock2").css({"display":"inline-block", "width": "5%"})
        $("#block1, #TitleChapterBlock2, #collectionBlock2, #bookBlock2").css("display","none")  // check this 

        $("#TitleCollectionBlock2, #TitleBookBlock2, #TitleBlock1").css({"display":"flex","flex-direction":"row","justify-content":"center"});
        
        $("#go2").toggleClass("fa-expand fa-minus").css("fontSize", "10px");
    }
    else
    {
        $( "#block2" ).css({"width": "","fontSize": "","borderWidth": ""});
        $("#collectionBlock2, #bookBlock2").css({"display":"flex","flex-direction":"column"})
        $("#TitleBlock2").css("display","none")
        $("#TitleChapterBlock2").css({"display":"flex","flex-direction":"row","justify-content":"center"});
        $( "#block1" ).css({"display":"inline-block","width":""})
        ///////
        coll_header2.css('height','100%');
        book_header2.css('height','100%');
        chap_header2.css('height','');
        //////
        if ($(window).width() >= 1616) 
        {
          $( "#chapterBlock2" ).css({"height":"82%","fontSize": "","borderWidth": ""});
          $("#collectionBlock2, #bookBlock2").css("height", "7%")
        }else
        {
          $( "#chapterBlock2" ).css({"height":"74%","fontSize": "","borderWidth": ""});
          $("#collectionBlock2, #bookBlock2").css("height", "10%")
        }
        let goBtns = ["#go1", "#go3", "#go4"];
        goBtns.forEach(function(btn){
            if($(btn).hasClass("fa-minus")){
                $(btn).toggleClass("fa-minus fa-expand").css({ "fontSize": "20px" });
            }
        });
        
        $("#go2").removeClass("fa-minus").addClass("fa-expand").css("fontSize", "20px");
    }
    adjustTitleBlock2Height();
    collcontentDivs.addClass("contentDiv").removeClass("expanded");
    bookContentDivs.addClass("contentDiv").removeClass("expanded");
    chapterContentDivs.addClass("expanded").removeClass("contentDiv");;
    //chapterContentDivs.height(((chap_div.parent().height()- htOffset)/chap_div.parent().height()) * 100+"vh") ;
    if($(window).width() >= 1616 && $(window).height() > 1225)
    {
        chapterContentDivs.height(((chap_div.parent().height()- 300)/chap_div.parent().height()) * 100+"vh") ;
    }
    else if($(window).width() >= 1616)
    {
        chapterContentDivs.height(((chap_div.parent().height()- 150)/chap_div.parent().height()) * 100+"vh") ;
    }
   
    else
    {
        chapterContentDivs.height(((chap_div.parent().height()- 120)/chap_div.parent().height()) * 100+"vh") ;
    }
});
////////////////BookTabbody expand/collapsible button////////////////////////////
$( "#go3" ).on( "click", function() {
    //alert("Hi");
    //alert("bookdiv inside go"+$(book_div).height())
    //let bkhtOffset = ($(window).width() >= 1616) ? 300 : 250;
    if($("#go3").hasClass("fa-expand"))
    {
        $("#block2" ).css("width", "45%")
        $( "#bookBlock2" ).css("height", "92vh")
        ///////
        coll_header2.css('height','');
        book_header2.css('height','');
        chap_header2.css('height','');
        //////
        $("#TitleBlock2").css({"display":"inline-block","width":"5%"})
        $("#block1, #TitleBookBlock2, #collectionBlock2,#chapterBlock2" ).css("display", "none")

        /////
        $("#TitleCollectionBlock2, #TitleChapterBlock2, #TitleBlock1").css({"display":"flex","flex-direction":"row","justify-content":"center"});
        
        /////

        
        collcontentDivs.addClass("contentDiv").removeClass("expanded");
        bookContentDivs.addClass("expanded").removeClass("contentDiv");
        chapterContentDivs.addClass("contentDiv").removeClass("expanded");
        

        $("#go3").toggleClass("fa-expand fa-minus").css("fontSize", "10px");
    }
    else
    {
        $("#block2" ).css({"width": "","fontSize": "","borderWidth": ""});

        $("#collectionBlock2, #chapterBlock2").css({"display":"flex","flex-direction":"column"});
        
        
        coll_header2.css('height','100%');
        book_header2.css('height','100%');
        chap_header2.css('height','');
        if ($(window).width() >= 1616) 
        {
              $("#bookBlock2").css({"height":"7%","fontSize": "","borderWidth": ""});
              $("#collectionBlock2").css("height", "7%")
              $("#chapterBlock2").css("height", "82%");
        }
        else
        {
              $( "#bookBlock2" ).css({"height":"10%","fontSize": "","borderWidth": ""});
              $("#collectionBlock2").css("height", "10%");
              $("#chapterBlock2").css("height", "74%");
        }
        $("#TitleBookBlock2, #block1").css("display", "inline-block");
        $("#TitleBlock2").css("display","none")
        $("#block1").css({"width":""}) 
        chapterContentDivs.addClass("expanded").removeClass("contentDiv");
        collcontentDivs.addClass("contentDiv").removeClass("expanded");
        bookContentDivs.addClass("contentDiv").removeClass("expanded");
        
        //let bkhtOffset2 = ($(window).width() >= 1616) ? 100 : 120;
        //bookContentDivs.height(((book_div.parent().height() - coll_div.height() + chap_div.height() - bkhtOffset2) / book_div.parent().height()) * 100 + "vh");

        let goBtns = ["#go1", "#go2", "#go4"];
        goBtns.forEach(function(btn){
            if($(btn).hasClass("fa-minus")){
                $(btn).toggleClass("fa-minus fa-expand").css({ "fontSize": "20px" });
            }
        });
        
        $("#go3").removeClass( "fa-minus").addClass("fa-expand").css("fontSize", "20px");
      
    }
    if($(window).width() >= 1616 && $(window).height() > 1225)
    {
        bookContentDivs.height(((book_div.parent().height()- 300) / book_div.parent().height() ) * 100 + "vh");
    }
    else if($(window).width() >= 1616)
    {
        bookContentDivs.height(((book_div.parent().height()- 150) / book_div.parent().height() ) * 100 + "vh");
    }

    else
    {
        bookContentDivs.height(((book_div.parent().height()- 120) / book_div.parent().height() ) * 100 + "vh");
    }
    adjustTitleBlock2Height();  
});
////////////////CollectionTabbody expand/collapsible button////////////////////////////
$( "#go4" ).on( "click", function() {
    //let collhtOffset = ($(window).width() >= 1616)? 300: 250;
    let collhtOffset = ($(window).width() >= 1616)? 150: 120;
    if($("#go4").hasClass("fa-expand"))
    {
        $( "#block2" ).css("width", "45%")
        //$("#collectionBlock2").css("height", ($(window).width() >= 1616) ? "800px" : "510px");
        $( "#collectionBlock2" ).css("height", "92vh")
        ///////
        coll_header2.css('height','');
        book_header2.css('height','');
        chap_header2.css('height','');
        //////
        $( "#block1, #TitleCollectionBlock2, #bookBlock2, #chapterBlock2" ).css("display", "none")
        $("#TitleBlock2").css({"display":"inline-block","width":"5%"})

        /////
        $("#TitleBookBlock2 #TitleChapterBlock2, #TitleBlock1").css({"display":"flex","flex-direction":"row","justify-content":"center"});
        
        /////

        collcontentDivs.addClass("expanded").removeClass("contentDiv");
        bookContentDivs.addClass("contentDiv").removeClass("expanded");
        chapterContentDivs.addClass("contentDiv").removeClass("expanded");
        //collcontentDivs.height((($(coll_div).parent().height() - book_div.height() + chap_div.height() + collhtOffset)/ ($(coll_div).parent().height() )) * 100 + "vh");
        //collcontentDivs.height(((coll_div.parent().height() - book_div.height() + chap_div.height() + collhtOffset)/ coll_div.parent().height() ) * 100 + "vh");
        
        $("#go4").toggleClass("fa-expand fa-minus").css("fontSize", "10px");
    }
    else
    {
        $( "#block2" ).css({"width": "","fontSize": "","borderWidth": ""});

        $("#bookBlock2,#chapterBlock2").css({"display":"flex","flex-direction":"column"});
        ///////
        coll_header2.css('height','100%');
        book_header2.css('height','100%');
        chap_header2.css('height','');

        $("#block1").css({"display":"inline-block","width": ""})
        if ($(window).width() >= 1616) 
        {
            $( "#collectionBlock2, #bookBlock2" ).css({"height":"7%","fontSize": "","borderWidth": ""});
            $("#chapterBlock2").css("height", "82%");
        }
        else
        {
            $( "#collectionBlock2, #bookBlock2" ).css({"height":"10%","fontSize": "","borderWidth": ""});
            $("#chapterBlock2").css("height", "74%");
        }
        $("#TitleCollectionBlock2").css({"display":"flex","flex-direction":"row","justify-content":"center"});
        $("#TitleBlock2").css("display","none")
        
        bookContentDivs.addClass("contentDiv").removeClass("expanded");
        collcontentDivs.addClass("contentDiv").removeClass("expanded");
        chapterContentDivs.addClass("expanded").removeClass("contentDiv");
        //collcontentDivs.height(((coll_div.parent().height() - book_div.height() + chap_div.height() - collhtOffset)/ coll_div.parent().height() ) * 100 + "vh");
        let goBtns = ["#go1", "#go2", "#go3"];
        goBtns.forEach(function(btn){
            if($(btn).hasClass("fa-minus")){
                $(btn).toggleClass("fa-minus fa-expand").css({ "fontSize": "20px" });
            }
        });
        
        $("#go4").removeClass("fa-minus").addClass("fa-expand").css("fontSize", "20px");
    }
    collcontentDivs.height(((coll_div.parent().height() - collhtOffset)/ coll_div.parent().height() ) * 100 + "vh");
    adjustTitleBlock2Height();  
});
///////////////////hadeeth table///////////////////////////////
$( "#go5" ).on( "click", function() {
    let btnExpand =["#go1","#go2","#go3","#go4"]
    if($("#go5").hasClass("fa-expand"))
    {
        ///////
        coll_header2.css('height','');
        book_header2.css('height','');
        chap_header2.css('height','');
        //////,
        let blocks = ["#collectionBlock2","#bookBlock2","#chapterBlock2"]
        blocks.forEach(function(block){
            if(!$(block ).is(':visible')){$(block).css({"display":"flex","flex-direction":"column"})}
        });
        $( "#block1, #block2" ).css("display", "none")
        $( "#block3, #button-container" ).css("width", "95%")
        $("#TitleBlock2").css({"display":"inline-block","width":"5%"})
        
        $("#TitleCollectionBlock2,#TitleBookBlock2,#TitleChapterBlock2,#TitleBlock1").css({"display":"flex","flex-direction":"row","justify-content":"center"});

        $("#go5").toggleClass("fa-expand fa-minus").css("fontSize", "10px");
        let titleBlocks = ["#TitleBlock1","#TitleChapterBlock2","#TitleBookBlock2","#TitleCollectionBlock2"]
        titleBlocks.forEach(function(block){
            if(!$(block ).is(':visible')){$(block).css({"display":"flex","flex-direction":"row","justify-content":"center"})}
        });
        btnExpand.forEach(function(btn){
            if($(btn).hasClass("fa-minus")){
                $(btn).toggleClass("fa-minus fa-expand").css("fontSize", "20px");
            }
        });
        
    }
    else
    {
        $( "#block3" ).css({"width": "","fontSize": "","borderWidth": ""});
        $("#TitleBlock2").css({"display":"none","width":"5%"})
        $( "#block1, #block2" ).css({"display":"inline-block","width":"25%"})
        ///////
        coll_header2.css('height','100%');
        book_header2.css('height','100%');
        chap_header2.css('height','');
      //////
        if ($(window).width() >= 1616) 
        {
            $("#collectionBlock2, #bookBlock2").css("height", "7%")
            $("#chapterBlock2").css("height", "82%")
        }else
        {
            $("#collectionBlock2, #bookBlock2").css("height", "10%")
            $("#chapterBlock2").css("height", "74%")
        }
        $("#go5").removeClass("fa-minus").addClass("fa-expand").css("fontSize", "20px");
        btnExpand.forEach(function(btn){
            if($(btn).hasClass("fa-minus")){
                $(btn).toggleClass("fa-minus fa-expand").css("fontSize", "20px");
            }
        });
        
        $("#button-container").css("width", "")
    }
    adjustTitleBlock2Height();
    collcontentDivs.addClass("contentDiv").removeClass("expanded");
    bookContentDivs.addClass("contentDiv").removeClass("expanded");
    chapterContentDivs.addClass("expanded").removeClass("contentDiv");
    //let chhtOffset = ($(window).width() >= 1616)? 300: 250 ;        
    //chapterContentDivs.height(((chap_div.parent().height() - coll_div.height() + book_div.height() + chhtOffset)/chap_div.parent().height() )* 100+"vh") ; 
    let chhtOffset = ($(window).width() >= 1616)? 150: 120 ;        
    chapterContentDivs.height(((chap_div.parent().height() - chhtOffset)/chap_div.parent().height() )* 100+"vh") ; 
});
 ////////////////////////////////////////////
$( "#TitleBlock1" ).on( "click", function() {
    $("#TitleBlock1, #block2" ).css("display", "none")
    $("#TitleBlock2, #block1").css("display","inline-block")
    
    $("#TitleCollectionBlock2,#TitleBookBlock2,#TitleChapterBlock2").css({"display":"flex","flex-direction":"row","justify-content":"center"});
    ////

    $( "#block1" ).css({"width":"45%", "display":"inline-block"})
    $( "#block3" ).css("width", "50%")
    if($("#go1").hasClass("fa-expand"))
    {
        //$("#go1").removeClass("fa-expand").addClass("fa-minus").css("fontSize", "10px");
        $("#go1").toggleClass("fa-expand fa-minus").css("fontSize", "10px");
    }
    if($("#go5").hasClass("fa-minus"))
    {
        //$("#go5").removeClass("fa-minus").addClass("fa-expand").css("fontSize", "20px");
        $("#go5").toggleClass("fa-minus fa-expand").css("fontSize", "20px");
    }
    $( "#block2" ).css({"width": "","fontSize": "","borderWidth": ""});
        
    if(!$("#TitleCollectionBlock2").is(":visible"))
    {
        $("#TitleCollectionBlock2").css({"display":"flex","flex-direction":"row","justify-content":"center"});
        coll_header2.css('height','100%');
        $( "#block2" ).css({width: "",fontSize: "",borderWidth: ""});
        $("#collectionBlock2" ).css({"height":($(window).width() >= 1616) ?"7%":"10%","fontSize": "","borderWidth": ""});
        $("#bookBlock2, #chapterBlock2").css({"display":"flex","flex-direction":"column"});
        $("#go4").removeClass("fa-minus").addClass("fa-expand").css("fontSize", "20px");
    }
    if(!$("#TitleBookBlock2").is(":visible"))
    {
        $("#TitleBookBlock2").css({"display":"flex","flex-direction":"row","justify-content":"center"});
        book_header2.css('height','100%');
        $("#bookBlock2" ).css({"height":($(window).width() >= 1616) ?"7%":"10%","fontSize": "","borderWidth": ""});
        $( "#block2" ).css({width: "",fontSize: "",borderWidth: ""});
        $("#chapterBlock2, #collectionBlock2").css({"display":"flex","flex-direction":"column"});
        $("#go3").removeClass("fa-minus").addClass("fa-expand").css("fontSize", "20px");
    }
    if(!$("#TitleChapterBlock2").is(":visible"))
    {
        $("#TitleChapterBlock2").css({"display":"flex","flex-direction":"row","justify-content":"center"});
        chap_header2.css('height','100%');
        $( "#chapterBlock2" ).css({"height":"10%","fontSize": "","borderWidth": ""});
        $( "#block2" ).css({width: "",fontSize: "",borderWidth: ""});
        $("#bookBlock2, #collectionBlock2").css({"display":"flex","flex-direction":"column"});
        $("#go2").removeClass("fa-minus").addClass("fa-expand").css("fontSize", "20px");
    }
    adjustTitleBlock2Height();
    $("#button-container").css("width", "");
    collcontentDivs.addClass("contentDiv").removeClass("expanded");
    bookContentDivs.addClass("contentDiv").removeClass("expanded");
    chapterContentDivs.addClass("expanded").removeClass("contentDiv");
    //let chhtOffset = ($(window).width() >= 1616)? 300: 250;
    //chapterContentDivs.height(((chap_div.parent().height() - coll_div.height() + book_div.height() - chhtOffset)/chap_div.parent().height()) * 100+"vh") ;
    let chhtOffset = ($(window).width() >= 1616)? 150: 120;
    chapterContentDivs.height(((chap_div.parent().height() - chhtOffset)/chap_div.parent().height()) * 100+"vh") ;  
        
})
//////////////////////////////////////////////////////
$( "#TitleChapterBlock2" ).on( "click", function() {
    
    $( "#block1, #TitleChapterBlock2, #collectionBlock2, #bookBlock2" ).css("display", "none");
    $("#TitleBlock2, #block2, #chapterBlock2").css("display","inline-block");

    ////
    $("#TitleCollectionBlock2,#TitleBookBlock2,#TitleBlock1").css({"display":"flex","flex-direction":"row","justify-content":"center"});
    /////
    $( "#chapterBlock2" ).css("width", "100%");
    $( "#block2" ).css("width", "45%");
    $( "#block3" ).css("width", "50%");
    //$( "#chapterBlock2" ).css("height", ($(window).width() >= 1616)?"800px":"510px")
    $( "#chapterBlock2" ).css("height", "92vh");
    
    coll_header2.css('height','');
    book_header2.css('height','');
    chap_header2.css('height','');

    //$( "#block2" ).css({"fontSize": "","borderWidth": ""});
        
    if($("#go2").hasClass("fa-expand"))
    {
        $("#go2").toggleClass("fa-expand fa-minus").css("fontSize", "10px");
        //$("#go2").removeClass("fa-expand").addClass("fa-minus").css("fontSize", "10px");
    }
    if($("#go5").hasClass("fa-minus"))
    {
        $("#go5").toggleClass("fa-minus fa-expand").css("fontSize", "20px");
        //$("#go5").removeClass("fa-minus").addClass("fa-expand").css("fontSize", "20px");
        
    }
    if(!$("#TitleCollectionBlock2").is(":visible"))
    {
        $("#TitleCollectionBlock2").css({"display":"flex","flex-direction":"row","justify-content":"center"});
        coll_header2.css('height','100%');
        $( "#collectionBlock2" ).css({"height": ($(window).width() >= 1616)?"7%":"10%","fontSize": "","borderWidth": ""});
        $( "#block2" ).css({"fontSize": "","borderWidth": ""}); 
        $("#chapterBlock2").css({"display":"flex","flex-direction":"column"});
        $("#go4").removeClass("fa-minus").addClass("fa-expand").css("fontSize", "20px");
    }
    if(!$("#TitleBookBlock2").is(":visible"))
    {
        $("#TitleBookBlock2").css({"display":"flex","flex-direction":"row","justify-content":"center"});
        book_header2.css('height','100%');
        $("#chapterBlock2").css({"display":"flex","flex-direction":"column"});
        $( "#bookBlock2" ).css({"height": ($(window).width() >= 1616)?"7%":"10%","fontSize": "","borderWidth": ""}); 
        $( "#block2" ).css({fontSize: "",borderWidth: ""});
        $("#go3").removeClass("fa-minus").addClass("fa-expand").css("fontSize", "20px");
    }
    if(!$("#TitleBlock1").is(":visible"))
    {
        $("#TitleBlock1").css({"display":"flex","flex-direction":"row","justify-content":"center"});
        coll_header2.css('height','');
        book_header2.css('height','');
        chap_header2.css('height','');
        $( "#block1" ).css({width: "",fontSize: "",borderWidth: ""});
        $("#chapterBlock2").css({"display":"flex","flex-direction":"column"});
        $("#go1").removeClass("fa-minus").addClass("fa-expand").css("fontSize", "20px");
    }
    adjustTitleBlock2Height();
    $("#button-container").css("width", "");
    chapterContentDivs.addClass("expanded").removeClass("contentDiv");
    bookContentDivs.addClass("contentDiv").removeClass("expanded");
    collcontentDivs.addClass("contentDiv").removeClass("expanded");
    //let chhtOffset = ($(window).width() >= 1616)? 150: 120;
    //chapterContentDivs.height(((chap_div.parent().height()- chhtOffset)/chap_div.parent().height()) * 100+"vh") ;
    if($(window).width() >= 1616 && $(window).height() > 1225)
    {
        chapterContentDivs.height(((chap_div.parent().height()- 300)/chap_div.parent().height()) * 100+"vh") ;
    }
    else if($(window).width() >= 1616)
    {
        chapterContentDivs.height(((chap_div.parent().height()- 150)/chap_div.parent().height()) * 100+"vh") ;
    }

    else
    {
        chapterContentDivs.height(((chap_div.parent().height()- 120)/chap_div.parent().height()) * 100+"vh") ;
    }
    
})


/////////////////////////////////////////////////
$( "#TitleBookBlock2" ).on( "click", function() {
    $("#block1, #TitleBookBlock2, #collectionBlock2, #chapterBlock2" ).css("display", "none");

    $("#TitleBlock2, #block2, #bookBlock2").css("display","inline-block");
    ////
    $("#TitleCollectionBlock2,#TitleChapterBlock2,#TitleBlock1").css({"display":"flex","flex-direction":"row","justify-content":"center"});
    ////
    $("#block2").css("width", "45%");
    $("#block3").css("width", "50%");
    $("#bookBlock2" ).css("width", "100%");
    $( "#bookBlock2" ).css("height", "92vh")
    coll_header2.css('height','');
    book_header2.css('height','');
    chap_header2.css('height','');
    if($("#go3").hasClass("fa-expand"))
    {
        $("#go3").toggleClass("fa-expand fa-minus").css("fontSize", "10px");
        //$("#go3").removeClass("fa-expand").addClass("fa-minus").css("fontSize", "10px");
    }
    if($("#go5").hasClass("fa-minus"))
    {
        $("#go5").toggleClass("fa-minus fa-expand").css("fontSize", "20px");
        //$("#go5").removeClass("fa-minus").addClass("fa-expand").css("fontSize", "20px");
    }
    
    if(!$("#TitleCollectionBlock2").is(":visible"))
    {
        $("#TitleCollectionBlock2").css({"display":"flex","flex-direction":"row","justify-content":"center"});
        coll_header2.css('height','100%');
        $( "#collectionBlock2" ).css({"height": ($(window).width() >= 1616)?"7%":"10%","fontSize": "","borderWidth": ""}); 
        $("#bookBlock2").css({"display":"flex","flex-direction":"column"});
        $( "#block2" ).css({"fontSize": "","borderWidth": ""});

        $("#go4").removeClass("fa-minus").addClass("fa-expand").css("fontSize", "20px");
    }
    
    if(!$("#TitleChapterBlock2").is(":visible"))
    {
        $("#TitleChapterBlock2").css({"display":"flex","flex-direction":"row","justify-content":"center"});
        chap_header2.css('height','100%');
        $("#bookBlock2").css({"display":"flex","flex-direction":"column"});
        $( "#chapterBlock2" ).css({"height": ($(window).width() >= 1616)?"7%":"10%","fontSize": "","borderWidth": ""}); 
        $("#go2").removeClass("fa-minus").addClass("fa-expand").css("fontSize", "20px");
        $( "#block2" ).css({fontSize: "",borderWidth: ""});
    }
    if(!$("#TitleBlock1").is(":visible"))
    {
        $("#TitleBlock1").css({"display":"flex","flex-direction":"row","justify-content":"center"});
        coll_header2.css('height','');
        book_header2.css('height','');
        chap_header2.css('height','');
        $( "#block1" ).css({"fontSize": "","borderWidth": ""});
        $("#bookBlock2").css({"display":"flex","flex-direction":"column"});
        $("#go1").removeClass("fa-minus").addClass("fa-expand").css("fontSize", "20px");
    }

    adjustTitleBlock2Height();
    $("#button-container").css("width", "");
    bookContentDivs.addClass("expanded").removeClass("contentDiv");
    collcontentDivs.addClass("contentDiv").removeClass("expanded");
    chapterContentDivs.addClass("contentDiv").removeClass("expanded");
    //let bkhtOffset = ($(window).width() >= 1616)? 300: 250;
    //let bkhtOffset = ($(window).width() >= 1616)? 150: 120;
    //bookContentDivs.height(((book_div.parent().height()- bkhtOffset) / book_div.parent().height() ) * 100 + "vh");
    if($(window).width() >= 1616 && $(window).height() > 1225)
    {
        bookContentDivs.height(((book_div.parent().height()- 300) / book_div.parent().height() ) * 100 + "vh");
    }
    else if($(window).width() >= 1616)
    {
        bookContentDivs.height(((book_div.parent().height()- 150) / book_div.parent().height() ) * 100 + "vh");
    }

    else
    {
        bookContentDivs.height(((book_div.parent().height()- 120) / book_div.parent().height() ) * 100 + "vh");
    }

    //bookContentDivs.height(((book_div.parent().height() - coll_div.height() + chap_div.height() - bkhtOffset) / book_div.parent().height() ) * 100 + "vh");
        

    
})
///////////////////////////////////////////////////
$( "#TitleCollectionBlock2" ).on( "click", function() {
    $( "#block1, #TitleCollectionBlock2, #bookBlock2, #chapterBlock2" ).css("display", "none")
    $("#TitleBlock2, #block2, #collectionBlock2").css("display","inline-block")
    /////
    $("#TitleBookBlock2,#TitleChapterBlock2,#TitleBlock1").css({"display":"flex","flex-direction":"row","justify-content":"center"});
    /////
    $( "#block2" ).css("width", "45%")
    $( "#block3" ).css("width", "50%")
    $( "#collectionBlock2" ).css("width", "100%")
    $( "#collectionBlock2" ).css("height", "92vh")
    ///////
    coll_header2.css('height','');
    book_header2.css('height','');
    chap_header2.css('height','');
    //////
    if($("#go4").hasClass("fa-expand"))
    {
        $("#go4").toggleClass("fa-expand fa-minus").css("fontSize", "10px");
        //$("#go4").removeClass("fa-expand").addClass("fa-minus").css("fontSize", "10px");
    }
    if($("#go5").hasClass("fa-minus"))
    {
        $("#go5").toggleClass("fa-minus fa-expand").css("fontSize", "20px");
        //$("#go5").removeClass("fa-minus").addClass("fa-expand").css("fontSize", "20px");
    }

    if(!$("#TitleBookBlock2").is(":visible"))
    {
        $("#TitleBookBlock2").css({"display":"flex","flex-direction":"row","justify-content":"center"});
        book_header2.css('height','100%');
        $("#collectionBlock2").css({"display":"flex","flex-direction":"column"});
        $( "#bookBlock2" ).css({"height": ($(window).width() >= 1616)?"7%":"10%","fontSize": "","borderWidth": ""}); 
        $( "#block2" ).css({"fontSize": "","borderWidth": ""});
        $("#go3").removeClass("fa-minus").addClass("fa-expand").css("fontSize", "20px");
    }
    
    if(!$("#TitleChapterBlock2").is(":visible"))
    {
        $("#TitleChapterBlock2").css({"display":"flex","flex-direction":"row","justify-content":"center"});
        chap_header2.css('height','100%');
        $("#collectionBlock2").css({"display":"flex","flex-direction":"column"});
        $( "#chapterBlock2" ).css({"height": ($(window).width() >= 1616)?"7%":"10%","fontSize": "","borderWidth": ""}); 
        $( "#block2" ).css({"fontSize": "","borderWidth": ""});
        $("#go2").removeClass("fa-minus").addClass("fa-expand").css("fontSize", "20px");
    }
    if(!$("#TitleBlock1").is(":visible"))
    {
        $("#TitleBlock1").css({"display":"flex","flex-direction":"row","justify-content":"center"});
        coll_header2.css('height','');
        book_header2.css('height','');
        chap_header2.css('height','');
        $("#collectionBlock2").css({"display":"flex","flex-direction":"column"});
        $( "#block1" ).css({"fontSize": "","borderWidth": ""});
        $("#go1").removeClass("fa-minus").addClass("fa-expand").css("fontSize", "20px");
    }
    
    adjustTitleBlock2Height();
    $("#button-container").css("width", "");
    collcontentDivs.addClass("expanded").removeClass("contentDiv");
    bookContentDivs.addClass("contentDiv").removeClass("expanded");
    chapterContentDivs.addClass("contentDiv").removeClass("expanded");
    //let collhtOffset = ($(window).width() >= 1616)? 300: 250;
    let collhtOffset = ($(window).width() >= 1616)? 150: 120;
    collcontentDivs.height(((coll_div.parent().height()- collhtOffset)/ coll_div.parent().height() ) * 100 + "vh");
    //collcontentDivs.height(((coll_div.parent().height() - book_div.height() + chap_div.height() - collhtOffset)/ coll_div.parent().height() ) * 100 + "vh");
    
    
})

    coll_header.on("click", function() {
            
        if(collcontentDivs.hasClass("expanded"))
        {
            
            collcontentDivs.toggleClass("expanded contentDiv");
            chapterContentDivs.addClass("expanded").removeClass("contentDiv");
            $("#chapterBlock2").css("display", "flex");
            $("#chapterBlock2").css("flex-direction", "column");
            coll_div.height(($(window).width() >= 1616)?"7%":"10%");
            book_div.height(($(window).width() >= 1616)?"7%":"10%");
            chap_div.height(($(window).width() >= 1616)?"82%":"73%");  
            coll_header2.height(($(window).width() >= 1616)?'100%':"");
            book_header2.height(($(window).width() >= 1616)?'100%':"");
            chap_header2.css("height","");;
        }else{
            
            if (bookContentDivs.hasClass("expanded")) {
                bookContentDivs.toggleClass("expanded contentDiv");
                book_div.height(($(window).width() >= 1616)?"7%":"10%");
                book_header2.css("height",($(window).width() >= 1616)?"100%":"");
            }
            if (chapterContentDivs.hasClass("expanded")) {
                chapterContentDivs.toggleClass("expanded contentDiv");
                chap_div.height(($(window).width() >= 1616)?"7%":"10%");
                //chap_header2.height(($(window).width() >= 1616)?"100%":"");
                chap_header2.css("height",($(window).width() >= 1616)?"100%":"");
                var checkedtd = $('#chapterTabBody td').filter(function() {
                    return $(this).css('background-color') == chkdBgColor;
                });
                if (checkedtd.length > 0) {$('#chDiv').animate({ scrollTop:  checkedtd.closest('tr').position().top  }, 500);}
            }
            collcontentDivs.removeClass("contentDiv").addClass("expanded");
            coll_header2.css('height','');
            coll_div.height(($(window).width() >= 1616)?"82%":"73%");
        }
        $("#collectionBlock2").css("display", "flex");
        $("#collectionBlock2").css("flex-direction", "column");
        //let colhtOffset = ($(window).width() >= 1616)?300:250;
        let colhtOffset = ($(window).width() >= 1616)?150:120; 
        collcontentDivs.height(((coll_div.parent().height() - colhtOffset)/coll_div.parent().height()) * 100+"vh");
        //collcontentDivs.height((($(coll_div).parent().height() - book_div.height() + chap_div.height() - colhtOffset)/($(coll_div).parent().height())) * 100+"vh");
        
    });
    
    book_header.on("click", function() {
        if(bookContentDivs.hasClass("expanded"))
        {
            bookContentDivs.toggleClass("expanded contentDiv");
            collcontentDivs.addClass("contentDiv").removeClass("expanded");
            chapterContentDivs.addClass("expanded").removeClass("contentDiv");
            ///////
            $("#chapterBlock2").css("display", "flex");
            $("#chapterBlock2").css("flex-direction", "column");
            ///////
            coll_div.height(($(window).width() >= 1616)?"7%":"10%");
            book_div.height(($(window).width() >= 1616)?"7%":"10%");
            chap_div.height(($(window).width() >= 1616)?"82%":"73%"); 
            coll_header2.css("height",($(window).width() >= 1616)?"100%":"");
            book_header2.css("height",($(window).width() >= 1616)?"100%":"");
            chap_header2.css("height","");; 
        }
        else{
            if(collcontentDivs.hasClass("expanded"))
            {
                collcontentDivs.toggleClass("expanded contentDiv");
                coll_div.height(($(window).width() >= 1616)?"7%":"10%");
                coll_header2.css("height",($(window).width() >= 1616)?"100%":"");
            }
            if(chapterContentDivs.hasClass("expanded"))
            {
                chapterContentDivs.toggleClass("expanded contentDiv");
                chap_div.height(($(window).width() >= 1616)?"7%":"10%");
                //chap_header2.height(($(window).width() >= 1616)?"100%":"");
                chap_header2.css("height",($(window).width() >= 1616)?"100%":"");
            }
            bookContentDivs.removeClass("contentDiv").addClass("expanded");
            book_div.height(($(window).width() >= 1616)?"82%":"73%"); 
            book_header2.css('height','');
        }
        ///////
        $("#bookBlock2").css("display", "flex");
        $("#bookBlock2").css("flex-direction", "column");
        ///////
        //let bkhtOffset = ($(window).width() >= 1616)?300:250; 
        //bookContentDivs.height((($(book_div).parent().height() - coll_div.height() + chap_div.height() - bkhtOffset) / ($(book_div).parent().height() )) * 100 + "vh");
        let bkhtOffset = ($(window).width() >= 1616)?150:120; 
        bookContentDivs.height(((book_div.parent().height()- bkhtOffset) / book_div.parent().height() ) * 100 + "vh");
        
        
        var checkedtd = $('#chapterTabBody td').filter(function() {
                    return $(this).css('background-color') == chkdBgColor;
        });
        if (checkedtd.length > 0) {
            $('#chDiv').animate({ scrollTop:  checkedtd.closest('tr').position().top  }, 500);}
            var chdbooktd = $('#bookTabBody td').filter(function() {
                    return $(this).css('background-color') == chkdBgColor;
            });
            if (chdbooktd.length > 0) {
                $('#bkDiv').animate({ scrollTop:  chdbooktd.closest('tr').position().top  }, 500);}

    });
    
    chap_header.on("click", function() {
        if(chapterContentDivs.hasClass("expanded"))
        {
            bookContentDivs.addClass("contentDiv").removeClass("expanded");
            collcontentDivs.addClass("contentDiv").removeClass("expanded");
            $("#chapterBlock2").css("display", "flex");
            $("#chapterBlock2").css("flex-direction", "column");
            coll_div.height(($(window).width() >= 1616)?"7%":"10%");
            book_div.height(($(window).width() >= 1616)?"7%":"10%");
            chap_div.height(($(window).width() >= 1616)?"82%":"73%"); 
            coll_header2.css("height",($(window).width() >= 1616)?"100%":"");
            book_header2.css("height",($(window).width() >= 1616)?"100%":"");  
            chap_header2.css("height","");        
        }else{
            if(collcontentDivs.hasClass("expanded"))
            {
                //collcontentDivs.classList.add("contentDiv");
                //collcontentDivs.classList.remove("expanded");
                //collcontentDivs.toggleClass("expanded contentDiv");
                collcontentDivs.addClass("contentDiv").removeClass("expanded");
                coll_header2.css('height','100%');
                coll_div.height(($(window).width() >= 1616)?"7%":"10%");
            }
            if(bookContentDivs.hasClass("expanded"))
            {
                // bookContentDivs.classList.add("contentDiv");
                //bookContentDivs.classList.remove("expanded");
                //bookContentDivs.toggleClass("expanded contentDiv");
                bookContentDivs.addClass("contentDiv").removeClass("expanded");
                book_header2.css("height",($(window).width() >= 1616)?"100%":"");
                book_div.height(($(window).width() >= 1616)?"7%":"10%");
            }
            chapterContentDivs.removeClass("contentDiv").addClass("expanded");
            chap_header2.css("height","");
            chap_div.height(($(window).width() >= 1616)?"82%":"73%"); 

        }
        ///////
        $("#chapterBlock2").css("display", "flex");
        $("#chapterBlock2").css("flex-direction", "column");
        ///////
        //let chhtOffset = ($(window).width() >= 1616)?300:250;
        //chapterContentDivs.height((($(chap_div).parent().height() - coll_div.height() + book_div.height() - chhtOffset)/($(chap_div).parent().height())) * 100+"vh") ;
        let chhtOffset = ($(window).width() >= 1616)?150:120;
        chapterContentDivs.height(((chap_div.parent().height()- chhtOffset)/chap_div.parent().height()) * 100+"vh") ;
        //alert(chapterContentDivs.height());
        var checkedtd = $('#chapterTabBody td').filter(function() {
            return $(this).css('background-color') == chkdBgColor;
        });
        if (checkedtd.length > 0) {$('#chDiv').animate({ scrollTop:  checkedtd.closest('tr').position().top  }, 500);}
    });
    // Function to update styles based on screen size
    function updateStyles(mq) {
        if (mq.matches) {
            
            if($("#go4").hasClass("fa-minus"))
            {
                $( "#collectionBlock2" ).css("height",  "92vh")
                //collcontentDivs.height((($(coll_div).parent().height() - book_div.height() + chap_div.height() - 300)/($(coll_div).parent().height())) * 100+"vh");
                collcontentDivs.height(((coll_div.parent().height() - 150)/coll_div.parent().height()) * 100+"vh");
                
            }
            if($("#go3").hasClass("fa-minus"))
            {
                $( "#bookBlock2" ).css("height",  "92vh")
                //bookContentDivs.height(((book_div.parent().height()  - 150) / book_div.parent().height()) * 100 + "vh");
                if($(window).width() >= 1616 && $(window).height() > 1225)
                {
                    bookContentDivs.height(((book_div.parent().height()- 300) / book_div.parent().height() ) * 100 + "vh");
                }
                else if($(window).width() >= 1616)
                {
                    bookContentDivs.height(((book_div.parent().height()- 150) / book_div.parent().height() ) * 100 + "vh");
                }
                else
                {
                    bookContentDivs.height(((book_div.parent().height()- 120) / book_div.parent().height() ) * 100 + "vh");
                }
                //bookContentDivs.height((($(book_div).parent().height() - coll_div.height() + chap_div.height() - 300) / ($(book_div).parent().height())) * 100 + "vh");
                //bookContentDivs.height($(book_div).parent().height() - (coll_div.height() + chap_div.height() + 100));
            }
            if($("#go2").hasClass("fa-minus"))
            {
                $( "#chapterBlock2" ).css("height",  "92vh")
                chapterContentDivs.height(((chap_div.parent().height()  - 150)/chap_div.parent().height()) * 100 + "vh") ;
                //chapterContentDivs.height((($(chap_div).parent().height() - coll_div.height() + book_div.height() - 300)/($(chap_div).parent().height())) * 100 + "vh") ;
                //chapterContentDivs.height($(chap_div).parent().height() - (coll_div.height() + book_div.height() + 100)) ;
            }
            if((collcontentDivs.hasClass("expanded")) && ($("#go4").hasClass("fa-expand")))
            {
                coll_div.height("82%");
                book_div.height("7%");
                chap_div.height("7%");
                coll_header2.css('height','');
                book_header2.css('height','100%');
                chap_header2.css('height','100%');
                if($(window).height() >1100)
                {
                    collcontentDivs.height(((coll_div.parent().height() - 400)/coll_div.parent().height()) * 100+"vh");
                }
                else
                {
                    collcontentDivs.height(((coll_div.parent().height() - 300)/coll_div.parent().height()) * 100+"vh");
                }
                
                //collcontentDivs.height((($(coll_div).parent().height() - book_div.height() + chap_div.height() - 300)/($(coll_div).parent().height())) * 100+"vh");
               
            }
            if((bookContentDivs.hasClass("expanded"))&& ($("#go3").hasClass("fa-expand")))
            {
                coll_div.height("7%");
                book_div.height("82%");
                chap_div.height("7%");
                coll_header2.css('height','100%');
                book_header2.css('height','');
                chap_header2.css('height','100%');
                if($(window).height() >1100)
                {
                    bookContentDivs.height(((book_div.parent().height() - 600) / book_div.parent().height()) * 100 + "vh");
                }
                else{
                    bookContentDivs.height(((book_div.parent().height() - 300) / book_div.parent().height()) * 100 + "vh");
                }
                
                
                //bookContentDivs.height((($(book_div).parent().height() - coll_div.height() + chap_div.height() - 300) / ($(book_div).parent().height())) * 100 + "vh");
                //alert("hello"+bookContentDivs.height());
                //bookContentDivs.height($(book_div).parent().height() - (coll_div.height() + chap_div.height() + 105)) 
            }
            if((chapterContentDivs.hasClass("expanded"))&& ($("#go2").hasClass("fa-expand")))
            {
                
                coll_div.height("7%");
                book_div.height("7%");
                chap_div.height("82%");
                coll_header2.css('height','100%');
                book_header2.css('height','100%');
                chap_header2.css('height','');
                if($(window).height() >1100)
                {
                   // alert("hello")
                    chapterContentDivs.height(((chap_div.parent().height() - 600)/chap_div.parent().height()) * 100+"vh") ;
                }
                else{
                    chapterContentDivs.height(((chap_div.parent().height() - 300)/chap_div.parent().height()) * 100+"vh") ;
                }
                
                
                //chapterContentDivs.height((($(chap_div).parent().height() - coll_div.height() + book_div.height() - 300)/($(chap_div).parent().height())) * 100+"vh") ;
                
            }
            
        } else {
            if($("#go4").hasClass("fa-minus"))
            {
                $( "#collectionBlock2" ).css("height",  "92vh")
                collcontentDivs.height(((coll_div.parent().height() - 120)/coll_div.parent().height()) * 100+"vh");
                //collcontentDivs.height((($(coll_div).parent().height() - book_div.height() + chap_div.height() - 250)/($(coll_div).parent().height())) * 100+"vh");
                
            }
            if($("#go3").hasClass("fa-minus"))
            {
                $( "#bookBlock2" ).css("height",  "92vh")
                bookContentDivs.height(((book_div.parent().height() - 120) / book_div.parent().height()) * 100 + "vh");
                //bookContentDivs.height((($(book_div).parent().height() - coll_div.height() + chap_div.height() - 250) / ($(book_div).parent().height() )) * 100 + "vh");
                //bookContentDivs.height($(book_div).parent().height() - (coll_div.height() + chap_div.height() + 100));
            }
            if($("#go2").hasClass("fa-minus"))
            {
                $( "#chapterBlock2" ).css("height",  "92vh")
                chapterContentDivs.height(((chap_div.parent().height() - 120)/chap_div.parent().height() ) * 100 + "vh") ;
                //chapterContentDivs.height((($(chap_div).parent().height() - coll_div.height() + book_div.height() - 250)/($(chap_div).parent().height() )) * 100 + "vh") ;
        //chapterContentDivs.height($(chap_div).parent().height() - (coll_div.height() + book_div.height() + 100)) ;
            }
            if((collcontentDivs.hasClass("expanded")) && ($("#go4").hasClass("fa-expand")))
            {
                coll_div.height("73%");
                book_div.height("10%");
                chap_div.height("10%");
                coll_header2.css('height','');
                book_header2.css('height','100%');
                chap_header2.css('height','100%');
                collcontentDivs.height(((coll_div.parent().height() - 250)/coll_div.parent().height()) * 100+"vh");
                //collcontentDivs.height((($(coll_div).parent().height() - book_div.height() + chap_div.height() - 250)/($(coll_div).parent().height())) * 100+"vh");
            }
            if((bookContentDivs.hasClass("expanded")) && ($("#go3").hasClass("fa-expand")))
            {
                coll_div.height("10%");
                book_div.height("73%");
                chap_div.height("10%");
                coll_header2.css('height','100%');
                book_header2.css('height','');
                chap_header2.css('height','100%');
                //bookContentDivs.height((($(book_div).parent().height() - coll_div.height() + chap_div.height() - 250) / ($(book_div).parent().height() )) * 100 + "vh");
                bookContentDivs.height(((book_div.parent().height()  - 250) / book_div.parent().height() ) * 100 + "vh");
                
            }
            if((chapterContentDivs.hasClass("expanded")) && ($("#go2").hasClass("fa-expand")))
            {
                coll_div.height("10%");
                book_div.height("10%");
                chap_div.height("73%");
                coll_header2.css('height','100%');
                book_header2.css('height','100%');
                chap_header2.css('height','');
                chapterContentDivs.height(((chap_div.parent().height() - 250)/chap_div.parent().height() ) * 100 + "vh") ;
                //chapterContentDivs.height((($(chap_div).parent().height() - coll_div.height() + book_div.height() - 250)/($(chap_div).parent().height() )) * 100 + "vh") ;
            }
        }
        adjustTitleBlock2Height()
    }




    // Initial check and update styles
    var mq = window.matchMedia('(min-width: 1616px),(max-width: 1240px)');
    updateStyles(mq);
    // Add event listener for window resize
    window.addEventListener('resize', function() {
    updateStyles(mq);
    });
////////////////////////////////////////////////////////
    var checkedtd = $('#chapterTabBody td').filter(function() {
        return $(this).css('background-color') == chkdBgColor;
    });
    if (checkedtd.length > 0) {$('#chDiv').animate({ scrollTop:  checkedtd.closest('tr').position().top  }, 500);}
});
