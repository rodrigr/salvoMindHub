package com.mindhubweb.salvo;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Entity
public class Salvo {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="gamePlayer_id")
    private GamePlayer gamePlayer;

    private int turn;

    @ElementCollection
    @Column(name="salvoLocation")
    private List<String> shots = new ArrayList<>();

    public Salvo () { }

    public Salvo (int turn, List<String> shots){
        this.turn = turn;
        this.shots = shots;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public GamePlayer getGamePlayer() {
        return gamePlayer;
    }

    public void setGamePlayer(GamePlayer gamePlayer) {
        this.gamePlayer = gamePlayer;
    }

    public int getTurn() {
        return turn;
    }

    public void setTurn(int turn) {
        this.turn = turn;
    }

    public List<String> getShots() {
        return shots;
    }

    public void setShots(List<String> shots) {
        this.shots = shots;
    }

    public void addShots (List<String> shots) {

        this.shots.addAll(shots);
    }

    public Map<String, Object> salvoesDTO (){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("turn", this.getTurn());
        dto.put("player", this.getGamePlayer().getPlayer().getId());
        dto.put("locations", this.getShots());
        return dto;
    }
}
