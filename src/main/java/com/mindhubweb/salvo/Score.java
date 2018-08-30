package com.mindhubweb.salvo;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Entity
public class Score {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="player_id")
    private Player player;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="game_id")
    private Game game;

    private float points;

    private LocalDateTime finishDate;

    public Score () { }

    public Score(Player player, Game game, float points, LocalDateTime finishDate) {
        this.player = player;
        this.game = game;
        this.points = points;
        this.finishDate = finishDate;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Player getPlayer() {
        return player;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }

    public Game getGame() {
        return game;
    }

    public void setGame(Game game) {
        this.game = game;
    }

    public double getPoints() {
        return points;
    }

    public void setPoints(float points) {
        this.points = points;
    }

    public LocalDateTime getFinishDate() {
        return finishDate;
    }

    public void setFinishDate(LocalDateTime finishDate) {
        this.finishDate = finishDate;
    }

    public Map<String, Object> scoreDTO(){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("points", this.points);
        return dto;
    }
}
