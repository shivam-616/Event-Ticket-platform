import { SpringBootPagination } from "@/domain/domain";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react"; // Import React if not already

interface SimplePaginationProps<T> {
    pagination: SpringBootPagination<T>;
    onPageChange: (page: number) => void;
}

// Correctly destructure props here
export function SimplePagination<T>({
                                        pagination,
                                        onPageChange,
                                    }: SimplePaginationProps<T>): React.ReactElement { // Specify return type for clarity
    const currentPage = pagination.number;
    const totalPages = pagination.totalPages;

    // Ensure totalPages is at least 1 for display logic
    const displayTotalPages = Math.max(totalPages, 1);
    // Ensure currentPage is within valid bounds for display
    const displayCurrentPage = Math.min(Math.max(currentPage + 1, 1), displayTotalPages);


    return (
        <div className="flex gap-2 items-center">
            <Button
                size="sm"
                className="cursor-pointer"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={pagination.first}
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous Page</span>
            </Button>
            <div className="text-sm">
                {/* Use adjusted values for display */}
                Page {displayCurrentPage} of {displayTotalPages}
            </div>
            <Button
                size="sm"
                className="cursor-pointer"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={pagination.last}
            >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next Page</span>
            </Button>
        </div>
    );
}

// You can remove the React.FC wrapper if preferred, the function signature above works directly
// const SimplePaginationComponent: React.FC<SimplePaginationProps<any>> = SimplePagination;
// export { SimplePaginationComponent as SimplePagination };