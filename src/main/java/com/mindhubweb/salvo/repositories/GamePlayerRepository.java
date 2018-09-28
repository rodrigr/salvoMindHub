package com.mindhubweb.salvo.repositories;

import com.mindhubweb.salvo.model.GamePlayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;


@RepositoryRestResource
public interface GamePlayerRepository extends JpaRepository<GamePlayer, Long> {
}