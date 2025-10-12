package com.event.tickets.mapper;

import com.event.tickets.domain.CreateEventRequest;
import com.event.tickets.domain.CreateTicketTypeRequest;
import com.event.tickets.domain.dtos.CreateEventRequestDto;
import com.event.tickets.domain.dtos.CreateEventResponseDto;
import com.event.tickets.domain.entities.Event;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)

public interface EventMapper {
  CreateEventRequest fromDto(CreateEventRequestDto dto);
  CreateEventResponseDto toDto(Event request);
  CreateTicketTypeRequest fromDto(CreateTicketTypeRequest dto);
}
