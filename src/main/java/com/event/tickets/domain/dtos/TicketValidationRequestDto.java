package com.event.tickets.domain.dtos;


import com.event.tickets.domain.enums.TicketValidationMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TicketValidationRequestDto {
  private UUID ticketId;
  private TicketValidationMethod method;
}
