package com.event.tickets.domain.dtos;


import com.event.tickets.domain.enums.TicketStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ListTicketResponseDto {
  private UUID id;
  private TicketStatusEnum status;
  private ListTicketTicketTypeResponseDto ticketType;
}
