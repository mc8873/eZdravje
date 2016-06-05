
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";
var visine=[];
var visineDatum=[];
var teze=[];
var tezeDatum=[];
var pritisk = false;
var vrocina = false;
window.onload = generiraj();

/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}



/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
 
 function generiraj(){
     generirajPodatke(1);
     generirajPodatke(2);
     generirajPodatke(3);
 }
 

function initMap() {
    var map;
    var infowindow;
   document.getElementById('map').className = 'map2';
    var mapDiv = document.getElementById('map');
    var map = new google.maps.Map(mapDiv, {
         center: {lat: 46.0501, lng: 14.505},
         zoom: 12
    });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      map.setCenter(pos);
      var service = new google.maps.places.PlacesService(map);
      service.nearbySearch({
        location: pos,
        radius: 4000,
        type: ['pharmacy']
      }, callback);

        function callback(results, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
              createMarker(results[i]);
            }
          }
        }
        
        function createMarker(place) {
          var placeLoc = place.geometry.location;
          var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location
          });
        
          google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(place.name);
            infowindow.open(map, this);
          });
        }
 
    }, function() {
      handleLocationError(true, infowindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infowindow, map.getCenter());
  }
}


function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}
 
function generirajPodatke(stPacienta) {
    var sessionId = getSessionId();
    var bolnik;
    if(stPacienta==1)
        bolnik=[["Dwyane"],["Wade"],["1982-01-17T13:37"],["1989-02-14T14:27Z","1992-06-22T11:40Z","1996-01-21T08:30Z","2000-11-24T09:20Z","2014-04-01T10:00Z"],[130,160,185,193,193],[25,50,75,85,100],[36,36,36,36,36],[120,122,125,121,120],[80,85,87,90,85],[60,70,65,65,65],["Dill Doe","Dill Doe","Dill Doe","Dill Doe","Dill Doe"]];
    else if(stPacienta==2)
        bolnik=[["George"],["Costanza"],["1959-09-23T14:00"],["1982-02-14T14:27Z","1995-06-22T11:40Z","1996-01-21T08:30Z","2000-11-24T09:20Z","20014-04-01T10:00Z"],[168,168,168,168,168],[80,95,110,115,120],[36,36,36,36,36],[120,130,135,140,160],[80,85,100,110,115],[60,70,65,40,40],["Jonas Žnidaršič","Jonas Žnidaršič","Jonas Žnidaršič","Jonas Žnidaršič","Jonas Žnidaršič"]];
    else
        bolnik=[["Justin"],["Bieber"],["1994-03-01T20:07"],["1999-01-01T00:00Z","2002-05-21T12:45Z","2004-02-22T11:30Z","2009-10-22T09:30Z","2016-06-02T10:00Z"],[100,120,140,160,175],[20,25,30,50,70],[36,36,36,36,38],[120,122,125,121,120],[80,85,87,90,85],[60,70,65,65,65],["Migela Pojela","Migela Pojela","Migela Pojela","Migela Pojela","Migela Pojela"]];

  var ehrId = "";
  $.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        var ehrId = data.ehrId;
		        var partyData = {
		            firstNames: bolnik[0][0],
		            lastNames: bolnik[1][0],
		            dateOfBirth: bolnik[2][0],
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        
		        $.ajax({
		            
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                $("#preberiObstojeciEHR").append("<option value="+ehrId+">"+bolnik[0][0] + " " + bolnik[1][0]+"</option>");
		                for(var i=0; i<bolnik[3].length; i++)
		                    dodajVitalne(ehrId,bolnik[3][i],bolnik[4][i],bolnik[5][i],bolnik[6][i],bolnik[7][i],bolnik[8][i],bolnik[9][i],bolnik[10][i]);
		            
		            },
		            error: function(err) {
		            	
		            }
		        });
		    }
		});

    $("#preberiEHRid").val(ehrId);
  return ehrId;
}

function dodajVitalne(ehrId, datumInUra,telesnaVisina,telesnaTeza,telesnaTemperatura,sistolicniKrvniTlak,diastolicniKrvniTlak,nasicenostKrviSKisikom,merilec){
    var sessionId = getSessionId();
    $.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
			// Struktura predloge je na voljo na naslednjem spletnem naslovu:
      // https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "ctx/time": datumInUra,
		    "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
		    "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
		   	"vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
		    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
		    "vital_signs/blood_pressure/any_event/systolic": sistolicniKrvniTlak,
		    "vital_signs/blood_pressure/any_event/diastolic": diastolicniKrvniTlak,
		    "vital_signs/indirect_oximetry:0/spo2|numerator": nasicenostKrviSKisikom
		};
		var parametriZahteve = {
		    ehrId: ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		    committer: merilec
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		       
		    },
		    error: function(err) {
		    	
		    }
		});
}

function prikaziZdravila(){
    $("#seznamZdravil").html("");
    var zdravilaVrocina = [["Vročina","Daleron","Ne"],["Vročina","Lekadol","Ne"],["Vročina","CalciumvitaC","Ne"],["Vročina","Septobene","Ne"]];
    var zdravilaPritisk = [["Visok krvni tlak","Amlessa","Da"],["Visok krvni tlak","Prenessa","Da"]];
    var rezults="";
    if(pritisk==false && vrocina==false){
        results="<h3>Glede na vaše simptome vam ne moremo priporočiti nobenih zdravil.</h3>"
    }
    else{
        	results = "<table class='table table-striped table-hover'>" +
                  "<tr><th class='text-left'>Simptom</th><th class='text-center'>Zdravilo</th><th class='text-right'>" +
                  "Recept</th></tr>";
					    	if (vrocina) {
						        for (var i=0; i<zdravilaVrocina.length; i++) {
						            results += "<tr><td class='text-left'>" +zdravilaVrocina[i][0] +
                                    "</td><td class='text-center'>" +zdravilaVrocina[i][1] +
                                    "</td><td class='text-right'>" +
                                    zdravilaVrocina[i][2]+ "</td>";
						        }
					    	}
					    	if (pritisk) {
						        for (var i=0; i<zdravilaPritisk.length; i++) {
						            results += "<tr><td class='text-left'>" +zdravilaPritisk[i][0] +
                                    "</td><td class='text-center'>" +zdravilaPritisk[i][1] +
                                    "</td><td class='text-right'>" +
                                    zdravilaPritisk[i][2]+ "</td>";
						        }
					    	}
						        results += "</table><div class='alert alert-danger'><strong>POZOR: </strong>Pred uporabo se posvetujte z zdravnikom ali farmacevtom!</div>";
    }
    $("#seznamZdravil").append(results);
}

function parsajDatum(ehrDate){
    var datum = ehrDate.substring(0,ehrDate.length-14);
    var split = datum.split("-"); 
    datum = split[2] + "." + split[1] + "." + split[0];
    return datum;
}

function trenutniDatum(){
    var date = new Date();
    var leto = date.getFullYear();
    var mesec = date.getMonth() + 1;
    var dan  = date.getDate();
    return dan + "."+mesec+"."+leto;
}

function izracunajStarost(datumRojstva){
    var roj = datumRojstva.split(".");
    var tre = trenutniDatum().split(".");
    var starost = parseInt(tre[2])-parseInt(roj[2]) -1;
    if(parseInt(tre[1])>parseInt(roj[1])){
        starost=starost+1;
    }
    else if(parseInt(tre[1])==parseInt(roj[1])){
        if(parseInt(tre[0])>=parseInt(roj[0])){
            starost=starost+1;
        }
    }
    return starost;
}

function izrisiGraf(data,data2,id,param,bar){
   var margin = {top: 20, right: 30, bottom: 100, left: 40}, width = $("." + id).width()- margin.left - margin.right,
    height = 500- margin.top - margin.bottom; 
    
    var x = d3.scale.ordinal()
        .rangeRoundBands([0,width], .1)
        .domain(data2);
        
    var y = d3.scale.linear()
        .range([height,0])
        .domain([0, d3.max(data)]);
    
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
        
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);
    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return "<strong>"+param+":</strong> <span style='color:red'>" + d + "</span>";
      })
    
    var chart = d3.select("." + id)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    chart.call(tip);
    
    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)" );
    
    
    chart.append("g")
        .attr("class", "y axis")
        .call(yAxis)
    .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "-4em")
        .style("text-anchor", "end")
        .text(param);
      
    chart.selectAll("." + bar)
      .data(data2)
    .enter().append("rect")
      .attr("class", bar)
      .attr("x", function(d) { return x(d); })
      .attr("width", x.rangeBand())
      .data(data)
      .attr("y", function(d) { return y(d); })
      .attr("height", function(d) { return height - y(d); })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);
}

function preberiEHRodBolnika() {
	sessionId = getSessionId();
	$("#preberiSporocilo").html("");
	$("#seznamZdravil").html("");
    $(".visinaGraf").html("");
	$(".tezaGraf").html("");
	$("#bolnikIme").html("<small>Bolnik: </small>");
	$("#bolnikDatumRojstva").html("<small>Datum rojstva: </small>");
	$("#bolnikStarost").html("<small>Starost: </small>");
	$("#bolnikITM").html("<small>ITM: </small>");
	$("#bolnikTlak").html("<small>Krvni tlak: </small>");
	$("#bolnikTemp").html("<small>Telesna temp.: </small>");
	$("#bolnikVisina").html("<small>Višina: </small>");
	$("#bolnikTeza").html("<small>Teža: </small>");
	document.getElementById('map').className = 'map1';
	vrocina=false;
	pritisk=false;
	var ehrId = $("#preberiEHRid").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#preberiSporocilo").html("<span class='obvestilo label label-warning " +
      "fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
	    var teza=0;
	    var visina=0;
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#bolnikIme").html("<small>Bolnik: </small>"+party.firstNames + " " + party.lastNames);
				$("#bolnikDatumRojstva").html("<small>Datum rojstva: </small>"+ parsajDatum(party.dateOfBirth));
				$("#bolnikStarost").html("<small>Starost: </small>"+ izracunajStarost(parsajDatum(party.dateOfBirth)));
		   	$.ajax({
            url: baseUrl + "/view/" + ehrId + "/height",
            type: 'GET',
            headers: {"Ehr-Session": sessionId},
            success: function (res) {
            if(res.length>0){
                var x=1;
                for(var i in res){
                    visine[i]=res[res.length-i-1].height;
                    visineDatum[i]="("+(x++)+")"+res[res.length-i-1].time.substring(0,10);
                }
                //"("+(x++)+")"+
                izrisiGraf(visine,visineDatum,"visinaGraf","Višina (cm)","bar");
                visina=parseInt(res[0].height)/100;
                $("#bolnikVisina").html("<small>Višina: </small>"+ res[0].height+ res[0].unit);
            } else {
                $("#bolnikVisina").html("<small>Višina: </small> Ni podatka!");
            }
            $.ajax({
            url: baseUrl + "/view/" + ehrId + "/weight",
            type: 'GET',
            headers: {"Ehr-Session": sessionId},
            success: function (res2) {
            if(res2.length>0){
                var x2=1;
                for(var j in res2){
                    teze[j]=res2[res2.length-j-1].weight;
                    tezeDatum[j]="("+(x2++)+")"+res2[res2.length-j-1].time.substring(0,10);
                }
                izrisiGraf(teze,tezeDatum,"tezaGraf","Teža (kg)","bar2");
                teza=parseFloat(res2[0].weight);
                $("#bolnikTeza").html("<small>Teža: </small>"+ res2[0].weight+ res2[0].unit);
                if(teza>0 && visina>0){
                    var tmi=Math.round(teza/(visina*visina)*100)/100;
                    var tmiStatus="";
                    if(tmi<18.5)
                        tmiStatus="Premajhna telesna teža!"
                    else if(tmi>=18.5 && tmi<=24.9)
                        tmiStatus="Normalna telesna teža."
                    else 
                        tmiStatus="Prekomerna telesna teža!"
    
                    $("#bolnikITM").html("<small>ITM: </small>"+ tmi+" "+"<span class=\"label label-info\" id=\"stanjeITM\">"+tmiStatus+"</span>");
                }
            } else {
                $("#bolnikTeza").html("<small>Teža: </small> Ni podatka!");
            }
            },
        	error: function(err) {
        		$("#preberiSporocilo").html("<span class='obvestilo label " +
                "label-danger fade-in'>Napaka '" +
                JSON.parse(err.responseText).userMessage + "'!");
        	}
        	
		});
            },
        	error: function(err) {
        		$("#preberiSporocilo").html("<span class='obvestilo label " +
                "label-danger fade-in'>Napaka '" +
                JSON.parse(err.responseText).userMessage + "'!");
        	}
		});
		$.ajax({
            url: baseUrl + "/view/" + ehrId + "/blood_pressure",
            type: 'GET',
            headers: {"Ehr-Session": sessionId},
            success: function (res) {
            if(res.length>0){
                var tlakStatus="";
                if(res[0].systolic<90)
                    tlakStatus="Nizek krvni tlak!";
                else if(res[0].systolic>90 && res[0].systolic<140)
                    tlakStatus="Normalen krvni tlak.";
                else{
                    tlakStatus="Visok krvni tlak!";
                    pritisk=true;
                }
                $("#bolnikTlak").html("<small>Krvni tlak: </small>"+ res[0].systolic + res[0].unit+" "+"<span class=\"label label-info\" id=\"stanjeTlak\">"+tlakStatus+"</span>");
            } else {
                 $("#bolnikTlak").html("<small>Krvni tlak: </small>Ni podatka!<span class=\"label label-info\" id=\"stanjeTlak\"></span>");
            }
            },
        	error: function(err) {
        		$("#preberiSporocilo").html("<span class='obvestilo label " +
                "label-danger fade-in'>Napaka '" +
                JSON.parse(err.responseText).userMessage + "'!");
        	}
		});
		$.ajax({
            url: baseUrl + "/view/" + ehrId + "/body_temperature",
            type: 'GET',
            headers: {"Ehr-Session": sessionId},
            success: function (res) {
            if(res.length>0){
                var tempStatus="";
                if(parseFloat(res[0].temperature)<35.8)
                    tempStatus="Nizka telesna temperatura!";
                else if(parseFloat(res[0].temperature)>37.2){
                    tempStatus="Visoka telesna temperatura!";
                    vrocina=true;
                }
                else
                    tempStatus="Normalna telesna temperatura.";
                $("#bolnikTemp").html("<small>Telesna temp.: </small>"+res[0].temperature + res[0].unit+"<span class=\"label label-info\" id=\"stanjeTemp\">"+tempStatus+"</span>");
            } else {
                 $("#bolnikTemp").html("<small>Telesna temp.: </small>Ni podatka!<span class=\"label label-info\" id=\"stanjeTemp\"></span>");
            }
            },
        	error: function(err) {
        		$("#preberiSporocilo").html("<span class='obvestilo label " +
                "label-danger fade-in'>Napaka '" +
                JSON.parse(err.responseText).userMessage + "'!");
        	}
		});
	    	    
	    	    
	    	},
			error: function(err) {
				$("#preberiSporocilo").html("<span class='obvestilo label " +
          "label-danger fade-in'>Napaka '" +
          JSON.parse(err.responseText).userMessage + "'!");
			}
		});
		
		
		
	}
}


$(document).ready(function() {
    $('#preberiObstojeciEHR').change(function() {
        $("#seznamZdravil").html("");
		$("#preberiEHRid").val($(this).val());
	});
});