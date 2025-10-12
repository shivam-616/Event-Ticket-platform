package com.event.tickets.services;

import com.event.tickets.domain.CreateEventRequest;
import com.event.tickets.domain.entities.Event;

import java.util.UUID;

public interface EventService {

    Event createEvent(UUID organizerId, CreateEventRequest event);
}
