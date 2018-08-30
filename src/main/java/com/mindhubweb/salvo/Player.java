package com.mindhubweb.salvo;




import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.List;
import static java.util.stream.Collectors.toList;
import javax.persistence.CascadeType;

@Entity
public class Player {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private long id;

    private String userName;

    @OneToMany(mappedBy="player", fetch=FetchType.EAGER,cascade = CascadeType.ALL)
    Set<GamePlayer> gamePlayers;

    @OneToMany(mappedBy="player", fetch=FetchType.EAGER,cascade = CascadeType.ALL)
    Set<Score> scores;

    private Side side;

    private String password;

    public Player() { }

    public Player(String email, Side side, String password) {
        this.userName = email;
        this.side = side;
        this.password = password;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String toString() {
        return userName;
    }

    public Set<GamePlayer> getGamePlayers() {
        return gamePlayers;
    }

    public void setGamePlayers(Set<GamePlayer> gamePlayers) {
        this.gamePlayers = gamePlayers;
    }

    public void addGamePlayer(GamePlayer gamePlayer) {
        gamePlayer.setPlayer(this);
        gamePlayers.add(gamePlayer);
    }

    public Set<Score> getScores() {
        return scores;
    }

    public Score getGameScore (Game game) { return scores.stream().filter(score -> score.getGame().getId() == game.getId()).findAny().orElse(null);}

    public void setScores(Set<Score> scores) {
        this.scores = scores;
    }

    public void addScore (Score score) {
        score.setPlayer(this);
        scores.add(score);
    }

    @JsonIgnore
    public List<Game> getGames() {
        return gamePlayers.stream().map(GamePlayer::getGame).collect(toList());
    }

    public Side getSide() {
        return side;
    }

    public void setSide(Side side) {
        this.side = side;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Map<String, Object> playersDTO(){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", this.getId());
        dto.put("email", this.getUserName());
        dto.put("side", this.getSide());
        return dto;
    }

}
