package com.mindhubweb.salvo;



import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Entity
public class GamePlayer {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private long id;

    private LocalDateTime joinDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="player_id")
    private Player player;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="game_id")
    private Game game;

    @OneToMany(mappedBy="gamePlayer", fetch=FetchType.EAGER, cascade = CascadeType.ALL)
    Set<Transformer> transformers = new HashSet<>();

    @OneToMany(mappedBy="gamePlayer", fetch=FetchType.EAGER, cascade = CascadeType.ALL)
    Set<Salvo> salvoes = new HashSet<>();

    public GamePlayer() { }

    public GamePlayer(Game game,Player player,LocalDateTime localDateTime, Set<Transformer> transformers, Set<Salvo> salvoes) {
        this.game = game;
        this.player = player;
        this.joinDate = localDateTime;
        this.addTransformers(transformers);
        this.addSalvoes(salvoes);
    }

    public GamePlayer(Game game, Player player){
        this.game = game;
        this.player = player;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public LocalDateTime getLocalDateTime() {
        return joinDate;
    }

    public void setLocalDate(LocalDateTime localDateTime) {
        this.joinDate = localDateTime;
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


    public Set<Transformer> getTransformers() {
        return transformers;
    }

    public void addTransformer(Transformer transformer) {
        transformer.setGamePlayer(this);
        transformers.add(transformer);
    }


    public void addTransformers(Set<Transformer> transformers){
        transformers.stream().forEach(transformer -> {
            transformer.setGamePlayer(this);
            this.transformers.add(transformer);
        });
    }

    public Set<Salvo> getSalvoes() {
        return salvoes;
    }

    public void addSalvo(Salvo salvo) {
        salvo.setGamePlayer(this);
        salvoes.add(salvo);
    }

    public void addSalvoes(Set<Salvo> salvoes){
        salvoes.stream().forEach(salvo -> {
            salvo.setGamePlayer(this);
            this.salvoes.add(salvo);
        });
    }

    public Score getScore (){
        return this.player.getGameScore(this.game);
    }

    public Map<String, Object> gamePlayerDTO(){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", this.game.getId());
        dto.put("created", this.game.getCreationDate());
        dto.put("gamePlayer" , this.game.getGamePlayers().stream().map(GamePlayer::gamePlayersDTO));
        dto.put("transformers", this.transformers.stream().map(Transformer::transformersDTO).collect(Collectors.toList()));
        dto.put("salvoes", this.game.getGamePlayers().stream().flatMap(gamePlayer -> gamePlayer.getSalvoes().stream().map(Salvo::salvoesDTO)));
        return dto;
    }

    public Map<String, Object> gamePlayersDTO(){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", this.getId());
        dto.put("player", this.player.playersDTO());
        if (this.getScore() != null)
            dto.put("score", this.getScore().getPoints());
        else
            dto.put("score", this.getScore());
        return dto;
    }

}
