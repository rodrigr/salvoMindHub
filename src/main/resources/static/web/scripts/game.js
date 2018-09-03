var gridData;

function getGrid(gpId){
    $.get("/api/game_view/"+gpId).done(function(data){
        gridData = data;
        getPlayers(gpId)
        createGrid();
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

function createGrid (){
    for (var i=0; i<=10; i++){
        $(".grid-head").append("<th id='"+i+"'>"+i+"</th>");
    }

    $("#0").html("")

    for (i=65; i<=74; i++){
        $(".grid-body").append("<tr class='"+String.fromCharCode(i)+"'><td class='col-header'>"+String.fromCharCode(i)+"</td></tr>");
    }

    for (var j=1; j<=10; j++){
        $(".grid-body tr").each(function(){$(this).append("<td class='"+$(this).attr("class")+j+"'></td>")})
    }

    getTrfsLocations();
    getSalvoesLocations();

}


function getTrfsLocations (){
    for (var i in gridData.transformers){
        for (var j in gridData.transformers[i].location){
            if(gridData.transformers[i].location[j] == $("#transformers-field ." + gridData.transformers[i].location[j] + "").attr("class") ){
                $("#transformers-field ." + gridData.transformers[i].location[j] + "").addClass("trf").addClass(getSide());
            }
        }
    }
}

function getSalvoesLocations (){
    for (var i in gridData.salvoes){
        for (var j in gridData.salvoes[i].locations){
            for (var k in gridData.gamePlayer){
                if (gridData.gamePlayer[k].id == getGpId(url)){
                    if (gridData.salvoes[i].player == gridData.gamePlayer[k].player.id && $("#salvoes-field td").hasClass(gridData.salvoes[i].locations[j])){
                        $("#salvoes-field ." + gridData.salvoes[i].locations[j] + "").addClass("salvo").html(gridData.salvoes[i].turn);
                    } else if (gridData.salvoes[i].player != gridData.gamePlayer[k].player.id && $("#transformers-field ."+ gridData.salvoes[i].locations[j] +"").hasClass("trf")){
                        $("#transformers-field ." + gridData.salvoes[i].locations[j] + "").removeClass("trf").addClass("trf-down").html(gridData.salvoes[i].turn);
                    }
                }
            }
        }
    }
}

function getSide(){
    var autobots = "trf-aut"
    var decepticons = "trf-dec"
    for (var i in gridData.gamePlayer){
        if(gridData.gamePlayer[i].id == getGpId(url)){
            if(gridData.gamePlayer[i].player.side == "AUTOBOTS"){
                return autobots;
            } else if(gridData.gamePlayer[i].player.side == "DECEPTICONS"){
                return decepticons;
            }
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
   })
}

getCurrentPlayerData();

function bkg(){
   if(currentPlayerData.side === "AUTOBOTS"){
      $("body").addClass("gamevw-aut-bkg").removeClass("gamevw-dec-bkg");
   } else if (currentPlayerData.side === "DECEPTICONS"){
      $("body").addClass("gamevw-dec-bkg").removeClass("gamevw-aut-bkg");
   }
}

