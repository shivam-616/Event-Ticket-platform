package com.event.tickets.services.iml;

import com.event.tickets.domain.entities.QrCode;
import com.event.tickets.domain.entities.Ticket;
import com.event.tickets.domain.entities.TicketValidation;
import com.event.tickets.domain.enums.QrCodeStatusEnum;
import com.event.tickets.domain.enums.TicketValidationMethod;
import com.event.tickets.domain.enums.TicketValidationStatusEnum;
import com.event.tickets.exeception.QrCodeNotFoundException;
import com.event.tickets.exeception.TicketNotFoundException;
import com.event.tickets.repositories.QrCodeRepository;
import com.event.tickets.repositories.TicketRepository;
import com.event.tickets.repositories.TicketValidationRepository;
import com.event.tickets.services.TicketValidationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Import Slf4j
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j // Add Slf4j logging
public class TicketValidationServiceImpl implements TicketValidationService {

    private final QrCodeRepository qrCodeRepository;
    private final TicketValidationRepository ticketValidationRepository;
    private final TicketRepository ticketRepository;

    @Override
    public TicketValidation validateTicketByQrCode(UUID qrCodeId) {
        log.debug("Attempting validation for QR Code ID: {}", qrCodeId); // Added log

        // Find the QR code ONLY if it's ACTIVE
        QrCode qrCode = qrCodeRepository.findByIdAndStatus(qrCodeId, QrCodeStatusEnum.ACTIVE)
                .orElseThrow(() -> {
                    // Check if the QR code exists but isn't active
                    if (qrCodeRepository.existsById(qrCodeId)) {
                        log.warn("Validation failed: QR Code ID {} found but is not ACTIVE.", qrCodeId);
                        // You could throw a different specific exception here if needed
                    } else {
                        log.warn("Validation failed: QR Code ID {} not found.", qrCodeId);
                    }
                    // Throwing the original exception maintains current behavior for frontend
                    return new QrCodeNotFoundException(
                            String.format("Active QR Code with ID %s was not found", qrCodeId)
                    );
                });

        log.debug("Found ACTIVE QR Code ID: {}, linked to Ticket ID: {}", qrCode.getId(), qrCode.getTicket().getId()); // Added log
        Ticket ticket = qrCode.getTicket();

        // Perform the validation check
        TicketValidation ticketValidation = validateTicket(ticket, TicketValidationMethod.QR_SCAN);

        // --- ENHANCEMENT: Update QR Code Status if Valid ---
        if (TicketValidationStatusEnum.VALID.equals(ticketValidation.getStatus())) {
            log.info("Ticket ID {} validated successfully via QR Code {}. Setting QR status to EXPIRED.", ticket.getId(), qrCodeId); // Added log
            qrCode.setStatus(QrCodeStatusEnum.EXPIRED); // Change status
            qrCodeRepository.save(qrCode); // Save the updated QR code
        } else {
            log.warn("Ticket ID {} validation result: {} via QR Code {}.", ticket.getId(), ticketValidation.getStatus(), qrCodeId); // Added log
        }
        // --- END ENHANCEMENT ---

        return ticketValidation;
    }

    // No changes needed in validateTicketManually for this specific issue,
    // but ensure frontend is sending correct ticketId (not qrCodeId) for manual.
    @Override
    public TicketValidation validateTicketManually(UUID ticketId) {
        log.debug("Attempting manual validation for Ticket ID: {}", ticketId); // Added log
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> {
                    log.warn("Manual validation failed: Ticket ID {} not found.", ticketId);
                    return new TicketNotFoundException(String.format("Ticket ID %s not found", ticketId));
                });
        return validateTicket(ticket, TicketValidationMethod.MANUAL);
    }

    // Private helper method to check previous validations
    private TicketValidation validateTicket(Ticket ticket,
                                            TicketValidationMethod ticketValidationMethod) {

        // Check if there's *already* been a successful validation for this ticket
        boolean alreadyValidated = ticket.getValidations().stream()
                .anyMatch(v -> TicketValidationStatusEnum.VALID.equals(v.getStatus()));

        TicketValidation newValidation = new TicketValidation();
        newValidation.setTicket(ticket);
        newValidation.setValidationMethod(ticketValidationMethod);

        // If it was already validated successfully before, this attempt is INVALID. Otherwise, it's VALID.
        if (alreadyValidated) {
            log.warn("Ticket ID {} has already been validated previously. Marking current attempt as INVALID.", ticket.getId()); // Added log
            newValidation.setStatus(TicketValidationStatusEnum.INVALID);
        } else {
            log.info("Ticket ID {} has no previous valid validations. Marking current attempt as VALID.", ticket.getId()); // Added log
            newValidation.setStatus(TicketValidationStatusEnum.VALID);
        }

        return ticketValidationRepository.save(newValidation);
    }

}