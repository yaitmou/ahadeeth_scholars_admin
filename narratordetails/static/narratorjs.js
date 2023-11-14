$(document).ready(function(){
    ///////////Button to add narrator name////////////////////////////////////
$("#chainTable").on('click','button.addname', function() {
//bid = $(this).attr('id')
bid=$('input[name=authid]').val()
var a=0
var st =0
$('#btnDiv input[name="input_text[]"]').each(function(){

 st = parseInt($(this).attr('class'))
 a=0
 
 if($('#btnDiv input[class="'+$(this).attr('class')+'"]').eq(a).val().trim()=="")
     $('#btnDiv input[class="'+$(this).attr('class')+'"]').eq(a).remove()
});

if($('.'+bid).length==0)
{
$("#btnDiv").append('<input name="input_text[]" id="input_text" class="'+bid +'" type=text/>');
$('input[type="submit"]').removeAttr('disabled');
$('input[type="submit"]').addClass('sbtbtn active');
$('.'+bid).focus();
}

else
{
var b=0;
$('.'+bid).each(function(){
if($(this).val().length==0)
{
 b=1;
 return false;
}
});
if(b==0)
{
$("#btnDiv").append('<input name="input_text[]" id="input_text" class="'+bid +'" type=text/>');
$('input[type="submit"]').removeAttr('disabled');
$('input[type="submit"]').addClass('sbtbtn active');
$('.'+bid).focus();
}
}
});
// ///////////
$('.del').on('click',function(){
var_name = $(this).closest('td').prev('td').text()
ind = $(this).closest('td').prev('td').index()
cl_ind = $(this).closest('td').index()

$.ajax({url:"/delVarriation",
type:"post",
dataType:'json',
data:{author:$('input[name=authid]').val(),varr_auth:var_name},
success:function(result){
$("#varrow").find("td").eq(ind).html("")
$("#varrow").find("td").eq(cl_ind).html("")

}
});
})          

});
