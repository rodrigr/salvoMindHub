package com.mindhubweb.salvo;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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


    @GetMapping("/game_view/{gamePlayerId}")
    public ResponseEntity<Map<String, Object>> getGamePlayers(@PathVariable Long gamePlayerId, Authentication authentication){
        if(!authentication.getName().equals(gamePlayerRepository.findById(gamePlayerId).get().getPlayer().getUserName())){
            return new ResponseEntity<>(makeMap(ErrorMessages.KEY_ERROR, ErrorMessages.MSG_ERROR_FORBIDDEN), HttpStatus.FORBIDDEN);
        }
        return new ResponseEntity<>(gamePlayerRepository
                .findById(gamePlayerId)
                .get()
                .gamePlayerDTO(), HttpStatus.OK);
    }

    @PostMapping("/players")
    public ResponseEntity<Map<String, Object>> createPlayer(@RequestParam String username, @RequestParam Side side, @RequestParam String password) {
        if (username.isEmpty() || password.isEmpty() || (side != Side.AUTOBOTS && side != Side.DECEPTICONS)) {
            return new ResponseEntity<>(makeMap(ErrorMessages.KEY_ERROR, ErrorMessages.MSG_ERROR_BAD_REQUEST), HttpStatus.BAD_REQUEST);
        }
        Player player = playerRepository.findByUserName(username);
        if (player != null) {
            return new ResponseEntity<>(makeMap(ErrorMessages.KEY_ERROR, ErrorMessages.MSG_ERROR_CONFLICT), HttpStatus.CONFLICT);
        }
        Player newPlayer = playerRepository.save(new Player(username, side, password));
        return new ResponseEntity<>(makeMap("username", newPlayer.getUserName()), HttpStatus.CREATED);
    }

    private Map<String, Object> makeMap(String key, Object value) {
        Map<String, Object> map = new HashMap<>();
        map.put(key, value);
        return map;
    }

}