package com.example.backend.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Entity
@Table(name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@ToString(onlyExplicitlyIncluded = true)
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @ToString.Include
    private UUID id;

    @Column(unique = true, nullable = false)
    @ToString.Include
    private String phone;

    private String password;

    @ToString.Include
    private String name;

    private Integer currentRoleId;

    // ✅ Роли пользователя
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "users_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "roles_id")
    )
    @ToString.Exclude
    private List<Role> roles = new ArrayList<>();





    // ✅ Конструктор для создания пользователя вручную (AdminController)
    public User(String phone, String password, String name, List<Role> roles) {
        this.phone = phone;
        this.password = password;
        this.name = name;
        this.roles = roles != null ? new ArrayList<>(roles) : new ArrayList<>();
    }

    // 🔐 Методы UserDetails для Spring Security
    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles;
    }

    @Override
    @JsonIgnore
    public String getUsername() {
        return phone;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isEnabled() {
        return true;
    }
}
