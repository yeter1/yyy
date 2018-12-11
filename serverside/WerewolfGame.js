/* Werewolf.js -- Server logic and async loops for gameplay
    [1] Code written as functions so it may be implemented with currrent server
*/
//packaged essential parts of the game into an export

// Werewolf player roles
var Player  = require("./Player.js");
var RoleEnum = {
    WEREWOLF : 0,
    SEER : 1,
    HUNTER : 2,
    VILLAGER : 3,
    // Secondary roles. Will be implemented in 2.0
    PRIEST : 4,
    TANNER : 5,
    MINION : 6
}

/* EXAMPLE 1: Initialize a player
    var p1 = new Player({"Marcus42",connections[0]},RoleEnum.WEREWOLF)
*/
game = class WerewolfGame {

     constructor(users){
          console.log("Entering Werewolf Game...");
          const NUM_WEREWOLVES = 1;
          const NUM_SEER = 1;
          const NUM_HUNTER = 0;
          const NUM_VILLAGER = users.length - NUM_WEREWOLVES - NUM_SEER - NUM_HUNTER;

         // Step 1: Determine random roles for each game connection
         this.players = [];// new HashTable(25); // Create a hashtable with 24 buckets   //idk the plan here but its def not working
         // We must select two indices at random to be the werewolves.
         var sele = []; //sele is a copy of user array  //new Array DOES NOT COPY, adds array into an array
              for(i=0; i<users.length; i++){
                sele[i] = users[i];
              }
         var targLength = sele.length - NUM_WEREWOLVES; // There will be two
         var state = RoleEnum.WEREWOLF;
         while (sele.length > 0)
         {
             // Select random index. That user will become a werewolf
             var randIndex = Math.floor(Math.random() * sele.length); //if changed to hash add +1
             var username = sele[randIndex];


            // this.players.push({key:username,role:state})          //this.players.add({key:username,value: new Player(gc,RoleEnum.WEREWOLF)})
            this.players.push(new Player(username, state)); // player(name, role)
             // Remove the user and connection at those indices

             sele.splice(randIndex,1);


             if(sele.length == targLength){
                 // We need to switch to the next state
                 state += 1;
                 if (state == RoleEnum.SEER) { targLength = sele.length - NUM_SEER}
                 else if (state == RoleEnum.HUNTER) { targLength = sele.length - NUM_HUNTER}
                 else if (state == RoleEnum.VILLAGER) { targLength = sele.length - NUM_VILLAGER}
                 else {}
              }
                 // We are done we should exit,  eh it do that for us
         }
         console.log("Roles complete, the roles are as follows: ")
           for(i=0; i<this.players.length;i++){
                 console.log(this.players[i].name + " is a " + this.players[i].role);
           }
     }
//end of constructor



//THIS IS WHERE THE METHODS OF THE GAME WILL GO
//_______________________________________________________________________________


          day(dayResList){
//sift through list, person who's nmame appears the most on the list set to alive to false
               var modeMap = {};
               var modeEl = dayResList[0];
               var maxCount = 1;
               var retString;
               var duplicates =0;
               for(i = 0; i < dayResList.length; i++)
               {
                    var el = dayResList[i];
                    if(modeMap[el] == null)
                         modeMap[el] = 1;
                    else
                         modeMap[el]++;
                    if(modeMap[el] > maxCount)
                    {
                         modeEl = el;
                         maxCount = modeMap[el];
                    }
               }
               //make sure there is not a tie (have to restart vote if there is)
               for(let key in modeMap){
                    if(modeMap[key]==maxCount){
                         duplicates++;
                    }
               }
               if(duplicates>1){
                    retString="ERR_TIE";
               }
               //no tie, kill mode player
               else{
                    for(i=0; i<this.players.length; i++){
                         if(this.players[i].name === modeEl)
                              this.players[i].alive = false;
                    }
                    retString =  modeEl;
               }
               return retString;
               }

//returns string, if string is "ERR_TIE", then call day again. if not, call night




          night(nightResList){
//same thing as day, but only werewolfs vote
//returns string, if string is "ERR_TIE", then call night again. if not, call day
	      if(nightResList.length == 1) return nightResList[0];

	      var modeMap = {};
	      var modeEl = nightResList[0];
	      var maxCount = 1;
	      var retString;
	      var duplicates =0;
	      for(i = 0; i < nightResList.length; i++)
		  {
		      var el = nightResList[i];
		      if(modeMap[el] == null)
			  modeMap[el] = 1;
		      else
			  modeMap[el]++;
		      if(modeMap[el] > maxCount)
			  {
			      modeEl = el;
			      maxCount = modeMap[el];
			  }
		  }
	      //make sure there is not a tie (have to restart vote if there is)                                                                                                     
	      for(let key in modeMap){
		  if(modeMap[key]==maxCount){
		      duplicates++;
		  }
	      }
	      if(duplicates>1){
		  retString="ERR_TIE";
	      }
	      //no tie, kill mode player                                                                                                                                            
	      else{
		  for(i=0; i<this.players.length; i++){
		      if(this.players[i].name === modeEl)
			  this.players[i].alive = false;
		  }
		  retString =  modeEl;
	      }
	      return retString;
	  }
    get alivePlayers(){
	let counter =0;
	for(i=0; i<this.players.length; i++){
	    if(this.players[i].alive)
		counter++;
	}
	return counter;
    }
	
	get numWolfs(){
	      let counter =0;
	      for(i=0; i<this.players.length; i++){
		  if(this.players[i].role==0 && this.players[i].alive)
		      counter++;
	      }
	      return counter;
          }

          isGameOver(){
               //two win conditions: ONLY WEREWOLFS ARE ALIVE or ALL WEREWOLVES ARE DEAD AND at least 1 villager is alive
               let numAliveWolves= this.numWolfs;
               let numAliveVillagers = this.alivePlayers - numAliveWolves; // the correct number we are looking for is NON Werewolfs.
              
	       console.log("Checking win conditions...");
	       console.log("Wolfs: "+ numAliveWolves);
	       console.log("Villagers "+ numAliveVillagers);
             
	       if(numAliveWolves==0 && numAliveVillagers>=1) //no werewolves!
		   return true;
	       else if(numAliveWolves>0 && numAliveVillagers<=1) //no villagers, only werewolves! Also resolves 1v1 conflict
		   return true;
	       else
		   return false;
               
          }

           results(){
	       let numAliveWolves= this.numWolfs;
               let numAliveVillagers = this.alivePlayers - numAliveWolves;
	   
	       if(numAliveWolves==0 && numAliveVillagers>=1) //no werewolves!                                                                                                       
                   return "Villagers Win!";
	       else //no villagers, only werewolves!                                                                                  
		   return "Werewolves Win!";
  
	   }
}
// Players should be mapped into a map with dictionaries as elements
// to sort them for easy access

module.exports = game; //packages the pseudo constructor so it may be called elsewhere
