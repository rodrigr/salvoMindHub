package com.mindhubweb.salvo;

import javax.persistence.*;
import java.util.*;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.toList;

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
        dto.put("hits", this.getHits());
        dto.put("sinks", this.getSinks());
        return dto;
    }




    private Optional<GamePlayer> getOpponentGamePlayer(){
        return this.getGamePlayer().getGame().getGamePlayers().stream().filter(gp -> gp.getId() != this.gamePlayer.getId()).findFirst();
    }

    private List<String> getHits (){

        return shots.stream()
                .filter(shot -> getOpponentGamePlayer().get().getTransformers().stream().anyMatch(trf -> trf.getCells().contains(shot)))
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> getSinks (){
        List<String> allShots = new ArrayList<>();
         this.gamePlayer.getSalvoes().stream()
                 .filter(salvo -> salvo.getTurn() <= this.getTurn())
                 .forEach(salvo -> allShots.addAll(salvo.getShots()));

         return getOpponentGamePlayer().get().getTransformers().stream()
                .filter(trf -> allShots.containsAll(trf.getCells()))
                .map(Transformer::transformersDTO)
                .collect(Collectors.toList());
    }
}
