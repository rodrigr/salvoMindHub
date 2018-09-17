var stats = {
    "positions": []
}

function getData(){
    stats.positions = [];
    $.get("/api/games").done(function(data){
        app.gameData = data;
        changeDateFormat();
        makeStats();
        toggleButtons();
        bkg();
        createGameButton();
        profilePopOver();
    });
}

$(getData());


function makeStats (){
    for (var i in app.gameData.games){
        for (var j in app.gameData.games[i].gamePlayer){
            var check = stats.positions.find(function(player){ return player.id == app.gameData.games[i].gamePlayer[j].player.id });
            if (check == undefined){
                var obj = new Object();
                obj.id = app.gameData.games[i].gamePlayer[j].player.id;
                obj.email = app.gameData.games[i].gamePlayer[j].player.email;
                obj.side = app.gameData.games[i].gamePlayer[j].player.side;
                obj.points = 0;
                obj.won = 0;
                obj.lost = 0;
                obj.tied = 0;
                stats.positions.push(obj);
            }
            calculate(app.gameData.games[i].gamePlayer[j].score, app.gameData.games[i].gamePlayer[j].player.id);

        }
    }

}

function calculate (score, playerId){
    stats.positions.map(function(position){
        if ( playerId == position.id ){
            position.points += score;
            if (score === 1.0){
                position.won += 1;
            } else if (score === 0.0){
                position.lost += 1;
            } else if (score === 0.5){
                position.tied += 1;
            }
        }
    })
}

var app = new Vue({
    el: "#app",
    data: {
        gameData: [],
        theaders: ["Player", "Pts.", "W.", "L.", "T."],
        statsData: stats
    }
});

function changeDateFormat (){
    for (var i in app.gameData.games){
        var newDate = new Date(app.gameData.games[i].created).toLocaleString();
        app.gameData.games[i].created = newDate
    }
}


$("#login-btn").click(login);

function login(){
      if(!$("#username-field").val() || !$("#password-field").val() ){
        $("#alert").html("Empty fields");
      } else if (!correctEmailFormat($("#username-field").val())){
         $("#alert").html("Please enter an email")
      } else {
            $.post("/api/login", { username: $("#username-field").val(), password: $("#password-field").val() })
                      .done(function() {
                        $("#alert").html("");
                        $("#login-form").modal("hide");
                        getData();
                      })
                      .fail(function(){
                          $("#alert").html("Wrong username or password")
                      })
      }
}

function correctEmailFormat(email){
    var RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    return RegExp.test(email);
}


$("#logout-btn").click(function(){
        $.post("/api/logout")
        .done(function(){
            getData();
        })
        .fail(function(){
            alert("logout failed");
        })
    })

$("#signup-btn").click(function(){
    if(!$("#username-field").val() || !$(".side-field:checked").val() || !$("#password-field").val()){
        $("#alert").html("Empty fields")
    } else if (!correctEmailFormat($("#username-field").val())){
        $("#alert").html("Please enter an email")
    } else {
        $.post("/api/players", { username: $("#username-field").val(), side: $(".side-field:checked").val(), password: $("#password-field").val()})
            .done(function() {
                login();
                $("#alert").html("");
                $("#login-form").modal("hide");
            })
            .fail(function(){
                $("#alert").html("Sign up failed");
            })
    }

})

function toggleButtons(){
    if(app.gameData.player == "guest"){
        $("#logout-btn").addClass("hidden");
        $("#nav-login").removeClass("hidden");
        $("#user").html("");
        $("#user").removeClass("aut-user").removeClass("dec-user")
    } else {
        $("#nav-login").addClass("hidden");
        $("#logout-btn").removeClass("hidden");
        $("#user").html(app.gameData.player.email);
        $("#user").addClass(function(){
            if(app.gameData.player.side === "AUTOBOTS"){
                return "aut-user";
            } else if (app.gameData.player.side === "DECEPTICONS"){
                return "dec-user"
            }
        })
    }
}

function bkg(){
    if(app.gameData.player == "guest"){
        $("body").addClass("guest-bkg").removeClass("dec-bkg").removeClass("aut-bkg")
    } else if(app.gameData.player.side == "AUTOBOTS"){
        $("body").addClass("aut-bkg").removeClass("guest-bkg");
    } else if(app.gameData.player.side == "DECEPTICONS"){
        $("body").addClass("dec-bkg").removeClass("guest-bkg");
    }
}


$("#new_user").change(function(){
    $("#side-form").toggle();
    $("#signup-btn").toggle();
    $("#login-btn").toggle();
    $("#login-form .modal-content").removeClass("welcome-dec").removeClass("welcome-aut")
    $(".side-field").prop("checked", false);
    $("#megatron").hide()
    $("#optimus").hide()
})

function welcome(){
    $(".side-field").change(function(){
        if($(".side-field:checked").val() === "AUTOBOTS"){
            $("#login-form .modal-content").addClass("welcome-aut").removeClass("welcome-dec")
            $("#megatron").hide()
            $("#optimus").show()
        } else if ($(".side-field:checked").val() === "DECEPTICONS"){
            $("#login-form .modal-content").addClass("welcome-dec").removeClass("welcome-aut")
            $("#megatron").show()
            $("#optimus").hide()
        } else{
            $("#login-form .modal-content").removeClass("welcome-dec").removeClass("welcome-aut")
        }
    })
}

welcome();

$(".close").click(clear);

function clear(){
    $("#username-field").val("");
    $("#password-field").val("");
    $("#new_user").prop("checked", false);
    $("#side-form").hide();
    $("#signup-btn").hide();
    $("#login-btn").show();
    $("#login-form .modal-content").removeClass("welcome-dec").removeClass("welcome-aut")
    $(".side-field").prop("checked", false);
    $("#megatron").hide()
    $("#optimus").hide()
}

function createGameButton(){
    if (app.gameData.player != "guest"){
        $("#create-btn").show();
    } else {
        $("#create-btn").hide();
    }
}

$("#create-btn").click(createGame)

function createGame(){
    $.post("/api/games")
    .done(function(data){
        window.location.href = "/web/game.html?gp="+data.gpid
    })
    .fail(function(){
        $("#error-msg").html("something went wrong creating the game")
    })
}

$("#app").on("click", ".join-btn", function(){
    $.post("/api/game/"+$(this).attr("data-game")+"/players")
    .done(function(data){
        window.location.replace("/web/game.html?gp="+data.gpid)
    })
    .fail(function(){
        $("#error-msg").html("something went wrong joining the game")
    })
})

function profilePopOver(){
  $("#user").attr("title", "Player info:").attr("data-content","Side: "+app.gameData.player.side+"<br>Points: "+app.gameData.player.points);
  $('[data-toggle="popover"]').popover({html: true});
}