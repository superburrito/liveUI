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
  var days = [];
  // Constructor function
  var day = function(index){
    this.index = index;
    this.hotelArr = [];
    this.restaurantArr = [];
    this.activityArr = [];
  }
  days.push(new day(1));
  var currentDay = days[0];
  var getLastDay = function(){
    return days[days.length - 1];
  };


  // Helper to find day in days array by index
  function findDayByIndex(num){
    for(var i = 0; i<days.length;i++){
      if(days[i].index == num) return days[i];
    };
  }

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

  // Fill up <select> fields
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


  // For adding items
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
    currentDay[typeStr+'Arr'].push(selectedId);
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


  // For removing items
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


  // Day-adding
  $('#day-add').on('click', function(){
    var newButtonLabel = getLastDay().index + 1
    $(this).before('<button class="btn btn-circle day-btn different-day">'+newButtonLabel+'</button>');
    days.push(new day(newButtonLabel));
  })


  // REBUILDER Helper for Day-switching and Day-removing
  function rebuildHelper (typeStr, id, typeArr){
    var currAttraction;
    typeArr.forEach(function(obj){
      if(obj.id == id){
        currAttraction = obj;
      }
    })
    $('#iti-' + typeStr + '-list')
    .append('<div class="itinerary-item">' + 
            '<span class="title">' + currAttraction.name + '</span>' +
            '<button class="btn btn-xs btn-danger remove btn-circle">x</button>' +
            '</div>');

    // Rebuild marker
    for(var i = 0; i < markers.length; i++){
      if(markers[i].name == currAttraction.name){
        markers[i].setMap(currentMap);
      }
    }
  }


  // DAY-SWITCHING
  $('.day-buttons').on('click', '.btn.btn-circle.day-btn.different-day', function(){
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
    selectedDayButton.removeClass('different-day').addClass('current-day');
    // Change currentDay
    currentDay = findDayByIndex(parseInt(selectedDayButton.text()));
    console.log("Current day has been changed to Day ", currentDay.index);
    
    // Change Day Title
    $('#day-title span').text('Day ' + currentDay.index);

    // Build itineraries for that day
    currentDay.hotelArr.forEach(function(hotelId){
      rebuildHelper('hotel', hotelId, hotels)
    });
    currentDay.restaurantArr.forEach(function(restaurantId){
      rebuildHelper('restaurant', restaurantId, restaurants)
    });
    currentDay.activityArr.forEach(function(activityId){
      rebuildHelper('activity', activityId, activities)
    });
  })


  // DAY-REMOVAL
  $('.btn.btn-xs.btn-danger.remove.btn-circle').on('click', function(){
    // If last day left, break
    if (days.length <= 1) return alert('Last Day -- You cannot delete this!');

    // Else proceed
    // Unhighlight current button, mark new button to be highlighted
    var dayButtonToDelete = $('.current-day').removeClass('current-day');
    var dayButtonToSwitchTo;
    // If Deleted button is the last in the row
    if(currentDay.index < getLastDay().index){
      // Mark the new button we want to switch to
      dayButtonToSwitchTo = dayButtonToDelete.next();
      // Decrement indexes for all days with indexes larger than the day we are deleting
      days.forEach(function(day){
        if(day.index > currentDay.index) day.index--;
      });
      // Remove currentDay, but note its index beforehand
      var deletedIndex = currentDay.index; 
      days.splice(days.indexOf(currentDay),1);
      // Set new currentDay (which uses the index as what was just removed!)
      currentDay = findDayByIndex(deletedIndex);
      console.log('Days spliced, days is now', days);
      // Change labels
      dayButtonToDelete.nextUntil('#day-add').each(function(index){
        var dayLabel = parseInt($(this).text());
        $(this).text(dayLabel-1);
      });
    // Else if deleted button is the last in the row
    }else{
      dayButtonToSwitchTo = dayButtonToDelete.prev();
      days.pop();
      console.log('Days popped, days is now', days);
      currentDay = findDayByIndex(currentDay.index-1);
      // Change day title
      $('#day-title span').text('Day ' + currentDay.index);
    }
    
    // Re-organise buttons
    dayButtonToDelete.remove();
    dayButtonToSwitchTo.removeClass('different-day').addClass('current-day');

    // Destroy old
    $('#iti-hotel-list').empty();
    $('#iti-restaurant-list').empty();
    $('#iti-activity-list').empty();
    markers.forEach(function(marker){
      marker.setMap(null);
    });

    // Rebuild with new data
    console.log("rebuilding with", currentDay);
    currentDay.hotelArr.forEach(function(hotelId){
      rebuildHelper('hotel', hotelId, hotels)
    });
    currentDay.restaurantArr.forEach(function(restaurantId){
      rebuildHelper('restaurant', restaurantId, restaurants)
    });
    currentDay.activityArr.forEach(function(activityId){
      rebuildHelper('activity', activityId, activities)
    });
  });


});


