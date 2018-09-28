package com.mindhubweb.salvo;



import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import javax.persistence.CascadeType;

import static java.util.stream.Collectors.toList;


@Entity
public class Game {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private long id;

    private LocalDateTime creationDate;

    @OneToMany(mappedBy="game", fetch=FetchType.EAGER,cascade = CascadeType.ALL)
    Set<GamePlayer> gamePlayers;

    @OneToMany(mappedBy="game", fetch=FetchType.EAGER,cascade = CascadeType.ALL)
    Set<Score> scores;

    public Game() { }

    public Game(LocalDateTime localDateTime) {
        this.creationDate = localDateTime;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public LocalDateTime getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(LocalDateTime creationDate) {
        this.creationDate = creationDate;
    }

    public Set<GamePlayer> getGamePlayers() {
        return gamePlayers;
    }

    public void setGamePlayers(Set<GamePlayer> gamePlayers) {
        this.gamePlayers = gamePlayers;
    }

    public void addGamePlayer(GamePlayer gamePlayer) {
        gamePlayer.setGame(this);
        gamePlayers.add(gamePlayer);
    }
    public List<Player> getPlayers() {
        return gamePlayers.stream().map(GamePlayer::getPlayer).collect(toList());
    }

    public Set<Score> getScores() {
        return scores;
    }

    public void setScores(Set<Score> scores) {
        this.scores = scores;
    }

    public void addScore (Score score) {
        score.setGame(this);
        scores.add(score);
    }



    public Map<String, Object> gamesDTO() {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", this.getId());
        dto.put("created", this.getCreationDate());
        dto.put("gamePlayer", this.gamePlayers.stream().map(GamePlayer::gamePlayersDTO).collect(Collectors.toList()));
        return dto;
    }


}
