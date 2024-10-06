function slideFooter() {
    const footer = document.getElementById('footer');
    footer.classList.toggle('expanded');

    // Listen for the transition end event
    footer.addEventListener('transitionend', function() {
        // Check if the footer is expanded
        if (footer.classList.contains('expanded')) {
            // Load the index.html page after the slide animation
            window.location.href = 'index.html';
        }
    }, { once: true }); // Ensure this listener is only called once
}


document.addEventListener("DOMContentLoaded", function() {
    let video = document.getElementById("video-background");
    video.setAttribute('src', 'background.mp4'); // Load the video after the page has loaded
});

// The map js start from here 
$(document).ready(function() {
    let countries = [];
    let countryData = []; // Array to store country details
    let detailData = []; // Array to store additional country details from details.json
    let airQualityData = []; // Array to store air quality data
    let climateChangeData = []; // Array to store climate change data

    let mapOptions = {
        zoom: 3,
        minZoom: 1,
        center: new google.maps.LatLng(50.7244893, 3.2668189),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        backgroundColor: 'none'
    };

    let map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    init();

    function init() {
        // Load the main country data
        $.ajax({
            url: 'data.json',
            cache: true,
            dataType: 'json',
            async: true,
            success: function(data) {
                countryData = data; // Store country data
                loadDetails(); // Load the details after country data
            }
        });
    }

    function loadDetails() {
        // Load the additional details data
        $.ajax({
            url: 'details.json', // Adjust this path if necessary
            cache: true,
            dataType: 'json',
            async: true,
            success: function(details) {
                detailData = details; // Store detail data
                loadAirQuality(); // Load air quality data after details
            }
        });
    }

    function loadAirQuality() {
        $.ajax({
            url: 'airquality.json', // Adjust this path if necessary
            cache: true,
            dataType: 'json',
            async: true,
            success: function(airQuality) {
                airQualityData = airQuality; // Store air quality data
                loadClimateChange(); // Load climate change data after air quality
            }
        });
    }

    function loadClimateChange() {
        $.ajax({
            url: 'climatechange.json', // Adjust this path if necessary
            cache: true,
            dataType: 'json',
            async: true,
            success: function(climateChange) {
                climateChangeData = climateChange; // Store climate change data
                if (countryData) {
                    $.each(countryData, function(id, country) {
                        var countryCoords;
                        var ca;
                        var co;

                        // Check if country has multiple polygons
                        if ('multi' in country) {
                            var ccArray = [];

                            for (var t in country['xml']['Polygon']) {
                                countryCoords = [];
                                co = country['xml']['Polygon'][t]['outerBoundaryIs']['LinearRing']['coordinates'].split(' ');

                                for (var i in co) {
                                    ca = co[i].split(',');
                                    countryCoords.push(new google.maps.LatLng(ca[1], ca[0]));
                                }

                                ccArray.push(countryCoords);
                            }

                            createCountry(ccArray, country);

                        } else {
                            countryCoords = [];
                            co = country['xml']['outerBoundaryIs']['LinearRing']['coordinates'].split(' ');

                            for (var j in co) {
                                ca = co[j].split(',');
                                countryCoords.push(new google.maps.LatLng(ca[1], ca[0]));
                            }

                            createCountry(countryCoords, country);
                        }
                    });

                    showCountries();
                }
            }
        });
    }

    function showCountries() {
        for (var i = 0; i < countries.length; i++) {
            countries[i].setMap(map);

            google.maps.event.addListener(countries[i], "mouseover", function() {
                this.setOptions({ fillColor: "#f5c879", 'fillOpacity': 0.5 });
            });

            google.maps.event.addListener(countries[i], "mouseout", function() {
                this.setOptions({ fillColor: "#f5c879", 'fillOpacity': 0 });
            });

            google.maps.event.addListener(countries[i], 'click', function(event) {
                // Find the country data by title
                const countryDetails = countryData.find(country => country.country === this.title);
                const detailDetails = detailData.find(detail => detail.country === this.title);
                const airQualityDetails = airQualityData.find(aq => aq.country === this.title);
                const climateChangeDetails = climateChangeData.find(cc => cc.country === this.title);

                if (countryDetails) {
                    $('#country-name').text(countryDetails.country);
                    $('#country-code').text('ISO Code: ' + countryDetails.iso);
                    $('#country-capital').text('Capital: ' + countryDetails.capital);
                    $('#country-landarea').text('Land Area: ' + countryDetails.landarea + ' km²');
                    
                    // Add details from details.json
                    if (detailDetails) {
                        $('#country-rank').text('EPI Rank: ' + detailDetails.rank);
                        $('#country-score').text('EPI Score: ' + detailDetails.current);
                        $('#country-ten-year').text('EPI 10 Year Score: ' + detailDetails.delta);
                    } else {
                        $('#country-rank').text('EPI Rank: N/A');
                        $('#country-score').text('EPI Score: N/A');
                        $('#country-ten-year').text('EPI 10 Year Score: N/A');
                    }

                    // Add air quality details (if available)
                    if (airQualityDetails) {
                        $('#country-air-quality').text('Air Quality Rank: ' + airQualityDetails.rank);
                        $('#country-air-quality-score').text('Air Quality Score: ' + airQualityDetails.current);
                        $('#country-air-quality-ten-year').text('Air Quality 10 Year Score: ' + airQualityDetails.delta);
                    } else {
                        $('#country-air-quality').text('Air Quality Rank: N/A');
                        $('#country-air-quality-score').text('Air Quality Score: N/A');
                        $('#country-air-quality-ten-year').text('Air Quality 10 Year Score: N/A');
                    }

                    // Add climate change details (if available)
                    if (climateChangeDetails) {
                        $('#country-climate-change').text('Climate Change Rank: ' + climateChangeDetails.rank);
                        $('#country-climate-change-score').text('Climate Change Score: ' + climateChangeDetails.current);
                        $('#country-climate-change-ten-year').text('Climate Change 10 Year Score: ' + climateChangeDetails.delta);
                    } else {
                        $('#country-climate-change').text('Climate Change Rank: N/A');
                        $('#country-climate-change-score').text('Climate Change Score: N/A');
                        $('#country-climate-change-ten-year').text('Climate Change 10 Year Score: N/A');
                    }

                    $('#info-box').addClass('show');
                }
            });
        }
    }

    function createCountry(coords, country) {
        var currentCountry = new google.maps.Polygon({
            paths: coords,
            title: country.country,
            code: country.iso,
            strokeOpacity: 0,
            fillOpacity: 0
        });

        countries.push(currentCountry);
    }

    $('#close-box').click(function() {
        $('#info-box').removeClass('show');
    });
});
