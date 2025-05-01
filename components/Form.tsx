'use client'

import { FormEvent, useRef, useMemo, useState, useEffect } from 'react'
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAvailability } from '@/app/contexts/AvailabilityContext'
import { format, startOfWeek, isSameDay, nextSaturday, startOfToday, parseISO, addDays } from 'date-fns'
import { WeeklyCalendar } from './WeeklyCalendar'

// Helper to get initial date (either from context or next Saturday)
const getInitialDate = (contextDate: string | null | undefined): Date => {
  try {
    if (contextDate) {
      const parsedDate = parseISO(contextDate); // Expects 'yyyy-MM-dd'
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
  } catch (error) {
    console.error("Error parsing date from context:", error);
  }
  return nextSaturday(startOfToday());
};

export function AvailabilitySearchForm() {
  const {
    searchTerm,
    setSearchTerm,
    date,
    setDate,
    numPeople,
    setNumPeople,
    dinnerOnly,
    setDinnerOnly,
    isLoading,
    fetchAvailability
  } = useAvailability()

  // Store the initial date used for generating the calendar weeks
  const initialCalendarDate = useMemo(() => getInitialDate(date), []); // Use empty dependency array so it only runs once

  // Local state for the calendar's selected Date object, initialized based on context or default
  const [localSelectedDate, setLocalSelectedDate] = useState<Date>(initialCalendarDate);

  // Update context date string when localSelectedDate changes
  useEffect(() => {
    const formattedDate = format(localSelectedDate, 'yyyy-MM-dd');
    if (formattedDate !== date) {
      setDate(formattedDate);
    }
  }, [localSelectedDate, setDate, date]);

  const handleDateSelect = (selectedDay: Date) => {
    setLocalSelectedDate(selectedDay);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await fetchAvailability()
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mb-8 p-4 bg-card rounded-lg shadow-md space-y-4">
      <div>
        <Label htmlFor="restaurantSearch" className="block text-sm font-medium mb-1">
          Where?
        </Label>
        <Input
          type="text"
          id="restaurantSearch"
          placeholder="e.g., Elmo's, Gemmayze..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <div>
        <Label className="block text-sm font-medium mb-2">
          When?
        </Label>
        <WeeklyCalendar
          initialDate={initialCalendarDate}
          selectedDate={localSelectedDate}
          onDateSelect={handleDateSelect}
        />
      </div>

      <div>
        <Label htmlFor="numPeople" className="block text-sm font-medium mb-1">
          How many?
        </Label>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setNumPeople(Math.max(1, numPeople - 1))}
            aria-label="Decrease number of people"
          >
            -
          </Button>
          <Input
            type="number"
            id="numPeople"
            value={numPeople}
            onChange={(e) => setNumPeople(parseInt(e.target.value, 10) || 1)}
            min="1"
            required
            className="w-full text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setNumPeople(numPeople + 1)}
            aria-label="Increase number of people"
          >
            +
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="dinner-only" className="text-sm font-medium">
          Show only dinner
        </Label>
        <Switch
          id="dinner-only"
          checked={dinnerOnly}
          onCheckedChange={setDinnerOnly}
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || !date}
        className="w-full"
      >
        {isLoading ? 'uhh...' : 'let\'s go'}
      </Button>
    </form>
  )
}
