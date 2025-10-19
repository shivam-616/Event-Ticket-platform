package com.event.tickets.services;


import com.event.tickets.domain.entities.QrCode;
import com.event.tickets.domain.entities.Ticket;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public interface QrCodeService {
    QrCode generateQrCodeForTicket(Ticket ticket);
    byte[] getQrCodeImageForUserAndTicket(UUID userId, UUID ticketId);
}
