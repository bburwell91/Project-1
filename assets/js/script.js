$(document).ready(function () {

    $("#results-div").hide();


    // Dropdown menu
    $('select').material_select();
    $('.dropdown-content li > a, .dropdown-content li > span').css({
        'color': 'black',
        'line-height': '12px',
        'padding': '5px 0',
        'padding-left': '10px'
    });
    $('.dropdown-content li').css({
        'min-height': '35px'
    });
    $('.input-field.col .dropdown-content [type="checkbox"] + label').css({
        'top': '-11px'
    });



    // Submit with enter key
    $(document).bind('keydown', function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            $("#submit").trigger("click");
            $("#user-form").blur();
        };
    });

    // #distance-data div for reset later
    var distanceDataOriginal = $("#distance-data").html();
    
    
    
    
   // Submission code block
    $("#submit").on("click", function () {
        // Form values retrieved
        try {
            var artistName = $("#artist-name").val().trim();
        } catch (err) {}
        try {
            var zipCode = $("#zip-code").val().trim();
        } catch (err) {}
        try {
            var distanceRadius = $("#distance-data").val().trim();
        } catch (err) {}

        if (artistName && zipCode && distanceRadius) {
            // The table is made visable and cleared
            $("#concert-results").html("");

            // last.fm url queries
            var lastFmUrl = "https://ws.audioscrobbler.com/2.0/?";
            var lastFmApiKey = "&api_key=a59e4e80b011ac87f4393b6404e743b5";
            var lastFmJson = "&format=json";
            var similarBandsLimit = "&limit=" + "30";
            var searchArtistQuery = lastFmUrl + "method=artist.getinfo&artist=" + artistName + lastFmApiKey + lastFmJson;
            var similarArtistQuery = lastFmUrl + "method=artist.getsimilar&artist=" + artistName + lastFmApiKey + similarBandsLimit + lastFmJson;

            // Get name and image of main band from last.fm
            $.ajax({
                url: searchArtistQuery,
                method: 'GET'
            }).done(function (response) {
                try {
                    var bandName = response.artist.name
                } catch (err) {}
                $("#display-band").html(bandName);

                searchBandsInTown(artistName);

                // try {
                //     var bandImage = response.artist.image["#text"]
                // } catch (err) {}
                // if (bandImage) {
                //     $(".card-image").html("<img src='" + bandImage + "' /img>");
                // } else {
                //     originalImg = "assets/images/download.jpg";
                //     $(".card-image").html("<img src='" + originalImg + "' /img>");
                //     $("#display-band").html("");
                // }
            });

            function searchBandsInTown(artist) {

                // Querying the bandsintown api for the selected artist, the ?app_id parameter is required, but can equal anything
                var queryURL = "https://rest.bandsintown.com/artists/" + artist + "?app_id=codingbootcamp";
                $.ajax({
                  url: queryURL,
                  method: "GET"
                }).then(function(response) {
            
                  // Printing the entire object to console
                  console.log(response);
            
                  // Constructing HTML containing the artist information
                  var artistImage = $("<img>").attr("src", response.thumb_url);
            
                  // Empty the contents of the artist-div, append the new artist content
                  $(".card-image").empty();
                  $(".card-image").append(artistImage);
                });
              }
            
              // Event handler for user clicking the select-artist button
              $("#select-artist").on("click", function(event) {
                // Preventing the button from trying to submit the form
                event.preventDefault();
                // Storing the artist name
                var inputArtist = $("#artist-input").val().trim();
            
                // Running the searchBandsInTown function(passing in the artist as an argument)
                searchBandsInTown(inputArtist);
              });
            
   
            


            // Form appearance reset after submission
            $("label").attr("class", "white-text");
            $("input:text").val("");
            $("#distance-form .select-dropdown").val("Distance");
            $("#maps-form .select-dropdown").val("Driving");



            // Eventful API function
            var eventfulApi = function (band) {
                // Eventful url query
                var eventfulUrl = "https://api.eventful.com/json/events/search";
                var apiKey = "?app_key=NxP5m6h5SJ5jphwR";
                var search = "&keywords=" + band;
                var position = "&location=" + zipCode;
                var distance = "&within=" + distanceRadius;
                var eventfulQuery = eventfulUrl + apiKey + search + position + distance;



                // Eventful ajax
                $.ajax({
                    url: eventfulQuery,
                    method: 'GET',
                    dataType: 'jsonp',
                    crossDomain: true
                }).done(function (response) {
                    try {
                        // Loop through each event if there are any
                        for (var i = 0; i < response.events.event.length; i++) {
                            // Get event data

                            // Event Title
                            try {
                                var title = response.events.event[i].title;
                            } catch (err) {
                                var title = "title missing";
                            }

                            // City Name
                            try {
                                var city = response.events.event[i].city_name;
                            } catch (err) {
                                var city = "city missing";
                            }

                            // Venue Name
                            try {
                                var venue = response.events.event[i].venue_name;
                            } catch (err) {
                                var venue = "venue missing";
                            }

                            // Event Date
                            try {
                                var date = response.events.event[i].start_time.substring(0, 10);
                                date = moment(date, 'YYYY-MM-DD').format('MM/DD/YY');
                            } catch (err) {
                                var date = "date missing";
                            }

                            // Event Latitude
                            try {
                                var latitude = response.events.event[i].latitude;
                            } catch (err) {
                                var latitude = "latitude missing";
                            }

                            // Event Longitude
                            try {
                                var longitude = response.events.event[i].longitude;
                            } catch (err) {
                                var longitude = "longitude missing";
                            }

                            // Display event data in table
                            var rowCount = $('table tr').length;
                            $("#results-div").show();
                            if (rowCount < 10) {
                                titleLower = title.toLowerCase();
                                artistNameLower = artistName.toLowerCase();
                                if (titleLower.indexOf(artistNameLower) >= 0) {
                                    // If the main artist is in the title, display first
                                    $("#concert-results").prepend("<tr>" +
                                        "<td>" + title + "</td>" +
                                        "<td>" + city + "</td>" +
                                        "<td>" + venue + "</td>" +
                                        "<td>" + date + "</td>" +
                                        "<td><input class='map-button' type='button' name='map-button' value='Map' " +
                                        "latitude='" + latitude + "' longitude='" + longitude + "' venue='" + venue + "'></td>" +
                                        "</tr>");
                                } else {
                                    // Otherwise add the event to the end
                                    $("#concert-results").append("<tr>" +
                                        "<td>" + title + "</td>" +
                                        "<td>" + city + "</td>" +
                                        "<td>" + venue + "</td>" +
                                        "<td>" + date + "</td>" +
                                        "<td><input class='map-button' type='button' name='map-button' value='Map' " +
                                        "latitude='" + latitude + "' longitude='" + longitude + "' venue='" + venue + "'></td>" +
                                        "</tr>");
                                }
                            }
                            $("thead").css("line-height", "12px");
                            $("td").css("padding", "5px");
                            // Update results counter
                            $("#result-counter").html("Results: " + rowCount);
                            $("#result-counter").css({
                                "color": "black",
                                "font-size": "16px",
                                "background": "lightgrey",
                                "margin": "0",
                                "padding": "0 0 0 5px",
                                "font-weight": "500"
                            });
                        } // Event for loop
                    } catch (err) {
                        // Tell the user if there are no events
                        var rowCount = $('table tr').length;
                        if (rowCount === 1) {
                            $("#result-counter").html("");
                            $("#concert-results").html("<td id='empty-table'>No results! Try again.</td>");
                        } else if (rowCount > 1) {
                            $("#empty-table").remove();
                        }
                    }
                }); // Eventful ajax
            }; // Eventful function


            // Get names of similar bands from last.fm
            $.ajax({
                url: similarArtistQuery,
                method: "GET"
            }).done(function (response) {
                // Start an array with the main band
                var similarBandsList = [artistName];

                // Add similar bands to the array
                try {
                    for (var i = 1; i < response.similarartists.artist.length; i++) {
                        similarBandsList.push(response.similarartists.artist[i].name);
                    }
                } catch (err) {}

                // Loop through the Eventful API for every band in the array
                for (var i = 0; i < similarBandsList.length; i++) {
                    eventfulApi(similarBandsList[i]);
                }

                $("#concert-table").show();
            });

            // Reset the #distance-data div
            $("#distance-data").html(distanceDataOriginal);

        } else {
            // If the form isn't completed
            Materialize.toast("The form is incomplete", 3000);
        }
    }); // Click submit button
    
    
    
    $(".twitter").hover(function() {
                $(".page-footer").toggleClass("color-twitter");
            });

            $(".facebook").hover(function() {
                $(".page-footer").toggleClass("color-facebook");
            });

            $(".googleplus").hover(function() {
                $(".page-footer").toggleClass("color-googleplus");
            });

            $(".pinterest").hover(function() {
                $(".page-footer").toggleClass("color-pinterest");
            });

            $(".dribbble").hover(function() {
                $(".page-footer").toggleClass("color-dribbble");
            });

            $(".instagram").hover(function() {
                $(".page-footer").toggleClass("color-instagram");
            });   
    
    
});






