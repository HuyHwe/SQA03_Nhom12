package com.oauth2jwt.authorizationresourceserver.repository;
import com.oauth2jwt.authorizationresourceserver.model.UserCommon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserCommonRepo<T, ID> extends JpaRepository<UserCommon, ID> {
    UserCommon findByPhone(String phoneNumber);
}
