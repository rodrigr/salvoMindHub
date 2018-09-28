var gridData;

function getGrid(gpId){
    $(".grid-head").html("");
    $(".grid-body").html("");
    $.get("/api/game_view/"+gpId).done(function(data){
        gridData = data;
        getPlayers(gpId)
        getCurrentPlayerData();

    })
}


function getGpId (str){
    var newStr = str.slice(str.indexOf("=")+1);
    return newStr;
}

var url = window.location.href;
getGrid(getGpId(url))

function getPlayers(pl){
    for (var i in gridData.gamePlayer){
        if (pl == gridData.gamePlayer[i].id){
            $("#p1").html(gridData.gamePlayer[i].player.email+" (you)")
            $("#user").html(gridData.gamePlayer[i].player.email)
            if(gridData.gamePlayer[i].player.side === "AUTOBOTS"){
                $("#user").addClass("aut-user").removeClass("dec-user")
            } else if (gridData.gamePlayer[i].player.side === "DECEPTICONS"){
                $("#user").addClass("dec-user").removeClass("aut-user")
            }
        } else if (pl != gridData.gamePlayer[i].id) {
            $("#p2").html(" "+gridData.gamePlayer[i].player.email+ "")
        }
    }
}

$("#logout-btn").click(function(){
        $.post("/api/logout").done(function(){
            window.location.replace("/web/games.html");
        })
    })

var currentPlayerData;

function getCurrentPlayerData(){
   $.get("/api/games").done(function(data){
        currentPlayerData = data.player;
        bkg();
        newGame();
        dinamicData();
        createSalvoesGrid();
        createGrid();
        getTurn();
        checkGameState()

   })
}

//

function bkg(){
   if(currentPlayerData.side === "AUTOBOTS"){
      $("body").addClass("gamevw-aut-bkg").removeClass("gamevw-dec-bkg");
   } else if (currentPlayerData.side === "DECEPTICONS"){
      $("body").addClass("gamevw-dec-bkg").removeClass("gamevw-aut-bkg");
   }
}

var data = [];

function addTransformers(){
    $.post({
        url: "/api/games/players/"+getGpId(url)+"/transformers",
        data: JSON.stringify(data),
        dataType: "text",
        contentType: "application/json"})
    .done(function(){
        console.log("done");
        getGrid(getGpId(url));
    })
    .fail(function(){
        console.log("fail");
        $("#error-msg").html("placing transformers was not possible");
    })
}

$("#place-btn").click(function(){
  $(".grid-stack-item").each(function(){
    var obj = new Object();
    var arr = [];
    if($(this).attr("data-gs-width") != "1"){
      for(var i = 0; i < parseInt($(this).attr("data-gs-width")); i++){
        arr.push(String.fromCharCode(parseInt($(this).attr("data-gs-y"))+65)+(parseInt($(this).attr("data-gs-x"))+i+1).toString());
      }
    } else{
      for(var i = 0; i < parseInt($(this).attr("data-gs-height")); i++){
        arr.push(String.fromCharCode(parseInt($(this).attr("data-gs-y"))+i+65)+(parseInt($(this).attr("data-gs-x"))+1).toString());
      }
    }
    
    obj.type = $(this).children().attr("alt");
    obj.cells = arr;
    data.push(obj);
  })
  addTransformers(); 
});

function changeBkg(){
  $("#bkg-choice").change(function(){
    $("#grid-container")
      .removeClass("none")
      .removeClass("aut-vs-dec")
      .removeClass("desert")
      .removeClass("cybertron")
      .removeClass("earth")
      .removeClass("tunnel")
      .removeClass("moon")
      .addClass($(this).val());
    $("#salvoes-table")
      .removeClass("none-noGrid")
      .removeClass("aut-vs-dec-noGrid")
      .removeClass("desert-noGrid")
      .removeClass("cybertron-noGrid")
      .removeClass("earth-noGrid")
      .removeClass("tunnel-noGrid")
      .removeClass("moon-noGrid")
      .addClass($(this).val()+"-noGrid");
  })
}

changeBkg();

function newGame(){
    if(gridData.transformers.length === 0){
        $("#new-game-form").show();
        $("#salvoes-field").hide();
    } else{
        $("#new-game-form").hide();
        $("#salvoes-field").show();
    }
}

//Function to change positions from vertical to horizontal and vice versa.

function changePositions(trfId, trf){
        $("#place-field").on('dblclick', trfId, function(){
          $("#error-msg").html("")
          var width = parseInt($(this).parent().attr("data-gs-width"));
          var height = parseInt($(this).parent().attr("data-gs-height"));
          var x = parseInt($(this).parent().attr("data-gs-x"));
          var y = parseInt($(this).parent().attr("data-gs-y"));
          
          if(height > width){
            for (var i = 0; i < height-1; i++){
            
              if (x == 9-i){
                return $("#error-msg").html("Careful! "+$(this).attr("alt")+" will fall out of the grid.");
              }
              if(grid.isAreaEmpty(x+1+i, y) == false){
                return $("#error-msg").html("Careful! you're going to kick somebody out of the grid")
              }
            }
            $(this).attr('src', "styles/images/"+trf+"_vh.png").attr('id', trf+"-vh");
            grid.resize($(this).parent(), height, width);
            
          }
          if(width > height){
            for (var i = 0; i < width-1; i++){
              if (y == 9-i){
                return $("#error-msg").html("Careful! "+$(this).attr("alt")+" will fall out of the grid.");
              }
              if(grid.isAreaEmpty(x, y+1+i) == false){
                return $("#error-msg").html("Careful! you're going to kick somebody out of the grid")
              }
            }
            $(this).attr('src', "styles/images/"+trf+"_vh_vertical.png").attr('id', trf+"-vh-vertical");
            grid.resize($(this).parent(), height, width);
            
          }
          
            
        })
    }
    


//Gridstack

function createGrid () {
    var options = {
        //grilla de 10 x 10
        width: 10,
        height: 10,
        //separacion entre elementos (les llaman widgets)
        verticalMargin: 0,
        //altura de las celdas
        cellHeight: 35,
        //desabilitando el resize de los widgets
        disableResize: true,
        //widgets flotantes
		float: true,
        //removeTimeout: 100,
        //permite que el widget ocupe mas de una columna
        disableOneColumnMode: true,
        //false permite mover, true impide
        staticGrid: 0,
        //activa animaciones (cuando se suelta el elemento se ve más suave la caida)
        animate: true
    }
    
    if(gridData.transformers.length === 0){
      options.staticGrid = false;
      $('.grid-stack').gridstack(options);
      grid = $('#grid').data('gridstack');

      if(typeof grid != 'undefined'){
              grid.removeAll();
              grid.destroy(false);
      }

      $('.grid-stack').gridstack(options);
      grid = $('#grid').data('gridstack');
      createTrfs();
      $("#field").attr("id", "place-field");
      changePositions("#optimus-vh", "optimus");
      changePositions("#optimus-vh-vertical", "optimus");
      changePositions("#bumblebee-vh", "bumblebee");
      changePositions("#bumblebee-vh-vertical", "bumblebee");
      changePositions("#ironhide-vh", "ironhide");
      changePositions("#ironhide-vh-vertical", "ironhide");
      changePositions("#ratchet-vh", "ratchet");
      changePositions("#ratchet-vh-vertical", "ratchet");
      changePositions("#sideswipe-vh", "sideswipe");
      changePositions("#sideswipe-vh-vertical", "sideswipe");
      changePositions("#megatron-vh", "megatron");
      changePositions("#megatron-vh-vertical", "megatron");
      changePositions("#brawl-vh", "brawl");
      changePositions("#brawl-vh-vertical", "brawl");
      changePositions("#starscream-vh", "starscream");
      changePositions("#starscream-vh-vertical", "starscream");
      changePositions("#blackout-vh", "blackout");
      changePositions("#blackout-vh-vertical", "blackout");
      changePositions("#barricade-vh", "barricade");
      changePositions("#barricade-vh-vertical", "barricade"); 
      
    } else{
      options.staticGrid = true;
      grid = $('#grid').data('gridstack');
      
      if(typeof grid != 'undefined'){
        grid.removeAll();
        grid.destroy(false);
      }
      
      $('.grid-stack').gridstack(options);
      grid = $('#grid').data('gridstack');
      createTrfs();
      $("#place-field").off('dblclick')
      $("#place-field").attr("id", "field");
      getTrfsLocations();

    }
  


}

function createTrfs(){
  var side = currentPlayerData.side;
  if (side === "AUTOBOTS"){
    grid.addWidget($('<div id="5-cells-trf"><img src="styles/images/optimus_vh.png" alt="optimus" id="optimus-vh" class="grid-stack-item-content d-block m-auto"></div>'), 0, 2, 5, 1, false);
    grid.addWidget($('<div id="4-cells-trf"><img src="styles/images/bumblebee_vh.png" alt="bumblebee" id="bumblebee-vh" class="grid-stack-item-content d-block m-auto"></div>'), 4, 1, 4, 1, false);
    grid.addWidget($('<div id="3-cells-trf"><img src="styles/images/ironhide_vh.png" alt="ironhide" id="ironhide-vh" class="grid-stack-item-content d-block m-auto"></div>'), 5, 8, 3, 1, false);
    grid.addWidget($('<div id="3-cells-trf-2"><img src="styles/images/ratchet_vh_vertical.png" alt="ratchet" id="ratchet-vh-vertical" class="grid-stack-item-content d-block m-auto"></div>'), 3, 5, 1, 3, false);
    grid.addWidget($('<div id="2-cells-trf"><img src="styles/images/sideswipe_vh_vertical.png" alt="sideswipe" id="sideswipe-vh-vertical" class="grid-stack-item-content d-block m-auto"></div>'), 10, 8, 1, 2, false);
  } else if (side === "DECEPTICONS"){
    grid.addWidget($('<div data-toggle="popover" data-placement="left" id="5-cells-trf"><img src="styles/images/megatron_vh.png" alt="megatron" id="megatron-vh" class="grid-stack-item-content d-block m-auto"></div>'), 0, 2, 5, 1, false);
    grid.addWidget($('<div id="4-cells-trf"><img src="styles/images/brawl_vh.png" alt="brawl" id="brawl-vh" class="grid-stack-item-content d-block m-auto"></div>'), 4, 1, 4, 1, false);
    grid.addWidget($('<div id="3-cells-trf"><img src="styles/images/barricade_vh.png" alt="barricade" id="barricade-vh" class="grid-stack-item-content d-block m-auto"></div>'), 5, 8, 3, 1, false);
    grid.addWidget($('<div id="3-cells-trf-2"><img src="styles/images/blackout_vh_vertical.png" alt="blackout" id="blackout-vh-vertical" class="grid-stack-item-content d-block m-auto"></div>'), 3, 5, 1, 3, false);
    grid.addWidget($('<div id="2-cells-trf"><img src="styles/images/starscream_vh_vertical.png" alt="starscream" id="starscream-vh-vertical" class="grid-stack-item-content d-block m-auto"></div>'), 10, 8, 1, 2, false);
  }
}

function getTrfsLocations (){
  for (var i in gridData.transformers){
        for (var j in gridData.transformers[i].location){
            $(".grid-stack-item").each(function(){
              if(gridData.transformers[i].type === $(this).children().attr("alt")){
                $(this).attr("data-gs-x", parseInt(gridData.transformers[i].location[0].slice(1))-1);
                $(this).attr("data-gs-y", parseInt(gridData.transformers[i].location[0].slice(0,1).charCodeAt(0))-65);
                
                if(gridData.transformers[i].location[0].slice(0,1) === gridData.transformers[i].location[1].slice(0,1) && $(this).children().attr("id") === $(this).children().attr("alt")+"-vh-vertical"){
                  if($(this).children().attr("id") === ($(this).children().attr("alt")+"-vh-vertical")){
                     var width = parseInt($(this).attr("data-gs-width"));
                     var height = parseInt($(this).attr("data-gs-height"));
                     $(this).attr("data-gs-width", height).attr("data-gs-height", width);
                     $(this).children().attr("src", "styles/images/"+$(this).children().attr("alt")+"_vh.png").attr("id", $(this).children().attr("alt")+"-vh");
                  } 
                  
                } else if (gridData.transformers[i].location[0].slice(0,1) !== gridData.transformers[i].location[1].slice(0,1) && $(this).children().attr("id") === $(this).children().attr("alt")+"-vh") {
                    var width = parseInt($(this).attr("data-gs-width"));
                     var height = parseInt($(this).attr("data-gs-height"));
                     $(this).attr("data-gs-width", height).attr("data-gs-height", width);
                     $(this).children().attr("src", "styles/images/"+$(this).children().attr("alt")+"_vh_vertical.png").attr("id", $(this).children().attr("alt")+"-vh-vertical");
                  }
              }
            })
        }
    }
getSalvoesLocations();
}

function createSalvoesGrid (){
    for (var i=0; i<=10; i++){
        $(".grid-head").append("<th class='border border-secondary' id='"+i+"'>"+i+"</th>");
    }

    $("#0").html("")

    for (i=65; i<=74; i++){
        $(".grid-body").append("<tr class='"+String.fromCharCode(i)+"'><td class='col-header border border-secondary'>"+String.fromCharCode(i)+"</td></tr>");
    }

    for (var j=1; j<=10; j++){
        $(".grid-body tr").each(function(){$(this).append("<td class='cell border border-secondary' id='"+$(this).attr("class")+j+"'></td>")})
    }


}

function getSalvoesLocations(){
    
    var id = currentPlayerData.id;
    gridData.salvoes.map(function(salvo){
      
      
        for(var i in salvo.locations){
              var shot =  salvo.locations[i];
              var x = parseInt(shot.slice(1))-1;
              var y = shot.slice(0,1).charCodeAt(0)-65;
              
              if(salvo.player == id){
                
                if(salvo.hits.indexOf(shot) > -1){
                    $("#salvoes-field #"+shot).addClass("hit");
                } else {
                    $("#salvoes-field #"+shot).addClass("salvo");
                }
                salvo.sinks.map(function(item){
                    $("#"+item.type+"-icon").addClass("enemy-down");
                    for(var cell in item.location){
                        $("#salvoes-field #"+item.location[cell]).addClass("sunk").removeClass("hit");
                    }
                })
              } else{
                
                gridData.transformers.map(function(trf){
                    if(trf.location.indexOf(shot) > -1 ){
                      
                       $("#grid").append('<div id="'+shot+'-down" style="position:absolute; top:'+y*35+'px; left:'+x*35+'px" class="trf-down" ></div>');
                    }
                
                })
                
              }

        }
    })
}






$("#salvoes-field").on('click', '.cell', function(){
  if(!$(this).hasClass("salvo") && !$(this).hasClass("targeted")){
    $(this).addClass("targeted");
  } else if($(this).hasClass("targeted")){
    $(this).removeClass("targeted");
  }
})

var salvoesData = {};

function addSalvoes(){
    $.post({
        url: "/api/games/players/"+getGpId(url)+"/salvoes",
        data: JSON.stringify(salvoesData),
        dataType: "text",
        contentType: "application/json"})
    .done(function(){
        console.log("done");
        getGrid(getGpId(url));
    })
    .fail(function(){
        console.log("fail");
        $("#error-msg-salvo").html("salvo shoot was not possible");
    })
}


$("#shoot-btn").click(function(){
  $("#error-msg-salvo").html("");
  var shotsLeft = gridData.gamePlayer.map(function(gp){
    if(gp.player.id == currentPlayerData.id){
        return gp.shots_left;
    }
  }).join('');
  var arr = [];
  if($(".targeted").length == shotsLeft){
      $(".cell").each(function(){
      if($(this).hasClass("targeted") ){
        arr.push($(this).attr("id"));
      }
    })

    salvoesData.turn = getTurn();
    salvoesData.shots = arr;

    addSalvoes();
    
  } /*else if ($(".targeted").length == 100){
    $("#grid-container")
      .removeClass("none")
      .removeClass("aut-vs-dec")
      .removeClass("desert")
      .removeClass("cybertron")
      .removeClass("earth")
      .removeClass("tunnel")
      .addClass("megan-easter");
    $("#salvoes-table")
      .removeClass("none-noGrid")
      .removeClass("aut-vs-dec-noGrid")
      .removeClass("desert-noGrid")
      .removeClass("cybertron-noGrid")
      .removeClass("earth-noGrid")
      .removeClass("tunnel-noGrid")
      .addClass("megan-easter-noGrid");
    $(".cell").each(function(){
      $(this).removeClass("targeted")
    });
    
  } else if($("#A3, #A4, #A5, #A6, #A7, #A8, #B2, #B9, #C1, #C10,  #D1, #D10, #E1, #E10, #F1, #F10, #G1, #G10, #H1, #H10, #I2, #I9, #A3, #J4, #J5, #J6, #J7, #J8").hasClass("targeted")){
      $("#salvoes-field div:first").append("<img style='height: 100px' src='styles/images/optimus_dance.gif'>");
    $(".cell").each(function(){
      $(this).removeClass("targeted")
    });
  }*/else{
    $("#error-msg-salvo").html("you need to shoot "+ shotsLeft +" times")
  }
  
})

function getTurn (){
  var arr=[]
  var turn = 0;
  //gridData.salvoes.map(salvo => (salvo.id == currentPlayerData.id) ? arr.push(salvo.turn));
  gridData.salvoes.map(function(salvo){
    if(salvo.player == currentPlayerData.id){
      arr.push(salvo.turn);
    }
  })
  turn = Math.max.apply(Math, arr);
  
  if (turn == -Infinity){
    return 1;
  } else {
    return turn + 1;
  }
  
}

function dinamicData(){
  $("#turn").html(getTurn());
  if(currentPlayerData.side == "AUTOBOTS"){
    $("#p1").css({"color":"#8C1717"})
    $("#p2").css({"color":"#380474"})
    $("#team-title").html('<img class="trf-icon" src="styles/images/AutobotsIcon.png">'+currentPlayerData.side+' TEAM');
    $("#enemies").html("<img data-toggle='popover' data-placement='right' class='enemy-icon decepticon' src='styles/images/Megatron_icon.png' id='megatron-icon'><img data-toggle='popover' data-placement='right' class='enemy-icon decepticon' src='styles/images/Brawl_icon.png' id='brawl-icon'><img data-toggle='popover' data-placement='right' class='enemy-icon decepticon' src='styles/images/Barricade_icon.png' id='barricade-icon'><img data-toggle='popover' data-placement='right' class='enemy-icon decepticon' src='styles/images/Blackout_icon.png' id='blackout-icon'><img data-toggle='popover' data-placement='right' class='enemy-icon decepticon' src='styles/images/Starscream_icon.png' id='starscream-icon'>")
  } else if(currentPlayerData.side == "DECEPTICONS"){
    $("#p1").css({"color":"#380474"})
    $("#p2").css({"color":"#8C1717"})
    $("#team-title").html('<img  class="trf-icon" src="styles/images/Decepticon.png">'+currentPlayerData.side+' TEAM');
    $("#enemies").html("<img data-toggle='popover' data-placement='right' class='enemy-icon autobot' src='styles/images/Optimus_Prime_icon.png' id='optimus-icon'><img data-toggle='popover' data-placement='right' class='enemy-icon autobot' src='styles/images/Bumblebee_icon.png' id='bumblebee-icon'><img data-toggle='popover' data-placement='right' class='enemy-icon autobot' src='styles/images/Ironhide_icon.png' id='ironhide-icon'><img  data-toggle='popover' data-placement='right' class='enemy-icon autobot' src='styles/images/Ratchet_icon.png' id='ratchet-icon'><img data-toggle='popover' data-placement='right' class='enemy-icon autobot' src='styles/images/Sideswipe_icon.png' id='sideswipe-icon'>")
  }
  popOver();
}

function popOver(){
  $('#megatron-icon').popover({title:"Megatron", content: "5 cells<br>Leader of the Decepticons", html: true, trigger: "hover"});
  $('#brawl-icon').popover({title:"Brawl", content: "4 cells", html: true, trigger: "hover"});
  $('#barricade-icon').popover({title:"Barricade", content: "3 cells", html: true, trigger: "hover"});
  $('#blackout-icon').popover({title:"Blackout", content: "3 cells", html: true, trigger: "hover"});
  $('#starscream-icon').popover({title:"Starscream", content: "2 cells", html: true, trigger: "hover"});
  $('#optimus-icon').popover({title: "Optimus Prime", content: "5 cells<br>Leader of the Autobots", html: true, trigger: "hover"})
  $('#bumblebee-icon').popover({title:"Bumblebee", content: "4 cells", html: true, trigger: "hover"});
  $('#ironhide-icon').popover({title:"Ironhide", content: "3 cells", html: true, trigger: "hover"});
  $('#ratchet-icon').popover({title:"Ratchet", content: "3 cells", html: true, trigger: "hover"});
  $('#sideswipe-icon').popover({title:"Sideswipe", content: "2 cells", html: true, trigger: "hover"});
}

function checkGameState(){
    gridData.gamePlayer.map(function(gp){
        if(gp.player.id == currentPlayerData.id){
            if(gp.game_state == "WAIT_OPPONENT_JOIN"){
               $("#place-btn").html("Waiting an opponent")
               $("#place-btn").prop("disabled", true)
            } else if(gp.game_state == "PLACE_TRANSFORMERS"){
                $("#place-btn").html("Place Transformers")
                $("#place-btn").prop("disabled", false)
            }

            if(gp.game_state == "WAIT_OPPONENT_TRANSFORMERS"){
                $("#shoot-btn").html("Wait opponent's transformers")
            } else if(gp.game_state == "ENTER_SALVOES"){
                $("#shoot-btn").html("Shoot!")
                $("#shoot-btn").prop("disabled", false)
                $("#battle-log").html("Shoot! You've got "+gp.shots_left+" shots left.")
                var missile = "<img src='styles/images/missile.png' class='missile'>"
                $("#missile-field").html(missile.repeat(gp.shots_left))
            } else if(gp.game_state == "WAIT_OPPONENT_SALVOES"){
                $("#shoot-btn").html("Wait opponent's move")
                $("#shoot-btn").prop("disabled", true)
                $("#battle-log").html("Waiting opponent's move...")
            }

            if(gp.game_state == "WIN"){
                if(currentPlayerData.side == "AUTOBOTS"){
                   $("#win").addClass("autobots-victory")
                } else {
                    $("#win").addClass("decepticons-victory")
                }
                $("#play-field").hide(1000);
                $("#win").show(1000);
            } else if (gp.game_state == "LOSE"){
                if(currentPlayerData.side == "AUTOBOTS"){
                   $("#lose").addClass("autobots-defeated")
                } else {
                    $("#lose").addClass("decepticons-defeated")
                }
                $("#play-field").hide(1000);
                $("#lose").show(1000);
            } else if (gp.game_state == "DRAW"){
                $("#draw").show(1000)
            }
        }
    })
}

$(document).ready(function(){
var timer;

function checkForUpdates(gpId){
    timer = setInterval(function() {
        $.get("/api/game_view/"+gpId)
        .done(function(data){
           gridData = data;
           getPlayers(gpId);
           getSalvoesLocations();
           checkGameState();
        })

    }, 5000);
}

checkForUpdates(getGpId(url));

})

