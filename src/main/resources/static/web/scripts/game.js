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
        createGrid();
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
      .addClass($(this).val());
  })
}

changeBkg();

function newGame(){
    if(gridData.transformers.length === 0){
        $("#new-game-form").show();
        if (currentPlayerData.side === "DECEPTICONS" ){
          $("#optimus-vh").attr("src", "styles/images/brawl_vh.png").attr("id", "brawl-vh").attr("alt", "brawl");
          $("#bumblebee-vh").attr("src", "styles/images/barricade_vh.png").attr("id", "barricade-vh").attr("alt", "barricade");
          $("#ironhide-vh").attr("src", "styles/images/megatron_vh.png").attr("id", "megatron-vh").attr("alt", "megatron");
          $("#ratchet-vh-vertical").attr("src", "styles/images/blackout_vh_vertical.png").attr("id", "blackout-vh-vertical").attr("alt", "blackout");
          $("#sideswipe-vh-vertical").attr("src", "styles/images/starscream_vh_vertical.png").attr("id", "starscream-vh-vertical").attr("alt", "starscream");
        }
    } else{
        $("#new-game-form").hide();
        if (currentPlayerData.side === "DECEPTICONS" ){
          $("#optimus-vh").attr("src", "styles/images/brawl_vh.png").attr("id", "brawl-vh").attr("alt", "brawl");
          $("#bumblebee-vh").attr("src", "styles/images/barricade_vh.png").attr("id", "barricade-vh").attr("alt", "barricade");
          $("#ironhide-vh").attr("src", "styles/images/megatron_vh.png").attr("id", "megatron-vh").attr("alt", "megatron");
          $("#ratchet-vh-vertical").attr("src", "styles/images/blackout_vh_vertical.png").attr("id", "blackout-vh-vertical").attr("alt", "blackout");
          $("#sideswipe-vh-vertical").attr("src", "styles/images/starscream_vh_vertical.png").attr("id", "starscream-vh-vertical").attr("alt", "starscream");
        }
    }
}



function changePositions(trfId, trf){
        $("#place-field").on('dblclick', trfId, function(){
          $("#error-msg").html("")
          var width = parseInt($(this).parent().attr("data-gs-width"));
          var height = parseInt($(this).parent().attr("data-gs-height"));
          var x = parseInt($(this).parent().attr("data-gs-x"));
          var y = parseInt($(this).parent().attr("data-gs-y"));
          var id = $(this).attr('id');
          if(id === trf+"-vh-vertical"){
            for (var i = 0; i < height-1; i++){
            
              if ($(this).parent().attr("data-gs-x") == 9-i){
                return $("#error-msg").html("Careful! "+$(this).attr("alt")+" will fall out of the grid.");
              }
              if(grid.isAreaEmpty(x+1+i, y) == false){
                return $("#error-msg").html("Careful! you're going to kick somebody out of the grid")
              }
            }
            $(this).attr('src', "styles/images/"+trf+"_vh.png").attr('id', trf+"-vh");
            grid.resize($(this).parent(), height, width);
            
          }
          if(id === trf+"-vh"){
            for (var i = 0; i < width-1; i++){
              if ($(this).parent().attr("data-gs-y") == 9-i){
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
        cellHeight: 45,
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
        grid.destroy(false);
      }
      
      $('.grid-stack').gridstack(options);
      grid = $('#grid').data('gridstack');
      $("#place-field").off('dblclick')
      $("#place-field").attr("id", "field");
      getTrfsLocations();
    }
  
   
/*
    //agregando un elmento(widget) desde el javascript
    grid.addWidget($('<div id="carrier2"><div class="grid-stack-item-content carrierHorizontal"></div><div/>'),
        1, 5, 3, 1, false, 1, 3, 1, 3, "carrier");

    grid.addWidget($('<div id="patroal2"><div class="grid-stack-item-content patroalHorizontal"></div><div/>'),
        1, 8, 3, 1, false, 1, 3, 1, 3, "carrier");
*/
    //verificando si un area se encuentra libre
    //no está libre, false
    //console.log(grid.isAreaEmpty(1, 8, 3, 1));
    //está libre, true
    //console.log(grid.isAreaEmpty(1, 7, 3, 1));

    //todas las funciones se encuentran en la documentación
    //https://github.com/gridstack/gridstack.js/tree/develop/doc
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
}
