package com.event.tickets.services;


import com.event.tickets.domain.entities.Ticket;

import java.util.UUID;

public interface TicketTypeService {
  Ticket purchaseTicket(UUID userId, UUID ticketTypeId);
}
