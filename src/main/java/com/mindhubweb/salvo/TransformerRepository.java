package com.mindhubweb.salvo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource
public interface TransformerRepository extends JpaRepository<Transformer, Long> {

}