package com.mindhubweb.salvo.repositories;

import com.mindhubweb.salvo.model.Transformer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource
public interface TransformerRepository extends JpaRepository<Transformer, Long> {

}