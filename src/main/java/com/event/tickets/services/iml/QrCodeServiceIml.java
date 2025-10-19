package com.event.tickets.services.iml;

import com.event.tickets.domain.entities.QrCode;
import com.event.tickets.domain.entities.Ticket;
import com.event.tickets.domain.enums.QrCodeStatusEnum;
import com.event.tickets.exeception.QrCodeGenerationException;
import com.event.tickets.exeception.QrCodeNotFoundException;
import com.event.tickets.repositories.QrCodeRepository;
import com.event.tickets.services.QrCodeService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class QrCodeServiceIml implements QrCodeService {

    private static final int QR_HEIGHT = 300;
    private static final int QR_WIDTH = 300;


    private final QrCodeRepository qrCodeRepository;
    private final QRCodeWriter qrCodeWriter;

    @Override
    public QrCode generateQrCodeForTicket(Ticket ticket)    {
        try {
            UUID uniqueId = UUID.randomUUID();
            String qrCodeImage = generateQrCodeImage(uniqueId);

            QrCode qrCode = new QrCode();
            qrCode.setId(uniqueId);
            qrCode.setValue(qrCodeImage);
            qrCode.setTicket(ticket);
            qrCode.setStatus(QrCodeStatusEnum.ACTIVE);

            return qrCodeRepository.saveAndFlush(qrCode);
        } catch (IOException | WriterException ex) {
            throw new QrCodeGenerationException("Failed to generate QR Code", ex);
        }

    }
    @Override
    public byte[] getQrCodeImageForUserAndTicket(UUID userId, UUID ticketId)
            throws QrCodeNotFoundException {
        QrCode qrCode = qrCodeRepository.findByTicketIdAndTicketPurchaserId(ticketId, userId)
                .orElseThrow(QrCodeNotFoundException::new);

        try {
            return Base64.getDecoder().decode(qrCode.getValue());
        } catch(IllegalArgumentException ex) {
            log.error("Invalid base64 QR Code for ticket ID: {}", ticketId, ex);
            throw new QrCodeNotFoundException();
        }
    }

    private String generateQrCodeImage(UUID uniqueId) throws WriterException, IOException {
        BitMatrix bitMatrix = qrCodeWriter.encode(uniqueId.toString(), BarcodeFormat.QR_CODE, QR_WIDTH, QR_HEIGHT);

        BufferedImage qrCodeImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ImageIO.write(qrCodeImage, "PNG", baos);
            byte[] imageBytes = baos.toByteArray();

            return Base64.getEncoder().encodeToString(imageBytes);
        }
    }
}
