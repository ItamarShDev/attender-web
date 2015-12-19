(function($){
	$(function(){
		$('.button-collapse').sideNav();
		$('.parallax').parallax();
		$('.tooltipped').tooltip({delay: 50});
		$('#emptylist').hide();
        $("#registerer").hide();
		$('#loader').show();
        $(window).scroll(function(){
       if(!userID) {
		   $("#registerer").show();
	   }
        if($(window).scrollTop()==0)
        {
           $("#registerer").hide();
        }
    });
		$('.dropdown-button').dropdown({
			inDuration: 300,
			outDuration: 225,
            constrain_width: true, // Does not change width of dropdown to that of the activator
            gutter: 0, // Spacing from edge
            belowOrigin: true // Displays dropdown below the button
    }
    );

        $('.collapsible').collapsible({
            accordion : true// A setting that changes the collapsible behavior to expandable instead of the default accordion style
        });

	getlist();
  }); // end of document ready
})(jQuery); // end of jQuery name space
//encryption
String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

//page vars
var eventlist = [];
var userID = "";
var pageNum = 1;
var eventApiRequest = {};
var maxNum = 5;
var maxPage, minPage;
var attendingList = [];
var user_name;
if (storageAvailable('localStorage')) {
	userID = localStorage.getItem("userID");
    if (userID)
    {
		$("#logoutbutton").show();
        Materialize.toast('Logged in as '+localStorage.getItem('userName'), 3000);
        getCal();
    }
}
else {
	alert("No Local Storage");
}

function storageAvailable(type) {
	try {
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e) {
		return false;
	}
}
function getUserName(id, blessing)
{

    $.ajax({
		url:"https://attender-web.appspot.com/userdetails",
		data: "token="+id ,
		type: "GET",
		dataType: "json",
		success: function(response, message, jq){
            var temp = response;
            user_name = temp[0].name.toString() +" "+temp[0].lastname.toString();
            localStorage.setItem("userName", user_name);
			Materialize.toast(blessing+" "+user_name, 5000);
		},
		error: function(response, text, message){
			ocument.getElementById("errormessage").innerHTML = response.responseText;
			$("#errormodal").openModal();
		}
});
}
//server AJAX calls
function login()
{
    var code = btoa($("#password").val());
	$.ajax({
		url:"https://attender-web.appspot.com/userlogin",
		data: "email="+$("#email").val()+"&password=\'"+code+"\'" ,
		type: "GET",
		dataType: "json",
		success: function(response, message, jq){
           $("#logoutbutton").show();
            userID = response;
            getCal();
            localStorage.setItem("userID", response);
           	getUserName(userID,'Welcome Back');
            getlist();
		},
		error: function(response, text, message){
			document.getElementById("errormessage").innerHTML = response.responseText;
			$("#errormodal").openModal();
		}
	});
}

function register()
{
    var code = btoa($("#password2").val());
	$.ajax({
		url:"https://attender-web.appspot.com/userlogin",
		data: "firstname="+$("#firstname").val()+"&lastname="+$("#lastname").val()+"&email="+$("#email2").val()+"&password=\'"+code+"\'",
		type: "GET",
		dataType: "json",
		success: function(response, message, jq){
           $("#logoutbutton").show();
            getUserName(response, 'Welcome');
			userID  = response;
            localStorage.setItem("userID", response);
            getCal();
            getlist("");

		},
		error: function(response, text, message){
			document.getElementById("errormessage").innerHTML = response.responseText;
			$("#errormodal").openModal();
		}
	});
}

function logout(){
	if(userID)
	{
		userID = "";
        localStorage.removeItem("userID");
		localStorage.removeItem("userName");
        Materialize.toast('Logged Out', 2000);
        $("#logoutbutton").hide();
		$("#registerer").show();
		getlist("");
	}
	else{
		Materialize.toast('Cant Log Out Before Login', 5000);
	}
}

function getlist(apiData)
{
	$("#loader").show();
	if (apiData)
	{
		sendData = formatApiCall();
	}
	else
		sendData = "";
	$.ajax({
		url: '/api',
		type: "GET",
		data: sendData,
		contentType : 'text/html; charset=utf-8',
		dataType: "json",
		statusCode:{
			400: function(){
				$(".collapsible").hide();
				$(".pagination").hide();
				$("#loader").hide();
				$("#emptylist").show();
			}
		},
		success: function(response, message, jq){
			eventlist = response;
			$("#loader").hide();
			$("#emptylist").hide();
			setPagination();
			$(".pagination").show();
			changePage(1, true);
			$(".collapsible").show();
            		}
	});
}

function formatApiCall() {
    result = "";
    if (eventApiRequest.city) {
        result += "city=" + eventApiRequest.city + "&";
        $("#nocity").show();
    }
    if (eventApiRequest.category) {
        result += "category=" + eventApiRequest.category + "&";
        $("#nocategory").show();
    }
    if (eventApiRequest.time) {
        result += "time=" + eventApiRequest.time;
        $("#notime").show();
    }
    if (eventApiRequest.city == "")
        $("#nocity").hide();

    if (eventApiRequest.category == "")
        $("#nocategory").hide();
    if(eventApiRequest.time=="")
        $("#notime").hide();
	return result;
}


function getCal()
{
	var token = "token="+userID;
    var templist = [];
	$.ajax({
		url: '/calendar',
		type: "GET",
		data: token,
		contentType : 'text/html; charset=utf-8',
		dataType: "json",
		statusCode:{

		},
		success: function(response, message, jq){
            templist = response;
            setList(templist);
		}
	});

}

function setList(list)
{
    var event = 0;
    for (event;event<list.length;event++)
    {
        attendingList.push(list[event].id);
    }
        console.log(JSON.stringify(attendingList));
}
function attend(eventNum, toAttend)
{
	var attender = {
		"isAttend":"",
		"token":userID,
		"eventid":eventNum
	};
	if(toAttend==true)
	{
		attender.isAttend="true";
	}
	else{
		attender.isAttend="false";
	}
	var toSend = "isAttend="+attender.isAttend+"&token="+attender.token+"&eventid="+attender.eventid;
	$.ajax({
		url: "/attend",
		data: toSend,
		type: "GET",
		success: function (response, message, jq) {
		},
		statusCode:{
			200: function() {
				if(attender.isAttend=='true')
					Materialize.toast('RSVP\'d', 3000);
				else
					Materialize.toast('Not Going', 3000);

			}
		}

	});
}


function getId(eventN){
	return eventlist[pageNum*10+eventN].id;
}


function apiCall(city, time, type)
{
    if(city == "none")
		eventApiRequest.city = "";
	else if (city)
		eventApiRequest.city = city;
    if(time == "none")
		eventApiRequest.time= "";
	else if(time)
		eventApiRequest.time=time;

    if(type == "none")
		eventApiRequest.category= "";
	else if(type)
		eventApiRequest.category = type;

	getlist(eventApiRequest);
}



	// list handlers	

	function changePage(page) {
		pageNum = page;
		var list = document.getElementById("list");
		while (list.firstChild) {
			list.removeChild(list.firstChild);
		}
		for (i = 1; i < 11; i++) {

			if(i+10*(page-1)<eventlist.length)
			{

				var loc = 10 *(page-1) + i;
				var date = new Date(eventlist[loc].date);
				var li = document.createElement("li");
                li.setAttribute("id","event"+i);
				var collapsible = document.createElement("div");
				collapsible.setAttribute("class", "collapsible-header");
                var name = document.createElement("div");
                name.setAttribute("class", "truncate col s12 m9 l7 flow-text");
                name.innerHTML =  '<i class="material-icons">info</i>' + eventlist[loc].name;
                name.setAttribute("id", "name"+i);
                var time = document.createElement("div");
                time.setAttribute("class", "truncate col l2 hide-on-med-and-down");
                time.setAttribute("id", "time"+i);
                time.innerHTML =  '<i class="material-icons">query_builder</i>' + date.toLocaleString('en-GB',{month: 'numeric', day:'numeric',hour: '2-digit', minute:'2-digit'});
                var place = document.createElement("div");
                place.setAttribute("class", "truncate col m3 l3 hide-on-small-only left");
                place.setAttribute("id", "place"+i);

                place.innerHTML = '<i class="material-icons">location_on</i>' + eventlist[loc].city;
                var info = document.createElement("div");
                info.innerHTML= eventlist[loc].description;
                info.setAttribute("class", "col s12");
                var body = document.createElement("div");
				body.setAttribute("class", "collapsible-body");
                var p = document.createElement("p");
                p.appendChild(info);
                body.appendChild(p);
                var attendCheck = document.createElement("div");
                attendCheck.setAttribute("class", "right-align");
                var attendinput = document.createElement("input");
                attendinput.setAttribute("type", "checkbox");
                attendinput.setAttribute("id", "test"+i);
                attendinput.setAttribute("onchange","changed("+i+","+eventlist[loc].id+")");
                if ($.inArray(eventlist[loc].id ,attendingList)!=-1)
                {
                    attendinput.setAttribute('checked','checked');

                }
                else if(!userID)
                {
                    attendinput.setAttribute('checked','checked');
                    attendinput.setAttribute('disabled','disabled');
                }
                var label = document.createElement("label");
                label.setAttribute("for","test"+i );
                label.setAttribute("id", "label"+i);
                label.innerHTML = "Attend";
                attendCheck.appendChild(attendinput);
                attendCheck.appendChild(label);
                body.appendChild(attendCheck);
                collapsible.appendChild(name);
                    collapsible.appendChild(time);
                    collapsible.appendChild(place);
                list.appendChild(li);
                li.appendChild(collapsible);
                li.appendChild(body);

            }
	}
    this.$('.collapsible').collapsible();
        //this.$('.checkbox').checkbox();
        Materialize.fadeInImage('#list');

	pageNum = page;
	var prev = document.getElementById("returnPage");
	if (page > 1) {
		prev.setAttribute("class", "waves-effect");
	}
	else if(page==1)
	{
		prev.setAttribute("class", "disabled");
		//document.getElementById('returnPage').removeAttribute("onclick");
	}
	if(page==maxNum)
	{
		var next = document.getElementById("pageForward");
		next.setAttribute("class", "disabled");
		//document.getElementById('pageForward').removeAttribute("onclick");
	}
	var max = 5;
	if (max>maxNum)
		max = maxNum;
	for (i = 1; i <= 5; i++) {
		var curPage =   document.getElementById("pagebutton"+(i));
		var pagename = curPage.getAttribute("name");
		if(pagename>maxNum)
		{
			document.getElementById("pagebutton"+(i)).setAttribute("class", "disabled");
		}
		else
		{

			if(i!=5)
			{

				if (i == page%5) {
					document.getElementById("pagebutton" + i).setAttribute("class", "active");
				}
				else {
					document.getElementById("pagebutton" + i).setAttribute("class", "waves-effect");
				}
			}
			else if(i==5)
			{
				if (page%5==0) {
					document.getElementById("pagebutton" + i).setAttribute("class", "active");
				}
				else {
					document.getElementById("pagebutton" + i).setAttribute("class", "waves-effect");
				}

			}
		}
	}
	var coll = document.getElementsByClassName("collapsible-body");
	for (var i = 0;i<coll.length;i++)
	{
		coll[i].setAttribute("style","display: none;");
	}
	coll = document.getElementsByClassName("collapsible-header active");
	for (i = 0;i<coll.length;i++)
	{
		coll[i].setAttribute("class","collapsible-header");
	}

}
function changed(page, num)
{
     if($("#test"+page).is(":checked")) {
			if (userID != "") {
				attend(num, true);
			}
			else {
				Materialize.toast('<span>Please Login</span><a class="btn-flat yellow-text" onclick = "$(&quot;#modal1&quot;).openModal()">Login<a>', 3000);
				$(this).attr("checked", false);
			}
		}
        else
		attend(num,false);
}


function nextPage()
{
	if(pageNum<maxPage)
		changePage(pageNum+1);
	else
	{
		if(pageNum<maxNum)
		{

			for(var i = 1;i<=5;i++)
			{
				document.getElementById("pagebutton"+(i)).innerHTML = '<a href="#!"  >'+(i+pageNum)+'</a>';
				document.getElementById("pagebutton"+(i)).setAttribute('name',(i+pageNum));
				if(i+pageNum<=maxNum)
					document.getElementById("pagebutton"+(i)).setAttribute("onclick", "changePage("+(i+pageNum)+")");
				else{
					document.getElementById("pagebutton"+(i)).removeAttribute("onclick");
				}
			}
			pageNum++;
			maxPage+=5;
			minPage+=5;
			changePage(pageNum);
		}
	}
}

function prevPage()
{
		if(pageNum>minPage)
		changePage(pageNum-1);
	else
	{
		if(pageNum>1)
		{

			for(var i = 5;i>=1;i--)
			{
				document.getElementById("pagebutton"+(i)).innerHTML = '<a href="#!"  >'+(pageNum-(6-i))+'</a>';
				document.getElementById("pagebutton"+(i)).setAttribute('name',(i+pageNum));
				if(pageNum-i>=1)
					document.getElementById("pagebutton"+(i)).setAttribute("onclick", "changePage("+(pageNum-(6-i))+")");
				else{
					document.getElementById("pagebutton"+(i)).removeAttribute("onclick");
				}
			}
			pageNum--;
			maxPage-=5;
			minPage-=5;
			changePage(pageNum);
		}
	}
}

function setPagination()
{
	var list = document.getElementById("pageButtons");
	while (list.firstChild) {
		list.removeChild(list.firstChild);
	}
	if (eventlist.length <10)
		maxNum = 1;
	else {
		maxNum = parseInt(eventlist.length / 10);
		if (eventlist.length %10 >0)
			maxNum++;
	}
	var buttonList = document.getElementById("pageButtons");
	var active = "disabled";
	var element = document.createElement("li");
	element.setAttribute("class", active);
	element.setAttribute("id", "returnPage");
	element.setAttribute("onclick", "prevPage()");
	element.innerHTML = '<a href="#!"><i class="material-icons">chevron_left</i></a>';
	buttonList.appendChild(element);
	var firstpage = 1;
	var max = 5;
	if (maxNum<5)
		max = maxNum;
	minPage= firstpage;
	maxPage= max;
	for (var i =firstpage; i<=max;i++)
	{
		active = "waves-effect";
		if(i==1)
			active = 'active waves-effect';
		var button = document.createElement("li");
		button.setAttribute("class", active);
		button.setAttribute('name',i);
		button.setAttribute("id", "pagebutton"+i%(firstpage+max));
		button.setAttribute("onclick", "javascript:changePage("+i+")");
		button.innerHTML = '<a href="#!"  >'+i+'</a>';
		buttonList.appendChild(button);
	}
	currentMaxPage = max;
	if (maxNum>1)
		active = "waves-effect";
	else
		active = "disabled";

	element = document.createElement("li");
	element.setAttribute("class", active);
	element.setAttribute("id", "pageForward");
	element.setAttribute("onclick", "nextPage()");
	element.innerHTML = '<a href="#!"><i class="material-icons">chevron_right</i></a>';
	buttonList.appendChild(element);

}



function isAttending(eventNo) {
	if (userID != "") {
		var cal = getCal();
		for (var index = 0; index < cal.length; ++index) {
			var event = cal[index];

			if (event.id == getId(eventNo))
				return true;
		}
		return false;

	}
	return false;
}

	$('#loader')
	.hide()
	.ajaxStart(function()
	{
		$(this).show();
	})
	.ajaxStop(function(){
		$(this).hide();
	});

	$("#city").change(function(){
		alert("changed");
	});