package com.event.tickets.mapper;


import com.event.tickets.domain.dtos.TicketValidationRequestDto;
import com.event.tickets.domain.entities.TicketValidation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TicketValidationMapper {

  @Mapping(target = "ticketId", source = "ticket.id")
  TicketValidationRequestDto toTicketValidationResponseDto(TicketValidation ticketValidation);

}
