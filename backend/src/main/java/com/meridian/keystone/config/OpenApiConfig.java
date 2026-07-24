package com.meridian.keystone.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI keystoneOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("KEYSTONE — Field Service Management API")
                        .description("REST API for Project KEYSTONE by Meridian Facilities Management")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Zidio Development")
                                .url("https://zidio.in")))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .name("bearerAuth")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}
