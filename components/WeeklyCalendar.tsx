'use client'

import { useRef, useEffect, useMemo } from "react";
import { format, startOfWeek, addDays, isSameDay, isBefore, startOfToday } from "date-fns";
import { Button } from "@/components/ui/button";

interface WeeklyCalendarProps {
	initialDate: Date; // Renamed to reflect it's the reference for generating weeks
	selectedDate: Date;
	onDateSelect: (date: Date) => void;
}

export const WeeklyCalendar = ({ initialDate, selectedDate, onDateSelect }: WeeklyCalendarProps) => {
	const scrollRef = useRef<HTMLDivElement>(null);
	const today = startOfToday(); // Get the start of today for comparison

	const weeks = useMemo(() => {
		// Generate 5 weeks total - initial week + 4 future weeks
		// Use initialDate as the reference for the *first* week
		const firstWeekStartDate = startOfWeek(initialDate, { weekStartsOn: 1 });
		return [0, 1, 2, 3, 4].map(offset => {
			const startDate = addDays(firstWeekStartDate, offset * 7);
			return Array.from({ length: 7 }).map((_, index) => addDays(startDate, index));
		});
	}, [initialDate]); // Depend only on the initialDate

	useEffect(() => {
		// Scroll to the initial week (which is now the first week) on mount
		if (scrollRef.current) {
			// No need to calculate index, always scroll to the beginning
			const timer = setTimeout(() => {
				if (scrollRef.current) {
					scrollRef.current.scrollLeft = 0;
				}
			}, 0);
			return () => clearTimeout(timer);
		}
		// Removed dependencies: initialDate, weeks - only needs to run once on mount
	}, []);

	return (
		<div className="border rounded-md">
			{/* Day labels (M, T, W...) */}
			<div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground px-2 pt-3 mb-2">
				{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
					<div key={i}>{day}</div>
				))}
			</div>
			{/* Scrollable weeks container */}
			<div
				ref={scrollRef}
				className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1"
			>
				{weeks.map((week, weekIdx) => (
					// Each week container
					<div
						key={weekIdx}
						className="grid grid-cols-7 gap-1 px-2 min-w-full flex-shrink-0 snap-center"
					>
						{week.map((day, i) => {
							// Individual date button
							const isPast = isBefore(day, today);
							const isSelected = isSameDay(day, selectedDate);

							return (
								<Button
									key={i}
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => onDateSelect(day)}
									disabled={isPast} // Disable button if the date is in the past
									className={`h-8 w-8 rounded-full flex items-center justify-center mx-auto text-sm font-medium ${
										isSelected
											? 'bg-primary text-primary-foreground hover:bg-primary/90'
											: isPast
												? 'text-muted-foreground opacity-50 cursor-not-allowed' // Style for past dates
												: 'text-foreground hover:bg-accent hover:text-accent-foreground' // Style for future, non-selected dates
									}`}
								>
									{format(day, 'd')}
								</Button>
							);
						})}
					</div>
				))}
			</div>
		</div>
	);
}; 