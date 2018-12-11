$(document).ready(function() {
    var weather;
    $.ajax({
        url: 'http://api.openweathermap.org/data/2.5/weather?q=Raleigh&APPID=4babec43784d23219d7ce15485e904f5',
        type: 'GET',
        //xhrFields: {withCredentials: true},
        success: function(data) {
            weather = data['weather'][0]['description'];
            console.log(weather);
            $('#weather').html(weather);

            console.log(data);
        }
    });
    $('body').on('click', 'tr', function() {
        //$(this).toggleClass("selected");
        $(this).find('.name').find('.planetype').toggleClass('hide');
        $(this).find('.source').find('.source_weather').toggleClass('hide');
        $(this).find('.time').find('.departed_at').toggleClass('hide');
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
    var input, filter, ul, li, a, i;
    input = document.getElementById("searchInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("searchDropdown");
    a = div.getElementsByTagName("a");
    for (i = 0; i < a.length; i++) {
        if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
        } else {
            a[i].style.display = "none";
        }
    }
}