import { useAuth } from "react-oidc-context";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router"; // Assuming react-router-dom is used, typically import from 'react-router-dom'
import { Input } from "@/components/ui/input";
import { AlertCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { PublishedEventSummary, SpringBootPagination } from "@/domain/domain";
import { listPublishedEvents, searchPublishedEvents } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PublishedEventCard from "@/components/published-event-card";
import { SimplePagination } from "@/components/simple-pagination";
import React from "react"; // Import React

const AttendeeLandingPage: React.FC = () => {
    const { isAuthenticated, isLoading, signinRedirect, signoutRedirect } =
        useAuth();

    const navigate = useNavigate();

    const [page, setPage] = useState(0);
    const [publishedEvents, setPublishedEvents] = useState<
        SpringBootPagination<PublishedEventSummary> | undefined
    >();
    const [error, setError] = useState<string | undefined>();
    const [query, setQuery] = useState<string | undefined>();

    // Function to fetch all published events for the current page
    const refreshPublishedEvents = async () => {
        try {
            setError(undefined); // Clear previous errors
            setPublishedEvents(await listPublishedEvents(page));
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else if (typeof err === "string") {
                setError(err);
            } else {
                setError("An unknown error occurred loading events.");
            }
        }
    };

    // Function to search for events based on the query
    const queryPublishedEvents = async () => {
        // FIX: Check if query is valid before searching
        if (!query || query.trim().length === 0) {
            // If query is empty, just refresh the list with all events for the current page
            await refreshPublishedEvents();
            return; // Stop execution
        }

        // --- If query is valid, proceed with the search ---
        try {
            setError(undefined); // Clear previous errors
            // Now 'query' is guaranteed to be a non-empty string here
            setPublishedEvents(await searchPublishedEvents(query, page)); //
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else if (typeof err === "string") {
                setError(err);
            } else {
                setError("An unknown error occurred while searching.");
            }
        }
    };

    // Effect to fetch events when the page number changes
    useEffect(() => {
        // Decide whether to search or refresh based on current query state
        if (query && query.trim().length > 0) {
            queryPublishedEvents();
        } else {
            refreshPublishedEvents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]); // Rerun effect only when page changes

    // Handler for the search button click (resets page to 0 for new search)
    const handleSearchClick = () => {
        setPage(0); // Reset to first page for a new search
        queryPublishedEvents(); // Execute search or refresh based on query content
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white p-4"> {/* Added padding */}
                <Alert variant="destructive" className="bg-gray-900 border-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                {/* Optional: Add a button to retry or go home */}
            </div>
        );
    }

    // Show loading indicator more reliably
    if (isLoading) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center"><p>Loading authentication...</p></div>;
    }

    return (
        <div className="bg-black min-h-screen text-white">
            {/* Nav */}
            <div className="flex justify-end p-4 container mx-auto">
                {isAuthenticated ? (
                    <div className="flex gap-4">
                        <Button
                            onClick={() => navigate("/dashboard")}
                            className="cursor-pointer"
                        >
                            Dashboard
                        </Button>
                        <Button
                            className="cursor-pointer"
                            // Ensure post_logout_redirect_uri is configured if used
                            onClick={() => signoutRedirect({ post_logout_redirect_uri: window.location.origin + '/' })}
                        >
                            Log out
                        </Button>
                    </div>
                ) : (
                    <div className="flex gap-4">
                        <Button className="cursor-pointer" onClick={() => signinRedirect()}>
                            Log in
                        </Button>
                    </div>
                )}
            </div>
            {/* Hero */}
            <div className="container mx-auto px-4 mb-8">
                <div className="bg-[url(/organizers-landing-hero.png)] bg-cover min-h-[200px] rounded-lg bg-bottom md:min-h-[250px]">
                    <div className="bg-black/45 min-h-[200px] md:min-h-[250px] p-4 md:p-8 flex flex-col justify-center"> {/* Adjusted padding */}
                        <h1 className="text-2xl font-bold mb-4">
                            Find Tickets to Your Next Event
                        </h1>
                        <div className="flex gap-2 max-w-lg">
                            <Input
                                className="bg-white text-black"
                                value={query || ""} // Use empty string if undefined
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search events by name or venue..." // Added placeholder
                                // Optional: Trigger search on Enter key press
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchClick(); }}
                            />
                            {/* Use handleSearchClick which resets page */}
                            <Button onClick={handleSearchClick}>
                                <Search />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Published Event Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 container mx-auto"> {/* Added container and responsive cols */}
                {publishedEvents?.content?.length === 0 && (
                    <p className="col-span-full text-center text-gray-400">No events found.</p> // Message for no results
                )}
                {publishedEvents?.content?.map((publishedEvent) => (
                    <PublishedEventCard
                        publishedEvent={publishedEvent}
                        key={publishedEvent.id}
                    />
                ))}
            </div>

            {/* Pagination - Render only if there are events */}
            {publishedEvents && publishedEvents.totalElements > 0 && (
                <div className="w-full flex justify-center py-8">
                    <SimplePagination
                        pagination={publishedEvents}
                        onPageChange={setPage}
                    />{" "}
                </div>
            )}
        </div>
    );
};

export default AttendeeLandingPage;