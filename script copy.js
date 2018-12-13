var usr_location;
var closest_airport_id;
var root_url = 'http://comp426.cs.unc.edu:3001/';

$(document).ready(function() {
    //usr_location = navigator.geolocation.getCurrentPosition(showPosition);
    //delete_instances()
    //closest_airport_id = getClosestAirportID()
    closest_airport_id = "190085";
    get_airport_flights(closest_airport_id);

    var weather;
    $.ajax({
        url: 'http://api.openweathermap.org/data/2.5/weather?q=Raleigh&APPID=4babec43784d23219d7ce15485e904f5',
        type: 'GET',
        //xhrFields: {withCredentials: true},
        success: function(data) {
            weather = data['weather'][0]['description'];
            console.log(weather);
            $('.weather').html(weather);

            console.log(data);
        }
    });
    $('body').on('click', 'tr', function() {
        //$(this).toggleClass("selected");
        $(this).find('.name').find('.planetype').toggleClass('hide');
        $(this).find('.source').find('.weather').toggleClass('hide');
        $(this).find('.time').find('.departed_at').toggleClass('hide');
        $(this).find('.status').find('.moreinfo').toggleClass('hide');
        console.log($(this).find('.name').find('.planetype'))
    });
});




function switchTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}


function myFunction() {
    document.getElementById("searchDropdown").classList.toggle("show");
}

function filterFunction() {
    var input, filter, ul, li, a, i, c;
    input = document.getElementById("searchInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("searchDropdown");
    a = div.getElementsByTagName("a");
    c=0;
    for (i = 0; i < a.length; i++) {
        if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
            c+=1;
        } else {
            a[i].style.display = "none";
        }
    }
    if(c == 0){
        $("#zeroResults").removeClass('hide');
        console.log("0 res, showing");
    } else {
        $("#zeroResults").addClass('hide');
        console.log("!0 res, hiding");
    }
}

function getWeather(airport_id, airport_lat, airport_long){
    $.ajax({
        url: 'http://api.openweathermap.org/data/2.5/weather?lat='+airport_lat.toString()+'&lon='+airport_long.toString()+'&APPID=4babec43784d23219d7ce15485e904f5',
        type: 'GET',
        //xhrFields: {withCredentials: true},
        success: function(data) {
            weather = data['weather'][0]['description'];
            //console.log('#weather'+airport_id.toString());
            $('#weather'+airport_id.toString()).text(weather);

        }
    });

}

function toAdmin() {
    $("#flightboard").addClass("hide");
    $("#plane").addClass("hide");
    $("#admin").removeClass("hide");
    $("#toAdmin").addClass("hide");
    $("#toFB").removeClass("hide");
    $("#title").text("Admin Tools"); 
    $("#detail").addClass("hide");
}
function toFB() {
    $("#flightboard").removeClass("hide");
    $("#plane").addClass("hide");
    $("#detail").addClass("hide");
    $("#admin").addClass("hide");
    $("#toAdmin").removeClass("hide");
    $("#toFB").addClass("hide");
    $("#title").text("Flightboard"); 
    document.getElementById("Arrivals").style.display = "block";
}

function toDetail(flight_id) {
    $("#flightboard").addClass("hide");
    $("#plane").addClass("hide");
    $("#detail").removeClass("hide");
    $("#admin").addClass("hide");
    $("#title").text("Flightboard"); 

    get_flights_info(flight_id);
}

function toPlane(plane_id) {
    $("#flightboard").addClass("hide");
    $("#plane").removeClass("hide");
    $("#detail").addClass("hide");
    $("#admin").addClass("hide");
    $("#title").text("Flightboard"); 

    populate_plane_info(plane_id);
}

function get_airport_flights(cur_airport) {
    var todaysflights = new Set()
    $.ajax(root_url+"instances?filter[date]="+"2018-12-12",
    {
        type: 'GET',
        xhrFields: {withCredentials: true},
        async: false,
        success: (instances) => {
            for(var j=0; j<instances.length; j++){
                todaysflights.add(instances[j].flight_id);
            }
        }
    });
    console.log(todaysflights);
    

    $.ajax(root_url + "flights?filter[arrival_id]=" + cur_airport,
    {
       type: 'GET',
       xhrFields: {withCredentials: true},
       success: (flights) => {
        console.log(flights);
        var div = $('#arrivals_body');
        for(var i=0; i<flights.length; i++){
            if(todaysflights.has(flights[i].id)){

            var flight = $('<tr class="flight" id="'+ flights[i].id.toString() +'"></tr>');
            flight.append('<td class="name"><span class="'+flights[i].airline_id.toString()+'"></span> '+flights[i].number.toString() +'<p class="planetype hide '+ flights[i].plane_id.toString()+'" onclick="toPlane('+ flights[i].plane_id.toString()+')"></p></td>');
            flight.append($('<td class="source"><span class="'+flights[i].departure_id.toString()+'"></span><p class="weather hide" id="weather'+flights[i].departure_id.toString()+'"></p></td>'));


                    //getWeather("weather"+flights[i].departure_id.toString(), )
                    var dept_date = new Date(flights[i].departs_at.toString());
                    var dept_str = dept_date.toLocaleTimeString();

                    var arr_date = new Date(flights[i].arrives_at.toString());
                    var arr_str = arr_date.toLocaleTimeString();

                    flight.append($('<td class="time">'+arr_str+'<p class="departed_at hide">Departed at '+dept_str+'</p></td>'));
                    flight.append($('<td class="status ontime">On time<p class="moreinfo mt-2 hide"><button class="btn btn-secondary" onclick="toDetail('+flights[i].id.toString()+')" type="button">More Info</button></p></td>'));

                    var airline_name;
                    $.ajax(root_url + "airlines/" + flights[i].airline_id, {
                        type: 'GET',
                        xhrFields: {withCredentials: true},
                        success: (airline) => {
                            //console.log($('.'+ airline.id.toString()))
                            $('.'+ airline.id.toString()).text(airline.name);
                        }
                    });
                    $.ajax(root_url + "planes/" + flights[i].plane_id, {
                        type: 'GET',
                        xhrFields: {withCredentials: true},
                        success: (plane) => {
                            //console.log($('.'+ plane.id.toString()))
                            $('.'+ plane.id.toString()).text(plane.name);
                        }
                    });
                    $.ajax(root_url + "airports/" + flights[i].departure_id, {
                        type: 'GET',
                        xhrFields: {withCredentials: true},
                        success: (airport) => {
                            getWeather(airport.id, airport.latitude, airport.longitude);
                            $('.'+ airport.id.toString()).text(airport.name);
                        }
                    });

                    //console.log(flight);
                    div.append(flight);}
                    
                };
            }
        });
    $.ajax(root_url + "flights?filter[departure_id]=" + cur_airport,
    {
       type: 'GET',
       xhrFields: {withCredentials: true},
       success: (flights) => {
        console.log(flights);
        var div = $('#departures_body');
        for(var i=0; i<flights.length; i++){

            var flight = $('<tr class="flight" id="'+ flights[i].id.toString() +'"></tr>');
            flight.append('<td class="name"><span class="'+flights[i].airline_id.toString()+'"></span> '+flights[i].number.toString() +'<p class="planetype hide '+ flights[i].plane_id.toString()+'" onclick="toPlane('+ flights[i].plane_id.toString()+')"></p></td>');
            flight.append($('<td class="source"><span class="'+flights[i].arrival_id.toString()+'"></span><p class="weather hide" id="weather'+flights[i].arrival_id.toString()+'"></p></td>'));


                    //getWeather("weather"+flights[i].departure_id.toString(), )
                    var dept_date = new Date(flights[i].departs_at.toString());
                    var dept_str = dept_date.toLocaleTimeString();

                    var arr_date = new Date(flights[i].arrives_at.toString());
                    var arr_str = arr_date.toLocaleTimeString();

                    flight.append($('<td class="time">'+dept_str+'<p class="departed_at hide">Will arrive at'+arr_str+'</p></td>'));
                    flight.append($('<td class="status ontime">On time<p class="moreinfo mt-2 hide"><button class="btn btn-secondary selectFlight" onclick="toDetail('+flights[i].id.toString()+')" type="button">More Info</button></p></td>'));

                    var airline_name;
                    $.ajax(root_url + "airlines/" + flights[i].airline_id, {
                        type: 'GET',
                        xhrFields: {withCredentials: true},
                        success: (airline) => {
                            //console.log($('.'+ airline.id.toString()))
                            $('.'+ airline.id.toString()).text(airline.name);
                        }
                    });
                    $.ajax(root_url + "planes/" + flights[i].plane_id, {
                        type: 'GET',
                        xhrFields: {withCredentials: true},
                        success: (plane) => {
                            //console.log($('.'+ plane.id.toString()))
                            $('.'+ plane.id.toString()).text(plane.name);
                        }
                    });
                    $.ajax(root_url + "airports/" + flights[i].arrival_id, {
                        type: 'GET',
                        xhrFields: {withCredentials: true},
                        success: (airport) => {
                            getWeather(airport.id, airport.latitude, airport.longitude);
                            $('.'+ airport.id.toString()).text(airport.name);
                        }
                    });

                    //console.log(flight);
                    div.append(flight);
                    
                };
            }
        });
}



function get_plane_flights(cur_plane) {
    $.ajax(root_url + "flights?filter[plane_id]=" + cur_plane,
    {
       type: 'GET',
       xhrFields: {withCredentials: true},
       success: (plane_flights) => {
        console.log(plane_flights);
    }
});
}


function populate_plane_info(plane_id) {
    $.ajax(root_url + "planes/" + plane_id,
    {
       type: 'GET',
       xhrFields: {withCredentials: true},
       success: (plane) => {
        console.log(plane.airline_id);
        $('#planetype').text(plane.name);
        $('#planeoperator').text('Operated by placeholder airline');
        // $.ajax(root_url + "airlines/" + plane.airline_id, {
        //     type: 'GET',
        //     xhrFields: {withCredentials: true},
        //     success: (airline) => {
        //                     //console.log($('.'+ airline.id.toString()))
        //                     $('#planeoperator').text('Operated by '+airline.name);
        //                 }
        //             });
        $.ajax(root_url + "flights?filter[plane_id]=" + plane_id,
        {
           type: 'GET',
           xhrFields: {withCredentials: true},
           success: (flights) => {
            console.log(flights);
            var upcoming_div = $('#upcoming_body');
            var completed_div = $('#completed_body');

            for(var i=0; i<flights.length; i++){
                var dept_date = new Date(flights[i].departs_at.toString());
                var dept_str = dept_date.toLocaleTimeString();

                var arr_date = new Date(flights[i].arrives_at.toString());
                var arr_str = arr_date.toLocaleTimeString();
                var flight = $('<tr class="flight" id="'+ flights[i].id.toString() +'"></tr>');
                flight.append('<td class="name"><span class="'+flights[i].airline_id.toString()+'"></span> '+flights[i].number.toString() +'<p class="planetype hide '+ flights[i].plane_id.toString()+'" onclick="toPlane('+ flights[i].plane_id.toString()+')"></p></td>');
                flight.append($('<td class="source"><span class="'+flights[i].departure_id.toString()+'"></span> at '+dept_str+'<p class="weather hide" id="weather'+flights[i].departure_id.toString()+'"></p></td>'));


                flight.append($('<td class="time"><span class="'+flights[i].arrival_id.toString()+'"></span> at '+arr_str+'<p class="weather hide" id="weather'+flights[i].arrival_id.toString()+'"></p></td>'));
                flight.append($('<td class="status ontime">On time<p class="moreinfo mt-2 hide"><button class="btn btn-secondary" onclick="toDetail('+flights[i].id.toString()+')" type="button">More Info</button></p></td>'));

                var airline_name;
                $.ajax(root_url + "airlines/" + flights[i].airline_id, {
                    type: 'GET',
                    xhrFields: {withCredentials: true},
                    success: (airline) => {
                            //console.log($('.'+ airline.id.toString()))
                            $('.'+ airline.id.toString()).text(airline.name);
                        }
                    });
                $.ajax(root_url + "planes/" + flights[i].plane_id, {
                    type: 'GET',
                    xhrFields: {withCredentials: true},
                    success: (plane) => {
                            //console.log($('.'+ plane.id.toString()))
                            $('.'+ plane.id.toString()).text(plane.name);
                        }
                    });
                $.ajax(root_url + "airports/" + flights[i].departure_id, {
                    type: 'GET',
                    xhrFields: {withCredentials: true},
                    success: (airport) => {
                        getWeather(airport.id, airport.latitude, airport.longitude);
                        $('.'+ airport.id.toString()).text(airport.name);
                    }
                });
                $.ajax(root_url + "airports/" + flights[i].arrival_id, {
                    type: 'GET',
                    xhrFields: {withCredentials: true},
                    success: (airport) => {
                        getWeather(airport.id, airport.latitude, airport.longitude);
                        $('.'+ airport.id.toString()).text(airport.name);
                    }
                });

                    //console.log(flight);
                    var now = new Date();
                    if(arr_date < now){
                        completed_div.append(flight);
                    } else if(arr_date > now && dept_date < now){
                        console.log('in_progress');
                    }
                    else{
                        upcoming_div.append(flight);
                    }
                    
                };
            }
        });

    }
});
}

function get_flights_info(cur_flight) {
    $.ajax(root_url + "flights/" + cur_flight,
       {
           type: 'GET',
           xhrFields: {withCredentials: true},
           success: (flight_data) => {



            console.log(flight_data);
            $("#detail_flight_number").html('<span id="detail_airline"></span> <span>' + flight_data.number + '</span>');          
            $.ajax(root_url + "airlines/" + flight_data.airline_id, {
                type: 'GET',
                xhrFields: {withCredentials: true},
                success: (airline) => {
                    $("#detail_airline").html(airline.name);
                    $("#detail_plane_op").text(airline.name);
                    
                }
            });
            var dep_time = flight_data.departs_at;
            var dep_time_short = dep_time.slice(11,16);
            $("#detail_desc").html("Departed " + '<span id="dep"></span> <span>' + " at " + dep_time_short + '</span>' + " en route to " + '<span id="arr"></span>');           
            $.ajax(root_url + "airports/" + flight_data.departure_id, {
                type: 'GET',
                xhrFields: {withCredentials: true},
                success: (dep_airport) => {
                    $("#dep").html(dep_airport.city);
                    
                }
            });
            $.ajax(root_url + "airports/" + flight_data.arrival_id, {
                type: 'GET',
                xhrFields: {withCredentials: true},
                success: (arr_airport) => {
                    $("#arr").html(arr_airport.city);
                    
                }
            });
            $.ajax(root_url + "planes/" + flight_data.plane_id, {
                        type: 'GET',
                        xhrFields: {withCredentials: true},
                        success: (plane) => {
                            //console.log($('.'+ plane.id.toString()))
                            $('#detail_plane_type').text(plane.name);
                        }
                    });

           }
       });
}


function create_instances() {
    $.ajax(root_url + "flights", 
    {
        type: 'GET',
        xhrFields: {withCredentials: true},
        success: (flights) => {
            for(i=0; i < flights.length; i++) {
                $.ajax(root_url + "instances",
                {
                    type: 'POST',
                    data: {
                        instance: {
                            flight_id: flights[i].id,
                            date: "2018-12-12",
                            is_cancelled: Math.random() < .05
                        }
                    },
                    xhrFields: {withCredentials: true}
                });
            }
        }
    });
}

function delete_instances() {
    $.ajax(root_url + "instances", 
    {
        type: 'DELETE',
        xhrFields: {withCredentials: true},
        success: (flights) => {
            console.log("deleted instances");
        }
    });
}

