$(function initializeMap (){
  var fullstackAcademy = new google.maps.LatLng(40.705086, -74.009151);
  var styleArr = [{
    featureType: 'landscape',
    stylers: [{ saturation: -100 }, { lightness: 60 }]
  }, {
    featureType: 'road.local',
    stylers: [{ saturation: -100 }, { lightness: 40 }, { visibility: 'on' }]
  }, {
    featureType: 'transit',
    stylers: [{ saturation: -100 }, { visibility: 'simplified' }]
  }, {
    featureType: 'administrative.province',
    stylers: [{ visibility: 'off' }]
  }, {
    featureType: 'water',
    stylers: [{ visibility: 'on' }, { lightness: 30 }]
  }, {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#ef8c25' }, { lightness: 40 }]
  }, {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ visibility: 'off' }]
  }, {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#b6c54c' }, { lightness: 40 }, { saturation: -40 }]
  }];

  var mapCanvas = document.getElementById('map-canvas');

  var currentMap = new google.maps.Map(mapCanvas, {
    center: fullstackAcademy,
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: styleArr
  });


  document.getElementById('map-canvas').mapRef = currentMap; 

  var iconURLs = {
    hotel: '/images/lodging_0star.png',
    restaurant: '/images/restaurant.png',
    activity: '/images/star-3.png'
  };

  /***** PSEUDO-MODEL ******/
  var days = [{}];
  var currentDayIndex = 1;
  // Constructor function
  var day = function(index){
    this.index = index;
    this.hotelArr = [];
    this.restaurantArr = [];
    this.activityArr = [];
  }
  days.push(new day(1));


  var markers = [];
  function drawMarker (type, coords, name) {
    var latLng = new google.maps.LatLng(coords[0], coords[1]);
    var iconURL = iconURLs[type];
    var marker = new google.maps.Marker({
      icon: iconURL,
      position: latLng
    });
    // Add marker to markers array, 
    markers.push(marker);
    // Attach a name property to each marker
    marker.name = name;
    marker.setMap(currentMap);
  }

  // Fill up select fields
  hotels.forEach(function(hotel){
    $('#hotel-choices').append('<option value="' + hotel.id + '">' +
                                 hotel.name + '</option>');
  });
  restaurants.forEach(function(restaurant){
    $('#restaurant-choices').append('<option value="' + restaurant.id + '">' +
                                      restaurant.name + '</option>');
  });
  activities.forEach(function(activity){
    $('#activity-choices').append('<option value="' + activity.id + '">' +
                                    activity.name + '</option>');
  });


  // ADD functionality 
  function addItemHelper(typeStr, typeArr){    
  // Find item that is selected
    var selectedId = $('#' + typeStr + '-choices').val();
    var selectedName = $('#' + typeStr + '-choices option:selected').text();
    // Construct itinerary item AND attach it to DOM list
    $('#iti-' + typeStr + '-list')
    .append('<div class="itinerary-item">' + 
            '<span class="title">' + selectedName + '</span>' +
            '<button class="btn btn-xs btn-danger remove btn-circle">x</button>' +
            '</div>');

    // Add to model
    days[currentDayIndex][typeStr+'Arr'].push(selectedId);
    console.log("The Days array has been updated to: ", days);
    // Grab hotel location, set default as [0,0]
    var coords = [0,0];
    for(var i=0; i < typeArr.length; i++){
      if(typeArr[i].id == selectedId){
        coords = typeArr[i].place.location; 
      }
    }
    // Add marker using location
    drawMarker(typeStr, coords, selectedName);
  };


  // Apply callback helper to each add button
  $('#hotel-button').on('click', function() {
    addItemHelper('hotel', hotels)
  });
  $('#restaurant-button').on('click', function() {
    addItemHelper('restaurant', restaurants)
  });
  $('#activity-button').on('click', function () {
    addItemHelper('activity', activities)
  });


  // REMOVE functionality 
  function removeItemHelper(){
    // Get div that we want to delete
    var divToDelete = $(this);
    // Get name of place we are deleting
    var deletedName = $(this).children().first().text()
    // Remove the div
    divToDelete.remove();
    // Use name to find marker in markers array
    for(var i = 0; i < markers.length; i++){
      if(markers[i].name == deletedName){
        markers[i].setMap(null);
      }
    }
  }

  // Apply callback helper to each remove button
  $('#iti-hotel-list').on('click', 'div', removeItemHelper);
  $('#iti-restaurant-list').on('click', 'div', removeItemHelper);
  $('#iti-activity-list').on('click', 'div', removeItemHelper);


  // DAY-ADDING
  $('#day-add').on('click', function(){
    // Get count from text inside second last button
    var ctr = parseInt($(this).prev().text());
    console.log(ctr);
    ctr++;
    $(this).before('<button class="btn btn-circle day-btn different-day">' + ctr + '</button>');
    days.push(new day(currentDayIndex+1))
  })

  // DAY-SWITCHING
  $('.day-buttons').on('click', '.btn.btn-circle.day-btn.different-day', function(){
    console.log("Different day clicked.");
     
    // Destroying, un-highlight previous day
    $('.current-day').removeClass('current-day').addClass('different-day');
    // Clear itinerary for each section
    $('#iti-hotel-list').empty();
    $('#iti-restaurant-list').empty();
    $('#iti-activity-list').empty();
    // Clear markers
    markers.forEach(function(marker){
      marker.setMap(null);
    });

    // Rebuilding, highlight newly selected day
    var selectedDayButton = $(this);
    selectedDayButton.addClass('current-day');
    // Change currentDayIndex
    currentDayIndex = selectedDayButton.text();
    console.log("Now viewing day", currentDayIndex);
    // Build itineraries for that day
    var selectedDay = days[currentDayIndex];
    
    // Rebuilding Helper
    function(typeStr, id, typeArr){
      var currAttraction;
      typeArr.forEach(function(obj){
        if(obj == id){
          currAttraction.id = obj;
        }
      })
      $('#iti-' + typeStr + '-list')
      .append('<div class="itinerary-item">' + 
              '<span class="title">' + currAttraction.name + '</span>' +
              '<button class="btn btn-xs btn-danger remove btn-circle">x</button>' +
              '</div>');
    }

    selectedDay.hotelArr.forEach(function(hotelId){
      var currHotel;
      hotels.forEach(function(hotelObj){
        if(hotelObj.id == hotelId){
          currHotel = hotelObj;
        }
      })
      $('#iti-hotel-list')
      .append('<div class="itinerary-item">' + 
              '<span class="title">' + currHotel.name + '</span>' +
              '<button class="btn btn-xs btn-danger remove btn-circle">x</button>' +
              '</div>');
    })
    selectedDay.restaurantArr.forEach(function(restaurantId){
      var currRestaurant;
      restaurants.forEach(function(restaurantObj){
        if(restaurantObj.id == restaurantId){
          currRestaurant = restaurantObj;
        }
      })
      $('#iti-restaurant-list')
      .append('<div class="itinerary-item">' + 
              '<span class="title">' + currRestaurant.name + '</span>' +
              '<button class="btn btn-xs btn-danger remove btn-circle">x</button>' +
              '</div>');
    })
    selectedDay.activityArr.forEach(function(activityId){
      var currActivity;
      activities.forEach(function(activityObj){
        if(activityObj.id == activityId){
          currActivity = activityObj;
        }
      })
      $('#iti-activity-list')
      .append('<div class="itinerary-item">' + 
              '<span class="title">' + currActivity.name + '</span>' +
              '<button class="btn btn-xs btn-danger remove btn-circle">x</button>' +
              '</div>');
    })

  })

});


