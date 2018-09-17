package com.mindhubweb.salvo;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class SalvoController {

    private GameRepository gameRepository;
    private GamePlayerRepository gamePlayerRepository;
    private PlayerRepository playerRepository;

    @Autowired
    SalvoController (GameRepository gameRepository, GamePlayerRepository gamePlayerRepository, PlayerRepository playerRepository){
        this.gameRepository = gameRepository;
        this.gamePlayerRepository = gamePlayerRepository;
        this.playerRepository = playerRepository;
    }

    @GetMapping("/games")
    public Map<String, Object> getGames(Authentication authentication){
        Map<String, Object> dto = new LinkedHashMap<>();
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken){
            dto.put("player", "guest");
        } else {
            dto.put("player", playerRepository.findByUserName(authentication.getName()).playersDTO());
        }
        dto.put("games", gameRepository.findAll().stream().map(Game::gamesDTO).collect(Collectors.toList()));
        return dto;
    }

    @PostMapping("/games")
    public ResponseEntity<Map<String, Object>> createGames (Authentication authentication){
        if (isGuest(authentication)){
            return new ResponseEntity<>(makeMap(Messages.KEY_ERROR, Messages.MSG_ERROR_FORBIDDEN), HttpStatus.FORBIDDEN);
        }
        Player player = playerRepository.findByUserName(authentication.getName());
        Game newGame = gameRepository.save(new Game(LocalDateTime.now()));

        GamePlayer newGamePlayer = gamePlayerRepository.save(new GamePlayer(newGame, player));

        return  new ResponseEntity<>(makeMap("gpid", newGamePlayer.getId()), HttpStatus.CREATED);
    }


    @GetMapping("/game_view/{gamePlayerId}")
    public ResponseEntity<Map<String, Object>> getGamePlayers(@PathVariable Long gamePlayerId, Authentication authentication){
        if(isGuest(authentication)){
            return new ResponseEntity<>(makeMap(Messages.KEY_ERROR, Messages.MSG_ERROR_FORBIDDEN), HttpStatus.FORBIDDEN);
        }
        Optional<GamePlayer> gamePlayer = gamePlayerRepository.findById(gamePlayerId);
        if(!gamePlayer.isPresent()){
            return new ResponseEntity<>(makeMap(Messages.KEY_ERROR, Messages.MSG_ERROR_GAME_DOES_NOT_EXIST), HttpStatus.BAD_REQUEST);
        }
        if(!authentication.getName().equals(gamePlayer.get().getPlayer().getUserName())){
            return new ResponseEntity<>(makeMap(Messages.KEY_ERROR, Messages.MSG_ERROR_FORBIDDEN), HttpStatus.FORBIDDEN);
        }
        return new ResponseEntity<>(gamePlayer
                .get()
                .gamePlayerDTO(), HttpStatus.OK);
    }

    @PostMapping("/players")
    public ResponseEntity<Map<String, Object>> createPlayer(@RequestParam String username, @RequestParam Side side, @RequestParam String password) {
        if (username.isEmpty() || password.isEmpty() || (side != Side.AUTOBOTS && side != Side.DECEPTICONS)) {
            return new ResponseEntity<>(makeMap(Messages.KEY_ERROR, Messages.MSG_ERROR_BAD_REQUEST), HttpStatus.BAD_REQUEST);
        }
        Player player = playerRepository.findByUserName(username);
        if (player != null) {
            return new ResponseEntity<>(makeMap(Messages.KEY_ERROR, Messages.MSG_ERROR_CONFLICT), HttpStatus.CONFLICT);
        }
        Player newPlayer = playerRepository.save(new Player(username, side, password));
        return new ResponseEntity<>(makeMap("username", newPlayer.getUserName()), HttpStatus.CREATED);
    }

    @PostMapping("/game/{gameId}/players")
    public ResponseEntity<Map<String, Object>> joinGame(@PathVariable Long gameId, Authentication authentication){
        if(isGuest(authentication)){
            return new ResponseEntity<>(makeMap(Messages.KEY_ERROR, Messages.MSG_ERROR_FORBIDDEN), HttpStatus.FORBIDDEN);
        }
        Optional<Game> game = gameRepository.findById(gameId);
        if(!game.isPresent()){
            return new ResponseEntity<>(makeMap(Messages.KEY_ERROR, Messages.MSG_ERROR_GAME_DOES_NOT_EXIST), HttpStatus.FORBIDDEN);
        }
        if(game.get().getGamePlayers().size() > 1){
            return new ResponseEntity<>(makeMap(Messages.KEY_ERROR, Messages.MSG_ERROR_GAME_FULL), HttpStatus.FORBIDDEN);
        }

        Player player = playerRepository.findByUserName(authentication.getName());
        GamePlayer newGamePlayer = gamePlayerRepository.save(new GamePlayer(game.get(), player));

        return new ResponseEntity<>(makeMap("gpid", newGamePlayer.getId()), HttpStatus.CREATED);
    }

    @PostMapping("games/players/{gamePlayerId}/transformers")
    public ResponseEntity<Map<String, Object>> addTransformers(@PathVariable Long gamePlayerId, Authentication authentication, @RequestBody Set<Transformer> transformerSet){
        if(isGuest(authentication)){
            return new ResponseEntity<>(makeMap(Messages.KEY_ERROR, Messages.MSG_ERROR_FORBIDDEN), HttpStatus.FORBIDDEN);
        }
        Optional<GamePlayer> gamePlayer = gamePlayerRepository.findById(gamePlayerId);
        if(!gamePlayer.isPresent()){
            return new ResponseEntity<>(makeMap(Messages.KEY_ERROR, Messages.MSG_ERROR_GAME_DOES_NOT_EXIST), HttpStatus.BAD_REQUEST);
        }
        if(!gamePlayer.get().getPlayer().getUserName().equals(authentication.getName())){
            return new ResponseEntity<>(makeMap(Messages.KEY_ERROR, Messages.MSG_ERROR_FORBIDDEN), HttpStatus.FORBIDDEN);
        }
        if(gamePlayer.get().getTransformers().size() > 0 || transformerSet.size() != 5){
            return new ResponseEntity<>(makeMap(Messages.KEY_ERROR, Messages.MSG_ERROR_PLACED_TRFS), HttpStatus.FORBIDDEN);
        }
        gamePlayer.get().addTransformers(transformerSet);
        gamePlayerRepository.save(gamePlayer.get());
        return  new ResponseEntity<>(makeMap(Messages.KEY_CREATED, Messages.MSG_CREATED), HttpStatus.CREATED);
    }

    @PostMapping("games/players/{gamePlayerId}/salvoes")
    public ResponseEntity<Map<String, Object>> addSalvoes(@PathVariable Long gamePlayerId, Authentication authentication, @RequestBody Salvo salvo){
        if(isGuest(authentication)){
            return new ResponseEntity<>(makeMap(Messages.KEY_ERROR, Messages.MSG_ERROR_FORBIDDEN), HttpStatus.FORBIDDEN);
        }
        Optional<GamePlayer> gamePlayer = gamePlayerRepository.findById(gamePlayerId);
        if(!gamePlayer.isPresent()){
            return new ResponseEntity<>(makeMap(Messages.KEY_ERROR, Messages.MSG_ERROR_GAME_DOES_NOT_EXIST), HttpStatus.BAD_REQUEST);
        }
        if(!gamePlayer.get().getPlayer().getUserName().equals(authentication.getName())){
            return new ResponseEntity<>(makeMap(Messages.KEY_ERROR, Messages.MSG_ERROR_FORBIDDEN), HttpStatus.FORBIDDEN);
        }

        if(gamePlayer.get().getSalvoes().stream().anyMatch(item -> item.getTurn() == salvo.getTurn()) ){
            return new ResponseEntity<>(makeMap(Messages.KEY_ERROR, Messages.MSG_ERROR_FORBIDDEN), HttpStatus.FORBIDDEN);
        }

        Optional<GamePlayer> opponentGamePlayer = gamePlayer.get().getGame().getGamePlayers().stream().filter(gp -> gp.getId() != gamePlayerId).findFirst();

        if(!opponentGamePlayer.isPresent() || salvo.getTurn() -1 > opponentGamePlayer.get().getSalvoes().size()){
            return  new ResponseEntity<>(makeMap(Messages.KEY_ERROR, Messages.MSG_ERROR_FORBIDDEN), HttpStatus.FORBIDDEN);
        }

        Set<Salvo> salvoSet = new HashSet<>();
        salvoSet.add(salvo);
        gamePlayer.get().addSalvoes(salvoSet);
        gamePlayerRepository.save(gamePlayer.get());
        return  new ResponseEntity<>(makeMap(Messages.KEY_CREATED, Messages.MSG_CREATED), HttpStatus.CREATED);
    }

    private Map<String, Object> makeMap(String key, Object value) {
        Map<String, Object> map = new HashMap<>();
        map.put(key, value);
        return map;
    }

    private boolean isGuest(Authentication authentication) {
        return authentication == null || authentication instanceof AnonymousAuthenticationToken;
    }

}