package com.mindhubweb.salvo.model;



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

    public GamePlayer(Set<Transformer> transformers){
        this.addTransformers(transformers);
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
        dto.put("game_state", getGameState());
        dto.put("shots_left", shotsToMake());
        if (this.getScore() != null)
            dto.put("score", this.getScore().getPoints());
        else
            dto.put("score", this.getScore());
        return dto;
    }

    public Enum<GameState> getGameState(){
        Enum<GameState> gameStateEnum = GameState.UNDEFINED;
        Optional<GamePlayer> opponentGamePlayer = this.getGame().getGamePlayers().stream().filter(gp -> gp.getId() != this.getId()).findFirst();
        if (!opponentGamePlayer.isPresent()) {
            gameStateEnum = GameState.WAIT_OPPONENT_JOIN;
        } else{
            if (this.getTransformers().isEmpty())
                gameStateEnum = GameState.PLACE_TRANSFORMERS;
            else if (opponentGamePlayer.get().getTransformers().isEmpty())
                gameStateEnum = GameState.WAIT_OPPONENT_TRANSFORMERS;
            else{
                int myTurn = this.getSalvoes().stream().mapToInt(Salvo::getTurn).max().orElse(0);
                int opponentTurn = opponentGamePlayer.get().getSalvoes().stream().mapToInt(Salvo::getTurn).max().orElse(0);
                if (this.getId() < opponentGamePlayer.get().getId() && myTurn == opponentTurn)
                    gameStateEnum = GameState.ENTER_SALVOES;
                else if (this.getId() < opponentGamePlayer.get().getId() && myTurn > opponentTurn)
                    gameStateEnum =  GameState.WAIT_OPPONENT_SALVOES;
                else if (this.getId() > opponentGamePlayer.get().getId() && myTurn < opponentTurn)
                    gameStateEnum = GameState.ENTER_SALVOES;
                else if (this.getId() > opponentGamePlayer.get().getId() && myTurn == opponentTurn)
                    gameStateEnum =  GameState.WAIT_OPPONENT_SALVOES;
                List<Map<String, Object>> mySinks = this.getSinks(myTurn, opponentGamePlayer.get().getTransformers(), this.getSalvoes());
                List<Map<String, Object>> opponentSinks = this.getSinks(opponentTurn, this.getTransformers(), opponentGamePlayer.get().getSalvoes());
                if (myTurn == opponentTurn && mySinks.size() == 5 && mySinks.size() > opponentSinks.size())
                    gameStateEnum = GameState.WIN;
                else if (myTurn == opponentTurn && opponentSinks.size() == 5 && opponentSinks.size() > mySinks.size())
                    gameStateEnum = GameState.LOSE;
                else if (myTurn == opponentTurn && mySinks.size() == 5 && opponentSinks.size() == 5)
                    gameStateEnum = GameState.DRAW;
            }
        }

        return gameStateEnum;
    }

    private List<Map<String, Object>> getSinks (int turn, Set<Transformer> transformers, Set<Salvo> salvoes){
        List<String> allShots = new ArrayList<>();
        salvoes.stream()
                .filter(salvo -> salvo.getTurn() <= turn)
                .forEach(salvo -> allShots.addAll(salvo.getShots()));

        return transformers.stream()
                .filter(trf -> allShots.containsAll(trf.getCells()))
                .map(Transformer::transformersDTO)
                .collect(Collectors.toList());
    }

    public int shotsToMake() {
        Optional <GamePlayer> opponentGamePlayer = this.getGame().getGamePlayers().stream().filter(gamePlayer1 -> gamePlayer1.getId() != this.getId()).findFirst();
        return opponentGamePlayer.map(gamePlayer -> 5 - this.getSinks(currentTurn()-1,this.getTransformers(), gamePlayer.getSalvoes() ).size()).orElse(5);
    }
    public int currentTurn() {
        return this.getSalvoes().stream().mapToInt(Salvo::getTurn).max().orElse(0)+1;
    }

}
