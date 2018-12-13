var usr_location;

var root_url = 'http://comp426.cs.unc.edu:3001/';
var todaysflights;
var airports_list;
var pw;
var today;

$(document).ready(function() {
    navigator.geolocation.getCurrentPosition(closest_airport);
    //delete_instances()
    //airport_id = getClosestAirportID()
    //airport_id = "190085";
    var date = new Date()
    today = date.getFullYear()+'-'+(date.getMonth()+1).toString()+'-'+date.getDate()

    console.log(today);

    var airports_list = [];
    $.ajax(root_url+"airports",
    {
        type: 'GET',
        xhrFields: {withCredentials: true},
        success: (airports) => {
            airports_list = airports;

            for(var j=0; j<airports.length; j++){
                $('#searchDropdown').append('<a href="#about" class="dropdown-item" onclick="selectAirport('+airports[j].id+')">'+airports[j].name+'</a>')
            }
        }
    });


    todaysflights = new Set()
    $.ajax(root_url+"instances?filter[date]="+today,
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
            temp= Math.round((data['main']['temp'] -273.15)*9/5 + 32)
            console.log(temp);
            $('#weather'+airport_id.toString()).text(temp+"deg "+weather);

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
    $("#security").removeClass("hide");
}
function toFB() {
    $("#flightboard").removeClass("hide");
    $("#plane").addClass("hide");
    $("#detail").addClass("hide");
    $("#admin").addClass("hide");
    $("#toAdmin").removeClass("hide");
    $("#toFB").addClass("hide");
    $("#title").text("Flightboard"); 
    $("arrivals_button").addClass('active');
    $("#add_flight").addClass('hide');
    $("#edit_instance").addClass('hide');
    $("#add_airline").addClass('hide');
    $("#edit_airline").addClass('hide');
    $("#add_instance").addClass('hide');
    $('#arrivals_button').addClass('active');
    $('#departures_button').removeClass('active');

    document.getElementById("Arrivals").style.display = "block";
    document.getElementById("Departures").style.display = "none";
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
    $.ajax(root_url + "flights?filter[arrival_id]=" + cur_airport,
    {
     type: 'GET',
     xhrFields: {withCredentials: true},
     success: (flights) => {
        console.log(flights);
        var div = $('#arrivals_body').html("");
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
                    flight.append($('<td class="status ontime" id=status'+flights[i].id.toString()+'>On time</td>'));

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
                    $.ajax(root_url + "instances/?filter[date]="+today+"&filter[flight_id]="+flights[i].id, {
                        type: 'GET',
                        xhrFields: {withCredentials: true},
                        success: (instances) => {
                            var status = instances[0].is_cancelled
                            if(status){
                                $('#status'+ instances[0].flight_id.toString()).text('Canceled');
                                $('#status'+ instances[0].flight_id.toString()).addClass('canceled');
                                $('#status'+ instances[0].flight_id.toString()).removeClass('ontime');

                            } else {
                                $('#status'+ instances[0].flight_id.toString()).text("On time");
                            }
                            
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
        var div = $('#departures_body').html("");
        for(var i=0; i<flights.length; i++){
            if(todaysflights.has(flights[i].id)){
                var flight = $('<tr class="flight" id="'+ flights[i].id.toString() +'"></tr>');
            flight.append('<td class="name"><span class="'+flights[i].airline_id.toString()+'"></span> '+flights[i].number.toString() +'<p class="planetype hide '+ flights[i].plane_id.toString()+'" onclick="toPlane('+ flights[i].plane_id.toString()+')"></p></td>');

                flight.append($('<td class="source"><span class="'+flights[i].arrival_id.toString()+'"></span><p class="weather hide" id="weather'+flights[i].arrival_id.toString()+'"></p></td>'));


                    //getWeather("weather"+flights[i].departure_id.toString(), )
                    var dept_date = new Date(flights[i].departs_at.toString());
                    var dept_str = dept_date.toLocaleTimeString();

                    var arr_date = new Date(flights[i].arrives_at.toString());
                    var arr_str = arr_date.toLocaleTimeString();

                    flight.append($('<td class="time">'+dept_str+'<p class="departed_at hide">Will arrive at '+arr_str+'</p></td>'));
                    flight.append($('<td class="status ontime" id=status'+flights[i].id.toString()+'>On time</td>'));

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
                            console.log('calling get weather with id '+airport.id);
                            getWeather(airport.id, airport.latitude, airport.longitude);
                            $('.'+ airport.id.toString()).text(airport.name);
                        }
                    });
                    $.ajax(root_url + "instances/?filter[date]="+today+"&filter[flight_id]="+flights[i].id, {
                        type: 'GET',
                        xhrFields: {withCredentials: true},
                        success: (instances) => {
                            var status = instances[0].is_cancelled
                            if(status){
                                $('#status'+ instances[0].flight_id.toString()).text('Canceled');
                                $('#status'+ instances[0].flight_id.toString()).addClass('canceled');
                                $('#status'+ instances[0].flight_id.toString()).removeClass('ontime');

                            } else {
                                $('#status'+ instances[0].flight_id.toString()).text("On time");
                            }
                            
                        }
                    });

                    //console.log(flight);
                    div.append(flight);}
                    
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
            var upcoming_div = $('#upcoming_body').html("");
            var completed_div = $('#completed_body').html("");

            for(var i=0; i<flights.length; i++){
                if(todaysflights.has(flights[i].id)){
                    var dept_date = new Date(flights[i].departs_at.toString());
                    var dept_str = dept_date.toLocaleTimeString();

                    var arr_date = new Date(flights[i].arrives_at.toString());
                    var arr_str = arr_date.toLocaleTimeString();
                    var flight = $('<tr class="flight" id="'+ flights[i].id.toString() +'"></tr>');
                flight.append('<td class="name"><span class="'+flights[i].airline_id.toString()+'"></span> '+flights[i].number.toString() +'<p class="planetype hide '+ flights[i].plane_id.toString()+'" onclick="toPlane('+ flights[i].plane_id.toString()+')"></p></td>');

                    flight.append($('<td class="source"><span class="'+flights[i].departure_id.toString()+'"></span> at '+dept_str+'<p class="weather hide" id="weather'+flights[i].departure_id.toString()+'"></p></td>'));


                    flight.append($('<td class="time"><span class="'+flights[i].arrival_id.toString()+'"></span> at '+arr_str+'<p class="weather hide" id="weather'+flights[i].arrival_id.toString()+'"></p></td>'));
                    flight.append($('<td class="status ontime">On time</td>'));

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
                    var nowmin = now.getHours()*60+now.getMinutes()
                    var arrmin = arr_date.getHours()*60+arr_date.getMinutes()
                    var deptmin = dept_date.getHours()*60+dept_date.getMinutes()

                    if(arrmin < nowmin){
                        completed_div.append(flight);
                    } else if(arrmin > nowmin && arrmin < nowmin){
                        //flight is current
                        console.log('current');
                    }
                    else{
                        upcoming_div.append(flight);
                    }
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


function closest_airport(pos) {
    var coords=pos.coords;
    var lat = coords.latitude;
    var long = coords.longitude;



    var cur_closest; 
    var cur_distance;

    $.ajax(root_url + "airports",
    {
     type: 'GET',
     async: false,
     xhrFields: {withCredentials: true},
     success: (airports) => {
        var air_lat = airports[0].latitude;
        var air_long = airports[0].longitude;
        var dif_lat = air_lat - lat;
        var dif_long = air_long - long;
        var distance = Math.sqrt(dif_lat*dif_lat + dif_long*dif_long);
        cur_closest = airports[0].id;
        cur_distance = distance;
        for(i = 1; i < airports.length; i++) {
            air_lat = airports[i].latitude;
            air_long = airports[i].longitude;
            dif_lat = air_lat - lat;
            dif_long = air_long - long;
            distance = Math.sqrt(dif_lat*dif_lat + dif_long*dif_long);
            if(distance < cur_distance) {
                cur_closest = airports[i].id;
                cur_distance = distance;
            }
        }
        console.log(cur_distance);
        console.log(cur_closest);

        selectAirport(cur_closest);
    }

});
    
}

function selectAirport(id){
    $.ajax(root_url+"airports/"+id,
        {
            type: 'GET',
            xhrFields: {withCredentials: true},
            success: (airport) => {
                $(".airport").text(airport.name);
            }
        });

    get_airport_flights(id);
}

function keyup(){
    pw = $('#pw').value
}

function authenticate(){
    if(pw='123456'){
        $('#security').addClass('hide');
        add_flight();
        delayed_status();
        add_airline();
        change_airline_logo();
        add_instance();
    }
}


function add_flight() {
    $('#add_flight').removeClass('hide');


    $('#make_flight').on('click', () => {
    let new_flight_departure = $('#new_flight_departure').val();
    let new_flight_arrival = $('#new_flight_arrival').val();
    let new_flight_number = $('#new_flight_number').val();
    let new_flight_plane = $('#new_flight_plane').val();
    let new_flight_departure_id = $('#new_flight_departure_id').val();
    let new_flight_arrival_id = $('#new_flight_arrival_id').val();
    let new_flight_next_id = $('#new_flight_next_id').val();
    let new_flight_airline = $('#new_flight_airline').val();

    $.ajax(root_url + "flights",
           {
           type: 'POST',
           data: {
               flight: {
               departs_at: new_flight_departure,
               arrives_at: new_flight_arrival,
               number: new_flight_number,
               plane_id: new_flight_plane,
               departure_id: new_flight_departure_id,
               arrival_id: new_flight_arrival_id,
               next_flight_id: new_flight_next_id,
               airline_id: new_flight_airline
               }
           },
           xhrFields: {withCredentials: true},
           success: (airline) => {
               $('#msgs').text("successfully posted new flight");
               $('#new_flight_departure').val("");
                $('#new_flight_arrival').val("");
                $('#new_flight_number').val("");
                $('#new_flight_plane').val("");
                $('#new_flight_departure_id').val("");
                $('#new_flight_arrival_id').val("");
                $('#new_flight_next_id').val("");
                $('#new_flight_airline').val("");

           }
           });
    });

};



var delayed_status = function() {
    $('#edit_instance').removeClass('hide');

    

    $('#toggel').on('click', () => {
        let cur_flight_id = $('#flight_id').val();
        let cur_date = $('#date').val();
        let toggel = $('#toggel').val();

        $.ajax(root_url + "instances?filter[flight_id]=" + cur_flight_id,
        {
            type: 'GET',
            xhrFields: {withCredentials: true},
            success: (all_cur_flight_id) => {
                var cur;
                for(i=0; i < all_cur_flight_id.length; i++) {
                    if(all_cur_flight_id[i].date == cur_date) {
                        cur = all_cur_flight_id[i].id;
                        console.log(cur);
                    }
                }
                $.ajax(root_url + "instances/" + cur, 
                        {
                            type: 'PUT',
                            data: {
                                instance: {
                                    flight_id: cur_flight_id,
                                    date: cur_date,
                                    is_cancelled: toggel == 'true'
                                }
                            },
                            xhrFields: {withCredentials: true},
                            success: (airline) => {
                                console.log("yesss");
                                $('#msgs').text("successfully updated instance");
                                $('#flight_id').val("");
                                $('#date').val("");
                                $('#toggel').val("");
                            }
                        });
                    }
            });
    });
};
function add_instance() {
    $('#add_instance').removeClass('hide');

    $('#createinstance').on('click', () => {
        let cur_flight_id = $('#flight_id').val();
        let cur_date = $('#date').val();
        let toggel = $('#createinstance').val();

        
        $.ajax(root_url + "instances",
                        {
                            type: 'POST',
                            data: {
                                instance: {
                                    flight_id: cur_flight_id,
                                    date: cur_date,
                                    is_cancelled: toggel == 'true'
                                }
                            },
                            xhrFields: {withCredentials: true},
                            success: (airline) => {
                                console.log("yesss");
                                $('#msgs').text("successfully posted instance");
                                $('#flight_id').val("");
                                $('#date').val("");
                                $('#toggel').val("");
                            }
                        });
                    });
};

function add_airline() {
    $('#add_airline').removeClass('hide');

    $('#make_airline').on('click', () => {
    let new_airline_name = $('#new_airline_name').val();
    let new_airline_logo = $('#new_airline_logo').val();


    $.ajax(root_url + "airlines",
           {
           type: 'POST',
           data: {
               airline: {
               name: new_airline_name,
               logo_url: new_airline_logo
               }
           },
           xhrFields: {withCredentials: true},
           success: (airline) => {
                $('#msgs').text("successfully posted new airline");
                $('#new_airline_name').val("");
                $('#new_airline_logo').val("");
                }
           });
    });

};



function change_airline_logo() {
    $('#edit_airline').removeClass('hide');

    $('#edit_airline').on('click', () => {
    let new_airline_name = $('#edited_airline_name').val();
    let new_airline_logo = $('#edited_airline_logo').val();


    $.ajax(root_url + "airlines?filter[name]=" + new_airline_name,
    {
    xhrFields: {withCredentials: true},
           success: (airline) => {
            cur = airline[0].id
    $.ajax(root_url + "airlines/" + cur,
           {
           type: 'PUT',
           data: {
               airline: {
               name: new_airline_name,
               logo_url: new_airline_logo
               }
           },
           xhrFields: {withCredentials: true},
           success: (airlines) => {
            $('#msgs').text("successfully edited airline");
                $('#edited_airline_name').val("");
                $('#edited_airline_logo').val("");
               //airline_list.append("<li>" + airline.name + "</li>");
           }
           });
}
    });
});

};

