$(function(){
	const monthList = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec" ];
	
	loadLatestChat();
	$(".contact").click(openChat);
	$("#message").keyup(sendMessage);
	setInterval(updateChatList, 1000);

	/*============================================
		- GET ALL MESSAGES FROM SPECIFIC CHAT
	============================================*/
	var chatCount = {old:0, new: 0, listLen: 0};
	var instantMsg;

	function getChat(receiverId)
	{
		clearInterval(instantMsg);

		$.ajax({
			url: "/inbox/"+receiverId,
			method: "GET",
			success: function(res)
			{	
				chatCount.old = res.length;
				let oldDate = null;

				$.each(res, function(index, message){
					let sender = (message.sender == receiverId) ? "other" : "me";
					let date = getDate(message.sent_at);
					let tmp = `${date.day}  ${monthList[date.month -  1]}  ${date.year}`;
					var today = getDate(new Date());
					today = `${today.day}  ${monthList[today.month -  1]}  ${today.year}`;

					if (oldDate != tmp){
						oldDate = tmp;
						$(".messages").append(`<div class="date"><span>${(tmp == today) ? "Today" :tmp}</span></div>`);
					}
					$(".messages").append(`<div class="message clearfix ${sender}" data-id="${index}"><p>${message.message}</p></div>`);
					
				});
				$(".messages").animate({ scrollTop: $(".message").eq(chatCount.old - 1).offset().top }, 300);

				instantMsg = setInterval(updateMessageList, 1000);
			},
			error: function(err){
				console.log(err);
			}
		});
	}
	
	function updateChatList()
	{
		$.ajax({
			url: "/inbox?getAllMessages=true",
			method: "GET",
			success: function(resp)
			{
				let topChatId = $(".contact").first().attr("data-userid");
				
				if (resp.latestChats.length)
				{
					
					let {message, user_id, chat_id} = resp.latestChats[0];
					let contact = $('.contact[data-userid="'+ user_id +'"]');

					if (topChatId != user_id)
					{
						var clone = $('.contact').eq(1).clone();

						clone.children('p').text(message);
						clone.attr('data-chatid', chatId).insertAfter($('#search'));
						$('.contact').click(openChat);

						if (contact.index())
							contact.remove();
					}
					else
						contact.children('p').text(message);
				}
			},
			error: function(err){
				console.log(err);
			}
		});
	}

	function openChat()
	{
		var userId = $(this).attr("data-userid"),
			chatId = $(this).attr("data-chatid"),
			img	= $(this).children("img").attr("src"),
			name = $(this).children("span.name").children("b").text();

		$("#msg-list-header img").attr("src", img);
		$("#msg-list-header .name").text(name);
		$("input#message").attr("data-userid", userId);
		$("input#message").attr("data-chatid", chatId);
		$(".messages").html("");
		getChat(userId);
	}

	function getDate(date)
	{
		var d = new Date(date);
		var date = {
			day: d.getDate(),
			month: d.getMonth() + 1,
			year: d.getFullYear(),
			hour: d.getHours(),
			min: d.getMinutes() + 1,
			sec: d.getSeconds() + 1
		};

		return date;
	}

	function sendMessage(e)
	{
		var message = $(this).val().trim();
		var receiver = $(this).attr("data-userid");
		var chat_id = $(this).attr("data-chatid");
		console.log(chat_id);
		
		
		if (e.keyCode == 13)
		{
			$.ajax({
				url: "/inbox",
				method: "POST",
				data: {message: message, receiver: receiver, chat_id: chat_id},
				success: function(res)
				{
					console.log(res);
					
					$("#message").val("");
				},
				error: function(err){
					console.log(err);
				}
			});
		}

	}

	function updateMessageList(){
		var receiverId = $("input#message").attr("data-userid");
		$.ajax({
			url: "/inbox/"+receiverId,
			method: "GET",
			success: function(res)
			{
				chatCount.new = res.length;
				
				if (chatCount.new > chatCount.old)
				{
					let i = (chatCount.new - 1);
					let {sender, message} = res[i];
					let	owner = (sender == receiverId) ? "other" : "me";
					let element = $(`<div class="message clearfix ${owner}" data-id="${i}"><p>${message}</p></div>`);
					
					$(".messages").append(element);
					$(".messages").scrollTop($('.messages')[0].scrollHeight);
					
					chatCount.old = chatCount.new;
				}
			},
			error: function(err){
				console.log(err);
			}
		});
	}

	function loadLatestChat()
	{
		var userId = $(".contact").first().attr("data-userid"),
			img	= $(".contact").first().children("img").attr("src"),
			name = $(".contact").first().children("span.name").children("b").text(),
			chatId = $(".contact").first().attr("data-chatid");

		$("#msg-list-header img").attr("src", img);
		$("#msg-list-header .name").text(name);
		$("input#message").attr("data-userid", userId);
		$("input#message").attr("data-chatid", chatId);
		$(".messages").html("");

		if ($(".contact").length){
			getChat(userId);
			setInterval(updateChatList, 1000);
		}
	}


	if ($(".contact").length){
		instantMsg = setInterval(updateMessageList, 1000);
	}

})
