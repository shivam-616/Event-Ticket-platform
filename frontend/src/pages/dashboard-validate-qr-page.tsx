import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react"; // Import useEffect
import { Scanner } from "@yudiel/react-qr-scanner";
import {
    TicketValidationMethod,
    TicketValidationStatus,
} from "@/domain/domain";
import { AlertCircle, Check, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { validateTicket } from "@/lib/api";
import { useAuth } from "react-oidc-context";

const DashboardValidateQrPage: React.FC = () => {
    const { isLoading, user } = useAuth();
    const [isManual, setIsManual] = useState(false);
    const [scannedData, setScannedData] = useState<string | undefined>(); // Renamed for clarity
    const [manualInputData, setManualInputData] = useState<string>(""); // Separate state for manual input
    const [error, setError] = useState<string | undefined>();
    const [validationStatus, setValidationStatus] = useState<
        TicketValidationStatus | undefined
    >();
    const [showResultOverlay, setShowResultOverlay] = useState(false); // State for overlay visibility
    const [isScanningActive, setIsScanningActive] = useState(true); // Control scanner activity


    const handleReset = () => {
        setIsManual(false);
        setScannedData(undefined);
        setManualInputData("");
        setError(undefined);
        setValidationStatus(undefined);
        setShowResultOverlay(false);
        setIsScanningActive(true); // Re-enable scanning
        console.log("State reset");
    };

    const handleError = (err: unknown) => {
        setShowResultOverlay(false); // Hide overlay on error
        setIsScanningActive(false); // Stop scanning on error until reset
        if (err instanceof Error) {
            setError(err.message);
            console.error("Validation Error:", err.message);
        } else if (typeof err === "string") {
            setError(err);
            console.error("Validation Error:", err);
        } else {
            setError("An unknown error occurred during validation.");
            console.error("Unknown Validation Error:", err);
        }
    };
    const handleValidate = async (ticketIdValue: string, method: TicketValidationMethod) => {
        // Clear previous results before validating
        setError(undefined);
        setValidationStatus(undefined);
        setShowResultOverlay(false);
        setIsScanningActive(false); // Pause scanning during validation

        if (!ticketIdValue || ticketIdValue.trim() === "") {
            setError("Ticket ID/QR Code value cannot be empty.");
            setIsScanningActive(true); // Allow scanning/input again if ID was empty
            return;
        }

        if (!user?.access_token) {
            setError("User not authenticated.");
            setIsScanningActive(true); // Allow scanning/input again
            return;
        }

        console.log(`Attempting validation for ID: ${ticketIdValue}, Method: ${method}`);

        try {
            // --- API Call ---
            const response = await validateTicket(user.access_token, {
                ticketId: ticketIdValue,
                method,
            });
            // --- End API Call ---

            console.log("API Response Status:", response.status);
            setValidationStatus(response.status); // Set status (VALID or INVALID)
            setShowResultOverlay(true); // Trigger overlay display (Green or Red)

            // Keep scanner paused until reset

        } catch (err) {
            // --- Error Handling ---
            let errorMessage = "An unknown error occurred during validation.";
            let showAsInvalidOverlay = false; // Default to NOT showing overlay on error

            if (err instanceof Error) {
                errorMessage = err.message;
                console.error("Validation Error:", err.message);
                // SPECIFIC CHECK: If error is "QR code not found" (meaning used/inactive or truly missing)
                if (err.message.toLowerCase().includes("qr code not found") || err.message.toLowerCase().includes("active qr code")) {
                    setValidationStatus(TicketValidationStatus.INVALID); // Treat as invalid for UI
                    showAsInvalidOverlay = true; // Show the red cross overlay
                    setError(undefined); // Clear the error message box, rely on overlay
                }
            } else if (typeof err === "string") {
                errorMessage = err;
                console.error("Validation Error:", err);
                if (err.toLowerCase().includes("qr code not found") || err.toLowerCase().includes("active qr code")) {
                    setValidationStatus(TicketValidationStatus.INVALID);
                    showAsInvalidOverlay = true;
                    setError(undefined);
                }
            } else {
                console.error("Unknown Validation Error:", err);
            }

            // Show error message ONLY if we didn't decide to show the invalid overlay
            if (!showAsInvalidOverlay) {
                setError(errorMessage);
            }
            setShowResultOverlay(showAsInvalidOverlay); // Show red cross ONLY if determined above
            setIsScanningActive(false); // Keep scanner paused
            // --- End Error Handling ---
        }
    };

        // Effect to log state changes for debugging
        useEffect(() => {
            console.log("State Updated - validationStatus:", validationStatus, "showResultOverlay:", showResultOverlay);
        }, [validationStatus, showResultOverlay]);


    return (
        <div className="min-h-screen bg-black text-white flex justify-center items-center">
            <div className="border border-gray-400 max-w-sm w-full p-4">
                {isLoading && <p>Authenticating...</p>}

                {error && (
                    <Alert variant="destructive" className="bg-gray-900 border-red-700 mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* --- Scanner Section --- */}
                {!isManual && (
                    <div className="space-y-4">
                        <div className="rounded-lg overflow-hidden mx-auto mb-4 relative h-64 w-64 border border-gray-600">
                            {isScanningActive ? (
                                <Scanner
                                    onScan={(result) => {
                                        // Only process scan if scanning is active
                                        if (isScanningActive && result && result[0]) {
                                            const qrCodeId = result[0].rawValue;
                                            setScannedData(qrCodeId); // Update display data
                                            handleValidate(qrCodeId, TicketValidationMethod.QR_SCAN);
                                        }
                                    }}
                                    onError={handleError}
                                    styles={{ container: { width: '100%', height: '100%' } }}
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400">
                                    {/* Placeholder when scanner is paused */}
                                    {validationStatus ? 'Scan result shown below' : 'Scanner paused...'}
                                </div>
                            )}

                            {/* Result Overlay */}
                            {showResultOverlay && validationStatus && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                    {validationStatus === TicketValidationStatus.VALID ? (
                                        <div className="bg-green-500 rounded-full p-4 animate-in fade-in zoom-in">
                                            <Check className="w-20 h-20 text-white" />
                                        </div>
                                    ) : (
                                        <div className="bg-red-500 rounded-full p-4 animate-in fade-in zoom-in">
                                            <X className="w-20 h-20 text-white" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="border-white border h-12 rounded-md font-mono flex justify-center items-center text-sm px-2 break-all">
                            <span>{scannedData || "Scan QR Code Above"}</span>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full h-[50px] text-gray-300 border-gray-600 hover:bg-gray-700"
                            onClick={() => { setIsManual(true); handleReset(); }} // Reset when switching modes
                        >
                            Enter ID Manually
                        </Button>
                    </div>
                )}

                {/* --- Manual Entry Section --- */}
                {isManual && (
                    <div className="pb-8 space-y-4">
                        <p className="text-sm text-gray-400">Enter Ticket ID or QR Code value:</p>
                        <Input
                            value={manualInputData} // Use separate state for manual input
                            placeholder="Enter ID here..."
                            className="w-full text-white bg-gray-800 border-gray-600 text-lg"
                            onChange={(e) => setManualInputData(e.target.value)} // Update manual input state
                        />
                        <Button
                            className="bg-purple-600 w-full h-[60px] hover:bg-purple-700 text-lg"
                            onClick={() =>
                                handleValidate(manualInputData || "", TicketValidationMethod.MANUAL)
                            }
                            disabled={!manualInputData || manualInputData.trim() === ""}
                        >
                            Submit ID
                        </Button>
                        {/* Show text result for manual entry */}
                        {showResultOverlay && validationStatus && (
                            <p className={`text-center text-xl font-bold ${validationStatus === TicketValidationStatus.VALID ? 'text-green-500' : 'text-red-500'}`}>
                                Status: {validationStatus}
                            </p>
                        )}
                        <Button
                            variant="outline"
                            className="w-full h-[50px] text-gray-300 border-gray-600 hover:bg-gray-700"
                            onClick={() => { setIsManual(false); handleReset(); }} // Reset when switching modes
                        >
                            Switch to Scanner
                        </Button>
                    </div>
                )}

                {/* --- Reset Button --- */}
                {/* Always show Reset button to allow user to clear state */}
                <Button
                    variant="secondary"
                    className="bg-gray-600 hover:bg-gray-700 w-full h-[50px] text-lg mt-8"
                    onClick={handleReset}
                >
                    Reset
                </Button>
            </div>
        </div>
    );
};

export default DashboardValidateQrPage;