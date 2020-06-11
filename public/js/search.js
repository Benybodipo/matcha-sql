$(function()
{
	$("#search-panel a").click(function(e){
		e.preventDefault();
	});

	var url_string = window.location.href,
		url = url_string.split("/").slice(4,9);
		

	var $distance = $( "#distance-range" ),
		$age		= $( "#age-range" ),
		$popularity = $( "#popularity-range" ),
		sex 		= $("[name=sex]");

	var distance = (typeof url[2] != "undefined") ? url[2] : 500;
	var age = (typeof url[0] != "undefined") ? [url[0], url[1]] : [18, 50];
	var sex = (typeof url[3] != "undefined")? url[3] : 1;
	var interests = (typeof url[4] != "undefined")? url[4] : "";

	var params = {
		age: {
			min: age[0],
			max: age[1]
		},
		distance: distance,
		sex: sex,
		interests: interests.split(',')
	};
	
	/*
	* Values by default on the indicator 
	*/
	$(".age-min").text(params.age.min);
	$(".age-max").text(params.age.max);
	$(".distance").text(params.distance);
	$(".popularity").text(params.popularity);
	$("[name=sex]").eq(params.sex - 1).attr("checked", true);

	
	if (params.interests.length){
		$.each(params.interests, function (k, interest){
			$(`input[name="interest"][value="${interest}"]`).attr('checked', true);
		});
	}

	/*
	* Slider configuration
	*/
	$distance.slider({
		value: params.distance,
		orientation: "horizontal",
		max: 1000,
		min: 1,
		range: "min",
		animate: true
	});

	$age.slider({
		range: true,
		min: 18,
		max: 150,
		values: [ params.age.min, params.age.max ],
		slide: function( event, ui ) {
		$( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
		}
	});

	$popularity.slider({
		value: params.popularity,
		orientation: "horizontal",
		max: 5,
		min: 0,
		range: "min",
		animate: true
	});
	
	/*
	* Handle Slider value
	*/
	$distance.on("slide", function(e, ui){
		var $indicator 		= $(this).parent().parent().find("a").children(".range");
		var value 			= ui.value;
		params.distance 	= value;

		$indicator.children("span").text(value);
	});

	$age.on("slide", function(e, ui){
		var $indicator 	= $(this).parent().parent().find("a").children(".range");
		var min 		= ui.values[0],
			max 		= ui.values[1];
		params.age.min 	= min;
		params.age.max 	= max;

		$indicator.children("span").eq(0).text(min);
		$indicator.children("span").eq(1).text(max);
	});

	$popularity.on("slide", function(e, ui){
		var $indicator 		= $(this).parent().parent().find("a").children(".range");
		var value 			= ui.value;
		params.popularity 	= value;

		$indicator.children("span").text(value);
	});

	$("[name=sex]").on("change", function(){
		params.sex = $(this).val();
	});
	

	/*
	* Search
	*/
	$(".btn-search").click(function(e){
		e.preventDefault();

		let url = "";
		let interests =[];


		$.each($('input[name="interest"]:checked'), function (k, v){
			interests.push($(this).val());
		});

		if (interests.length)
		{
			// Implode array of interests (convert to a coma separated string)
			interests.join(',');
		}
		else
			interests = 0;

		url = `${window.location.origin}/home/${params.age.min}/${params.age.max}/${params.distance}/${params.sex}/${interests}`;
		
		window.location.href = url;
	});
	

});
