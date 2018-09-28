package com.mindhubweb.salvo.configs;

import com.mindhubweb.salvo.model.Player;
import com.mindhubweb.salvo.repositories.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.GlobalAuthenticationConfigurerAdapter;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
class WebSecurityConfiguration extends GlobalAuthenticationConfigurerAdapter {

    @Autowired
    PlayerRepository playerRepository;

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Override
    public void init(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(email-> {
            Player player = playerRepository.findByUserName(email);
            if (player != null) {
                if (player.getUserName().equals("j.bauer@ctu.gov")) {
                    return new User(player.getUserName(), passwordEncoder().encode(player.getPassword()),
                            AuthorityUtils.createAuthorityList("ADMIN"));
                }else {
                    return new User(player.getUserName(), passwordEncoder().encode(player.getPassword()),
                            AuthorityUtils.createAuthorityList("USER"));
                }
            } else {
                throw new UsernameNotFoundException("Unknown user: " + email);
            }
        }).passwordEncoder(passwordEncoder());
    }
}
