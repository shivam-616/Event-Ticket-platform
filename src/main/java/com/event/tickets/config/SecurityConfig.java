package com.event.tickets.config;

import com.event.tickets.filters.UserProvisioningFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            UserProvisioningFilter userProvisioningFilter,
            JwtAuthenticationConverter jwtAuthenticationConverter
          ) throws Exception {
        http
                .authorizeHttpRequests(authorize ->
                        authorize
                                .requestMatchers("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/published-events/**").permitAll()
                                .requestMatchers("/api/v1/events/**").hasRole("ORGANISER")
//                                .requestMatchers("/api/v1/tickets").hasRole("ORGANISER")
//                                .requestMatchers("/api/v1/events/ticket-types").hasRole("ORGANISER")
                                .requestMatchers( "/api/v1/ticket-validations/**").hasRole("STAFF")
                                .anyRequest().authenticated())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)
                        ))
                .addFilterAfter(userProvisioningFilter, BearerTokenAuthenticationFilter.class);

        return http.build();
    }

//    @Bean
//    public JwtAuthenticationConverter jwtAuthenticationConverter() {
//        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
//        jwtConverter.setJwtGrantedAuthoritiesConverter(new KeycloakRealmRoleConverter());
//        return jwtConverter;
//    }
//
//    static class KeycloakRealmRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
//        @Override
//        public Collection<GrantedAuthority> convert(Jwt jwt) {
//            final Map<String, Object> realmAccess = (Map<String, Object>) jwt.getClaims().get("realm_access");
//            if (realmAccess == null || realmAccess.isEmpty()) {
//                return List.of();
//            }
//            return ((List<String>) realmAccess.get("roles")).stream()
//                    .map(roleName -> "ROLE_" + roleName)
//                    .map(SimpleGrantedAuthority::new)
//                    .collect(Collectors.toList());
//        }
//    }
}