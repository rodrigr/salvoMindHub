package com.mindhubweb.salvo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@SpringBootApplication
public class SalvoApplication {

	public static void main(String[] args) {
		SpringApplication.run(SalvoApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(PlayerRepository playerRepository, GameRepository gameRepository, GamePlayerRepository gamePlayerRepository, TransformerRepository transformerRepository, ScoreRepository scoreRepository) {
		return args -> {
			// save a couple of players
			Player player1 = new Player("j.bauer@ctu.gov", Side.AUTOBOTS, "24");
			Player player2 = new Player("c.obrian@ctu.gov", Side.DECEPTICONS, "42");
			Player player3 = new Player("kim_bauer@gmail.com", Side.AUTOBOTS, "kb");
			Player player4 = new Player("t.almeida@ctu.gov", Side.DECEPTICONS, "mole");
			playerRepository.save(player1);
			playerRepository.save(player2);
			playerRepository.save(player3);
			playerRepository.save(player4);
			// save a couple of games
			Game game1 = new Game(LocalDateTime.now());
			Game game2 = new Game(LocalDateTime.now().plusHours(1));
			Game game3 = new Game(LocalDateTime.now().plusHours(2));
			Game game4 = new Game(LocalDateTime.now().plusHours(3));
			Game game5 = new Game(LocalDateTime.now().plusHours(4));
			Game game6 = new Game(LocalDateTime.now().plusHours(5));
			Game game7 = new Game(LocalDateTime.now().plusHours(6));
			Game game8 = new Game(LocalDateTime.now().plusHours(7));
			gameRepository.save(game1);
			gameRepository.save(game2);
			gameRepository.save(game3);
			gameRepository.save(game4);
			gameRepository.save(game5);
			gameRepository.save(game6);
			gameRepository.save(game7);
			gameRepository.save(game8);
			//save transformers
			Set<Transformer> autobots = new HashSet<>();
			autobots.add(new Transformer("optimusPrime", new ArrayList<>(Arrays.asList("H1","H2","H3","H4","H5"))));
			autobots.add(new Transformer("bumblebee", new ArrayList<>(Arrays.asList("D1","E1","F1","G1"))));
			autobots.add(new Transformer("jazz", new ArrayList<>(Arrays.asList("B3","B4","B5"))));
			autobots.add(new Transformer("ironhide", new ArrayList<>((Arrays.asList("C2","C3","C4")))));
			autobots.add(new Transformer("ratchet", new ArrayList<>(Arrays.asList("A1","B1"))));

			Set<Transformer> autobots2 = new HashSet<>();
			autobots2.add(new Transformer("ironhide", new ArrayList<>(Arrays.asList("B5","C5","D5"))));
			autobots2.add(new Transformer("ratchet", new ArrayList<>(Arrays.asList("F1","F2"))));
			autobots2.add(new Transformer("jazz", new ArrayList<>(Arrays.asList("G5","G6","G7"))));
			autobots2.add(new Transformer("bumblebee", new ArrayList<>(Arrays.asList("G9","H9","I9","J9"))));
			autobots2.add(new Transformer("optimusPrime", new ArrayList<>(Arrays.asList("J2","J3","J4","J5","J6"))));

			Set<Transformer> autobots3 = new HashSet<>();
			autobots3.add(new Transformer("ironhide", new ArrayList<>(Arrays.asList("B5","C5","D5"))));
			autobots3.add(new Transformer("ratchet", new ArrayList<>(Arrays.asList("C6","C7"))));

			Set<Transformer> autobots4 = new HashSet<>();
			autobots4.add(new Transformer("starscream", new ArrayList<>(Arrays.asList("G6","H6"))));
			autobots4.add(new Transformer("megatron", new ArrayList<>(Arrays.asList("A2","A3","A4"))));

			Set<Transformer> autobots5 = new HashSet<>();
			autobots5.add(new Transformer("starscream", new ArrayList<>(Arrays.asList("G6","H6"))));
			autobots5.add(new Transformer("megatron", new ArrayList<>(Arrays.asList("A2","A3","A4"))));

			Set<Transformer> autobots6 = new HashSet<>();
			autobots6.add(new Transformer("starscream", new ArrayList<>(Arrays.asList("G6","H6"))));
			autobots6.add(new Transformer("megatron", new ArrayList<>(Arrays.asList("A2","A3","A4"))));

			Set<Salvo> salvoSet = new HashSet<>();
			salvoSet.add(new Salvo(1, new ArrayList<>(Arrays.asList("B5","C5","F1"))));
			salvoSet.add(new Salvo(2, new ArrayList<>(Arrays.asList("F2","D5"))));

			Set<Salvo> salvoSet2 = new HashSet<>();
			salvoSet2.add(new Salvo(1, new ArrayList<>(Arrays.asList("B4","B5","B6"))));
			salvoSet2.add(new Salvo(2, new ArrayList<>(Arrays.asList("E1","H3","A2"))));

			Set<Salvo> salvoSet3 = new HashSet<>();
			salvoSet3.add(new Salvo(1, new ArrayList<>(Arrays.asList("A2","A4","G6"))));
			salvoSet3.add(new Salvo(2, new ArrayList<>(Arrays.asList("A3","H6"))));

			Set<Salvo> salvoSet4 = new HashSet<>();
			salvoSet4.add(new Salvo(1, new ArrayList<>(Arrays.asList("B5","D5","C7"))));
			salvoSet4.add(new Salvo(2, new ArrayList<>(Arrays.asList("C5","C6"))));

			Set<Salvo> salvoSet5 = new HashSet<>();
			salvoSet5.add(new Salvo(1, new ArrayList<>(Arrays.asList("B5","D5","C7"))));
			salvoSet5.add(new Salvo(2, new ArrayList<>(Arrays.asList("C5","C6"))));

			Set<Salvo> salvoSet6 = new HashSet<>();
			salvoSet6.add(new Salvo(1, new ArrayList<>(Arrays.asList("B5","D5","C7"))));
			salvoSet6.add(new Salvo(2, new ArrayList<>(Arrays.asList("C5","C6"))));

			// save game players
			gamePlayerRepository.save(new GamePlayer(game1,player1,LocalDateTime.now(),autobots,salvoSet));
			gamePlayerRepository.save(new GamePlayer(game1,player2,LocalDateTime.now(),autobots2,salvoSet2));
			gamePlayerRepository.save(new GamePlayer(game2,player1,LocalDateTime.now(),autobots3,salvoSet3));
			gamePlayerRepository.save(new GamePlayer(game2,player2,LocalDateTime.now(),autobots4,salvoSet4));
			gamePlayerRepository.save(new GamePlayer(game3,player2,LocalDateTime.now(),autobots5,salvoSet5));
			gamePlayerRepository.save(new GamePlayer(game3,player4,LocalDateTime.now(),autobots6,salvoSet6));
			gamePlayerRepository.save(new GamePlayer(game4,player2,LocalDateTime.now(),new HashSet<>(),new HashSet<>()));
			gamePlayerRepository.save(new GamePlayer(game4,player1,LocalDateTime.now(),new HashSet<>(),new HashSet<>()));
			gamePlayerRepository.save(new GamePlayer(game5,player4,LocalDateTime.now(),new HashSet<>(),new HashSet<>()));
			gamePlayerRepository.save(new GamePlayer(game5,player1,LocalDateTime.now(),new HashSet<>(),new HashSet<>()));
			gamePlayerRepository.save(new GamePlayer(game6,player3,LocalDateTime.now(),new HashSet<>(),new HashSet<>()));
			gamePlayerRepository.save(new GamePlayer(game7,player4,LocalDateTime.now(),new HashSet<>(),new HashSet<>()));
			gamePlayerRepository.save(new GamePlayer(game8,player3,LocalDateTime.now(),new HashSet<>(),new HashSet<>()));
			gamePlayerRepository.save(new GamePlayer(game8,player4,LocalDateTime.now(),new HashSet<>(),new HashSet<>()));

			//save scores
			scoreRepository.save(new Score(player1, game1, 1.0F, LocalDateTime.now().plusMinutes(30)));
			scoreRepository.save(new Score(player2, game1, 0.0F, LocalDateTime.now().plusMinutes(30)));
			scoreRepository.save(new Score(player1, game2, 0.5F, LocalDateTime.now().plusMinutes(30)));
			scoreRepository.save(new Score(player2, game2, 0.5F, LocalDateTime.now().plusMinutes(30)));

		};
	}
}
