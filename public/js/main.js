$(function(){

	// getNotifications();

	// $(".bell").click(function(e){
	// 	e.preventDefault();
	// 	$(".bell  ul").toggleClass("visible");
	// });

	// setInterval(getNotifications, 1000);

	var notifications = {count: 0};

	function getNotifications(){

		$.ajax({
			url: "/notifications/get-all",
			method: "POST",
			data: {},
			dataType: "json",
			success: function(data)
			{
				if(data.length > notifications.count)
				{
					$("#notificationsCount").css({'visibility': 'visible'});
					notifications.count = data.length;
				}
			},
			error: function(err)
			{
				console.log(err); 
			}
		});
	};

	$(".star").click(function(e){
		var url = window.location.href.split("/");
		var userId = $(this).attr('data-id');
		
		$.ajax({
			url: "/likes",
			method: "POST",
			data: {userId: userId},
			dataType: "json",
			success: function(data)
			{
				console.log(data);
				
				if (data.return)
					$(".star i").removeClass("far fa-star").addClass("fas fa-star");
				else
					$(".star i").removeClass("fas fa-star").addClass("far fa-star");
			},
			error: function(err)
			{
				console.log(err);
			}
		});
	});


	$('#select-all, input[name="notification"]').click(function (e){
		if ($(this).prop('checked') == true)
		{
			if ($(this).attr('id') == 'select-all'){
				$('input[name="notification"]').attr('checked', true);
			}
			$('table thead th form').css({'display': 'inline-block'}).fadeIn(300);
			
			let ids = [];
			$.each($('input[name="notification"]:checked'), function(key, val){
				ids.push($(this).val());
			});
		
			let  arrIds = JSON.stringify(ids);

			$('.ids').val(arrIds);
		}
		else{
			if ($(this).attr('id') == 'select-all'){
				$('input[name="notification"]').attr('checked', false);
			}
			$('table thead th form').hide();
		}
	});



});
