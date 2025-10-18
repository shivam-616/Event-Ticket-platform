package com.event.tickets.repositories;

import com.event.tickets.domain.entities.Event;
import com.event.tickets.domain.enums.EventStatusEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {

    Page<Event> findByOrganizerId(UUID organizerId, Pageable pageable);

    Optional<Event> findByIdAndOrganizerId(UUID organizerId, UUID Id);

    Page<Event> findByStatus(EventStatusEnum status, Pageable pageable);


    @Query(value = "SELECT * FROM events WHERE " +
            "status = 'PUBLISHED' AND " +
            "MATCH(name, venue) AGAINST (:searchTerm IN NATURAL LANGUAGE MODE)", // MySQL Full-Text Search
            countQuery = "SELECT count(*) FROM events WHERE " +
                    "status = 'PUBLISHED' AND " +
                    "MATCH(name, venue) AGAINST (:searchTerm IN NATURAL LANGUAGE MODE)", // Count for MySQL
            nativeQuery = true)
    Page<Event> searchEvents(@Param("searchTerm") String searchTerm, Pageable pageable);
    Optional<Event> findByIdAndStatus(UUID id, EventStatusEnum status);
}
