//selectors
     var socket = io.connect();
     var $body = $("body");
     var $introView = $("#introView");
     var $loginErr = $("#loginErr");
     var $lobbyChatArea = $("#chatArea");
     var $lobbyMessageForm = $("#lobbyMessageForm");
     var $lobbyChatInput = $("#lobbyChatInput");
     var $lobbyChat = $("#lobbyChat");
     var $usernameForm = $("#usernameForm");
     var $users = $("#users");
     var $userInput = $("#userInput");
     var $nightButton = $("#nightButton");
     var $lobby = $("#lobby");
     var $lobbyUserList = $("#lobbyUserList");
     var $lobbyUserListHeader = $("#lobbyUserListHeader")
     var $ReadyButtonForm = $("#ReadyButtonForm");
     var $ReadyButton = $("#ReadyButton");
     var $gameView = $("#gameView");
     var $nameAndRole = $("#nameAndRole");
     var $villagePlayerList = $("#villagePlayerList");
     var $villageChat = $("#villageChat");
     var $villageChatForm = $("#villageChatForm");
     var $villageChatInput = $("#villageChatInput");
     var $stDialogue = $("#stDialogue");
     var $promptZone = $("#promptZone");
     var $dayPrompt = $("#dayPrompt");
     var $nightPrompt = $("#nightPrompt");
     var $dayForm = $("#dayForm");
     var $nightForm = $("#nightForm");
     var $wolfChat = $("#wolfChat");
     var $wolfChatForm = $("#wolfChatForm");



//not selectors
     var myName;
     var myRole;
     var myLife = true;
     var serverPlayerList;
     var currentChat;
     var isNight = false;


//Makes background dark 
     $lobbyMessageForm.on("click", "#nightButton", function(){
          if(isNight){
          $body.css("transition", "2s");
          $body.css("background-image", 'url(../css/daybg.png)');
          $body.css("background-color", "#6A56F4");


          $nightButton.val("Night Time");

          isNight=false;
          }
          else{
               $body.css("transition", "2s");
               $body.css("background-image", 'url(../css/nightbg.png)');
               $body.css("background-color", "#615A91");

               $nightButton.val("Day  Time");

               isNight=true;
          }
     });

//Client submits username to server
function isAlphaNumeric(str) {
   var code;
   var len = str.length;
   for (var i = 0; i < len; i++) {
     code = str.charCodeAt(i);
     if (!(code > 47 && code < 58) && // numeric (0-9)
         !(code > 64 && code < 91) && // upper alpha (A-Z)
         !(code > 96 && code < 123)) { // lower alpha (a-z)
       return false;
     }
   }
   return true;
 };
 $usernameForm.submit(function(e){
      e.preventDefault();
      let name = $userInput.val().toString();
      if(isAlphaNumeric(name) && name.length>0){
        socket.emit("new user", name, function(data){
             if(data==0){
                  //switch to lobby view, change to day background
                  $introView.hide();
                  $body.css("transition", "1s");
                  $body.css("background-image", 'url(../css/daybg.png)');
                  $body.css("background-color", "#6A56F4");
                  currentChat = $lobbyChat;
                  $lobby.show();
                  myName = name;
             }
             if(data==1){
               $loginErr.html("Username is taken!");
                $loginErr.css("visibility", "visible");
             }
             if(data==2){
                $loginErr.html("Lobby is full!");
                $loginErr.css("visibility", "visible");
             }
        });
        $userInput.val("");
      }
      else{
           $loginErr.html("Username is not alphanumeric!")
           $loginErr.css("visibility", "visible");
      }
 });

//Client receives user list from server
     socket.on("get users", function(data){
          html ="";
          $lobbyUserListHeader.html("Lobby (" + data.length + "/12) online");
          for(i=0; i<data.length; i++){
               if(data[i].ready){
                    html += '<li class="username-list-item   ready">' +data[i].name+'</li>';
               }
               else{
                    html += '<li class="username-list-item">' +data[i].name +'</li>';
               }
          }
          $users.html(html);
     });

//Client Sends message to server
     $lobbyMessageForm.submit(function(e){
          e.preventDefault();
          if($lobbyChatInput.val()!=""){
              socket.emit("send message", $lobbyChatInput.val());
              $lobbyChatInput.val("");
          }
     });
//Client sends message to server (in game)
     $villageChatForm.submit(function(e){
          e.preventDefault();
          if($villageChatInput.val() !="") {
               socket.emit("send message", $villageChatInput.val());
               $villageChatInput.val("");
          }
     });


//Client recieves message from server
     socket.on("new message", function(data){
          currentChat.prepend('<div class="newMessage"><span class="username">'+data.user+': </span>'+data.msg+'</div>');
     });

     $ReadyButtonForm.on("click", "#ReadyButton", function(){
          socket.emit("ready user",  true);
     });
//client gets notified that the game is starting
     socket.on("start", function(playerList){

          serverPlayerList = playerList;

          $lobby.hide();
          for(var i=0; i<playerList.length;i++){
               if(myName==playerList[i].name){
                 myRole = playerList[i].role;
               }
          }
          let wordRole;
         
          if(myRole==0){
            wordRole = "Werewolf";
           // roleDescrip = "Eat a villager each night";
          }
          if(myRole==1){
            wordRole = "Seer";
            //roleDescrip = "Each night, point at a player and learn if they are a werewolf";
          }
          if(myRole==3){
            wordRole = "Hunter";
           // roleDescrip = "If you are killed, take someone down with you";
          }
          if(myRole==2){
            wordRole = "Villager";
           // roleDescrip = "The default role, with no special abilites, you must try and discover the werewolves before it is too late!";
          }

          $nameAndRole.append('<span>' + myName +', your role is ' + wordRole + '</span>');
          currentChat = $villageChat;
          updateUsernames();
          $gameView.show();
     });

     socket.on("day", function(wasTie){
	  isNight = false;
	  updateBackground();
	  $nightPrompt.hide();
          $dayPrompt.show();
	  if(wasTie){
	      $stDialogue.prepend('<p id="dayFormHeader"> It was a tie! Vote again </p>');
	  }
	  else{
	      $stDialogue.prepend('<p id="dayFormHeader"> Who do you vote to lynch? </p>');
	  }
	  if(myLife){
          let dayFormAdd = '';

          for(i=0; i<serverPlayerList.length; i++){
	      if(serverPlayerList[i].alive && serverPlayerList[i].name !== myName)
                    dayFormAdd+= '<input type="radio" name="villageList" value="'+ serverPlayerList[i].name +'"/><span>' + serverPlayerList[i].name + '</span><br>';
          }
          dayFormAdd+= '<input id="dayFormButton" type="button" value="Vote"/></form>';
          $dayForm.append(dayFormAdd);
	  }
	  else $stDialogue.prepend("It is day time, you are dead and spectating");
     });
     socket.on("day summary", function(decision){
          for(i=0; i<serverPlayerList.length; i++){
               if(serverPlayerList[i].name===decision)
                    {

                         serverPlayerList[i].alive = false;
                    }
          }
          if(myName===decision){
               myLife = false;
          }
          updateUsernames();
          $stDialogue.prepend('<p id="daySumP">'+ decision + ' has been killed by popular demand </p>');
     });

     $dayForm.on("click", "#dayFormButton", function(){
          let dayVote = $('input[name=villageList]:checked').val(); //get selected radio button
          if(dayVote!=="undefined"){
               socket.emit("day res", dayVote);
               $dayForm.html("");
               $stDialogue.prepend('<p>You voted to kill '+dayVote+'</p>')
          }
     });
     //TODO: add forms for seer and werewolves, as well as chat for werewolves
     socket.on("night", function(){
	  isNight = true;
	  updateBackground();
	  $dayPrompt.hide();
          $nightPrompt.show();
          if(myLife){
          //set up vote like day, but FOR WEREWOLFS ONLY

   //NOTE: werewolves and seer have the same form at night, The submission of it should choose  its action based on what myRole is

          //0 is werewolf, vote with other werewolf(s) on who to kill
               if(myRole == 0){
                    $stDialogue.prepend('<p class="nightTime">Please vote on who to assasinate with the other alive werewolves</p>');
                    let nightFormAdd = '';

                    for(i=0; i<serverPlayerList.length; i++){
                         if(serverPlayerList[i].alive && serverPlayerList[i].name!==myName && serverPlayerList[i].role != 0)
                              nightFormAdd+= '<input type="radio" name="villageList" value="'+ serverPlayerList[i].name +'"/><span>' + serverPlayerList[i].name + '</span><br>';
                    }
                    nightFormAdd+= '<input id="nightFormButton" type="button" value="Vote"/></form>';
                    $nightForm.append(nightFormAdd);
                    $wolfChat.show();
		    $wolfChat.css("display","flex");
		    $wolfChatForm.append('<input id="wolfChatInput" type="text" placeholder="Talk to the other alive werewolves" />');

               }
               //1 is seer, prompt who they want to investigate
               else if(myRole == 1){
                    $stDialogue.prepend('<p class="nightTime">Seer, select a player to investigate</p>');
		    let nightFormAdd = '';

                    for(i=0; i<serverPlayerList.length; i++){
			if(serverPlayerList[i].alive && serverPlayerList[i].name!==myName)
			    nightFormAdd+= '<input type="radio" name="villageList" value="'+ serverPlayerList[i].name +'"/><span>' + serverPlayerList[i].name + '</span><br>';
                    }
                    nightFormAdd+= '<input id="nightFormButton" type="button" value="Vote"/></form>';
                    $nightForm.append(nightFormAdd);

               }
               //2 is hunter, doesnt have special effect at night, should mimic villager
               //3 is villager, but no need to check, only option left
               else {
                    $stDialogue.prepend('<p class="nightTime">Bos Oy Vermen Lazim Koylu</p>');
        let nightFormAdd = '';

                    for(i=0; i<serverPlayerList.length; i++){
      if(serverPlayerList[i].alive && serverPlayerList[i].name!==myName)
          nightFormAdd+= '<input type="radio" name="villageList" value="'+ serverPlayerList[i].name +'"/><span>' + serverPlayerList[i].name + '</span><br>';
                    }
                    nightFormAdd+= '<input id="nightFormButton" type="button" value="Vote"/></form>';
                    $nightForm.append(nightFormAdd);
               }
          }
          else{ 
	      $stDialogue.prepend('<p class="nightTime">It is night Time, you are dead and spectating</p>');
	      socket.emit("night ready");
	  }
       });

//Works just like other chats, but only for werewolves
    $wolfChatForm.submit(function(e){
	    e.preventDefault();
	    $wolfChatInput = $("#wolfChatInput");
	    if($wolfChatInput.val() !== ""){
		socket.emit("send wolfMessage", $wolfChatInput.val());
		$wolfChatInput.val("");
	    }
    });
 
    socket.on("nightVote tie", function(){
	    if(myRole==0){
		$stDialogue.prepend('<p class="nightTime">The vote was a tie! Vote again werewolves!</p>');
		let nightFormAdd = '';

		for(i=0; i<serverPlayerList.length; i++){
		    if(serverPlayerList[i].alive && serverPlayerList[i].name!==myName && serverPlayerList[i].role!=0 )
			nightFormAdd+= '<input type="radio" name="villageList" value="'+ serverPlayerList[i].name +'"/><span>' + serverPlayerList[i].name + '</span><br>';
		}
		nightFormAdd+= '<input id="nightFormButton" type="button" value="Vote"/></form>';
		$nightForm.append(nightFormAdd);
		$wolfChat.show();
		$wolfChat.css("display","flex");
		$wolfChatForm.append('<input id="wolfChatInput" type="text" placeholder="Talk to the other alive werewolves"/>');
	    }
    });

    socket.on("new wolfMessage", function(data){
	if(myRole==0)
	$wolfChat.prepend('<div class="newMessage"><span class="username">'+data.user+': </span>'+data.msg+'</div>');
    });

    $nightForm.on("click", "#nightFormButton", function(){
	let nightVote = $('input[name=villageList]:checked').val(); //get selected radio button                                                                                     
	if(nightVote!=="undefined"){

	    if(myRole==0){
		socket.emit("night res", nightVote);
		$nightForm.html("");
		$stDialogue.prepend('<p>You voted to kill '+ nightVote +'</p>')
	      }
	    else if(myRole==1){
		let seerResponse ="<p> Your crystal ball yields no results, " + nightVote + " is NOT a Werewolf</p>";
		for(i=0; i<serverPlayerList.length; i++){
		    if(serverPlayerList[i].name===nightVote && serverPlayerList[i].role == 0){
			seerResponse= "<p> Your crystal ball shows you that " +  nightVote + " is a Werewolf</p>";
		    }
		}
		$nightForm.html("");
		$stDialogue.prepend(seerResponse);
	    }
	    else if(myRole==2){
		socket.emit("hunter res", nightVote);
		$nightForm.html("");
	    }
	    socket.emit("night ready");
	} 
    });

    socket.on("night summary", function(result){
	    for(i=0; i<serverPlayerList.length;i++){
		if(result==serverPlayerList[i].name)
		    serverPlayerList[i].alive = false;
	    }
	    $stDialogue.prepend('<p>'+ result +' has been killed by the werewolfs! </p>');
	    if(myName === result) myLife = false;
	    updateUsernames();
    });

    socket.on("game over", function(result){
	    $stDialogue.prepend("GAME OVER, " + result);
    });

    socket.on("hunter", function(){
	    if(myRole==3){
		$stDialogue.prepend('<p> Select who you would like to kill </p>');
		$nightPrompt.show();
		let nightFormAdd = '';

		for(i=0; i<serverPlayerList.length; i++){
		    if(serverPlayerList[i].alive && serverPlayerList[i].name!==myName && serverPlayerList[i].role!=0 )
			nightFormAdd+= '<input type="radio" name="villageList" value="'+ serverPlayerList[i].name +'"/><span>' + serverPlayerList[i].name + '</span><br>';
		}
		nightFormAdd+= '<input id="nightFormButton" type="button" value="Shoot"/></form>';
		$nightForm.append(nightFormAdd);
		
	    }
	    
	    else{
	          let hunterName;
	         for(i=0; i<serverPlayerList.length; i++)
		     if(serverPlayerList[i].role == 2)
		         hunterName = serverPlayerList[i].name;
	          $stDialogue.prepend('<p>' + hunterName + ' is the hunter!</p>');
	    }
    });
    socket.on("hunter summary", function(choice){
	    for(i=0; i<serverPlayerList.length; i++)
		if(serverPlayerList[i].name===choice)
		    serverPlayerList[i].alive = false;
	    updateUsernames();
	    if(choice===myName){
		$nightPrompt.hide();
		$dayPrompt.hide();
		$stDialogue.prepend('<p>You have been killed and are now spectating</p>');
	    }
	    $stDialogue.prepend('<p> The hunter killed ' + choice + ' with their last breath</p>');
    });
    function updateUsernames(){
          $villagePlayerList.html("");
          for(i=0; i<serverPlayerList.length; i++)
          {
               if(serverPlayerList[i].alive){
                    $villagePlayerList.append('<li class="alive">'+serverPlayerList[i].name+'</li>');
               }
               else{
                    $villagePlayerList.append('<li class="dead">'+serverPlayerList[i].name+'</li>');
               }
          }
      }

      function updateBackground(){
	  if(!isNight){
	      $body.css("transition", "2s");
	      $body.css("background-image", 'url(../css/daybg.png)');
	      $body.css("background-color", "#6A56F4");
	      $villageChatInput.show();

	  }
	  else{
	      $body.css("transition", "2s");
	      $body.css("background-image", 'url(../css/nightbg.png)');
	      $body.css("background-color", "#615A91");
	      $villageChatInput.hide();
	  }
      } 
