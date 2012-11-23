$(function() {

  var jsons = ["130869.json", "39869651.json", "803970.json"];
  var images = new Array();
  loadJson();

  function loadJson(idx) {
	console.log(idx);
	if (idx == null) idx = 0;
	if (idx >= jsons.length) return; 
	var file = jsons[idx];
	$.get("./data/" + file, function(data) {
	  images.push(eval(data));
	  if (images.length >= 3) {
		render(images);
	  }
	  idx ++;
	  loadJson(idx);
	});
  }

  /*
  for (var i=0; i<jsons.length; i++) {
	var file = jsons[i];
	$.get("./data/" + file, function(data) {
	  images.push(eval(data));
	  if (images.length >= 3) {
		render(images);
	  }
	});
  }
  */

  function render(images, year, month) {
	if (year == null || month == null) {
	  year = 2012;
	  month = 11;
	}

	targetImages = filterImages(images, year, month);

	var idx = 0;
	for (var date in targetImages) {
	  var images = targetImages[date];
	  console.log(date);
	  prepareDay(date);
	  //console.log(date);
	  for (var i=0; i<images.length; i++) {
		render_one(date, images[i], i);
	  }
	  idx ++;
	}
  }

  function render_one(date, images, idx) {
	if (!images) return;
	prepareUserCell(date, idx);
	var did = dateId(date);
	for (var i=0; i<images.length; i++) {
	  var image = images[i];
	  var thumb = image["images"]["low_resolution"]["url"];
	  var html = '<div class="photo">';

	  var c = new Date(image["created_time"] * 1000);
	  var created = (c.getMonth() + 1) + "/" + c.getDate() + " " + c.getHours() + ":" + c.getMinutes();
	  html += '<div class="meta">'
	  html += created;
	  html += '</div>';

	  html += '<img src="' + thumb + '" />'
	  if (image["caption"]) {
		html += '<div class="caption">'
		html += image["caption"]["text"];
		html += '</div>';
	  }
	  if (image["comments"]["count"] > 0) {
		html += '<ul class="comments">';
		var comments = image["comments"]["data"];
		for (var j=0; j<comments.length; j++) {
		html += '<li><scrong>' + comments[j]["from"]["username"] + '</strong>: ' + comments[j]["text"] + "</li>";
		}
		html += '</ul>';
	  }
	  html += '</div>';
	  $("#" + did + "_user_" + idx).append(html);
	}
  }

  function prepareDay(date) {
	var id = dateId(date);
	if ($("#" + id).length > 0) return;
	$("#container").append('<tr id="' + id + '"></tr>');
	$("#" + id).append('<td class="date" valign="top">' + date + '</td>');
  }

  function prepareUserCell(date, idx) {
	var did = dateId(date);
	var id = did + "_user_" + idx;
	if ($("#" + did).length > 0) prepareDay(date);
	if ($("#" + id).length > 0) return;
	$("#" + did).append('<td valign="top" class="user_' + idx + '" id="' + id + '"></td>');
  }

  function dateId(date) {
	return "date_" + date.replace(/\./g, "_");
  }

  function filterImages(imagesByUser, year, month) {
	var result = new Array();
	for (var i=0; i<imagesByUser.length; i++) {
	  var images = imagesByUser[i];
	  for (var j=0; j<images.length; j++){
		var ctime = new Date(images[j]["created_time"] * 1000);
		var cyear = ctime.getYear() + 1900;
		var cmonth = ctime.getMonth() + 1;
		var cdate = ctime.getDate();
		if (cyear == year && cmonth == month) {
		  //console.log(images[j]["images"]["low_resolution"]);
		  var date = cyear + "." + cmonth + "." + cdate;
		  if (!result[date]) {
			result[date] = new Array();
		  }
		  for (var k=0; k<3; k++) {
			//console.log(k);
			if (!result[date][k]) {
			  result[date][k] = new Array();
			}
		  }
		  result[date][i].push(images[j]);
		}
	  }
	}
	result = keySort(result);
	return result;
  }

  function keySort(hash,sort){
	var sortFunc = sort || "sort";
	var keys = [];
	var newHash = {};
	for (var k in hash) keys.push(k);
	keys[sortFunc]();
	var length = keys.length;
	for(var i = 0; i < length; i++){
	  newHash[keys[i]] = hash[keys[i]];
	}
	return newHash;
  }

});