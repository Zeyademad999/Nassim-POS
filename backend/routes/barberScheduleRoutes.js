// backend/routes/barberScheduleRoutes.js
import express from "express";
import dbPromise from "../utils/db.js";
import crypto from "crypto";

const router = express.Router();

// Add this new endpoint to your existing barberScheduleRoutes.js

// GET - Get available and booked slots for a specific barber and date
router.get("/:barberId/slots/:date", async (req, res) => {
  try {
    const { barberId, date } = req.params;
    const { duration = 30 } = req.query; // Default 30-minute slots

    const db = await dbPromise;

    // Validate inputs
    if (!barberId || !date) {
      return res.status(400).json({
        error: "Barber ID and date are required",
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        error: "Invalid date format (YYYY-MM-DD)",
      });
    }

    // Check if barber exists
    const barber = await db.get(`SELECT id, name FROM barbers WHERE id = ?`, [
      barberId,
    ]);
    if (!barber) {
      return res.status(404).json({ error: "Barber not found" });
    }

    // Get day of week (0=Sunday, 1=Monday, etc.)
    const dayOfWeek = new Date(date).getDay();

    // Get barber's schedule for this day
    const schedule = await db.get(
      `SELECT * FROM barber_schedules 
       WHERE barber_id = ? AND day_of_week = ?`,
      [barberId, dayOfWeek]
    );

    // Check if barber is working on this day
    if (!schedule || !schedule.is_working) {
      return res.json({
        success: true,
        date,
        barber: {
          id: barber.id,
          name: barber.name,
        },
        isWorkingDay: false,
        availableSlots: [],
        bookedSlots: [],
        schedule: null,
        message: "Barber is not working on this day",
      });
    }

    // Check for time off on this date
    const timeOff = await db.get(
      `SELECT * FROM barber_time_off 
       WHERE barber_id = ? 
       AND ? >= start_date 
       AND ? <= end_date`,
      [barberId, date, date]
    );

    if (timeOff) {
      return res.json({
        success: true,
        date,
        barber: {
          id: barber.id,
          name: barber.name,
        },
        isWorkingDay: false,
        availableSlots: [],
        bookedSlots: [],
        schedule,
        timeOff,
        message: `Barber is on ${timeOff.reason.toLowerCase()}`,
      });
    }

    // Get existing bookings for this date
    const bookings = await db.all(
      `SELECT booking_time, duration_minutes, status, 
              c.name as customer_name, c.mobile as customer_mobile
       FROM bookings b
       LEFT JOIN customers c ON b.customer_id = c.id
       WHERE b.barber_id = ? 
       AND b.booking_date = ? 
       AND b.status IN ('scheduled', 'confirmed')
       ORDER BY b.booking_time ASC`,
      [barberId, date]
    );

    // Generate all possible time slots based on schedule
    const startTime = schedule.start_time; // e.g., "09:00"
    const endTime = schedule.end_time; // e.g., "18:00"
    const breakStart = schedule.break_start; // e.g., "13:00"
    const breakEnd = schedule.break_end; // e.g., "14:00"

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const slotDuration = parseInt(duration);

    // Generate all possible slots
    const allSlots = [];
    for (
      let minutes = startMinutes;
      minutes < endMinutes;
      minutes += slotDuration
    ) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;

      // Skip break time slots
      if (breakStart && breakEnd) {
        const [breakStartHour, breakStartMinute] = breakStart
          .split(":")
          .map(Number);
        const [breakEndHour, breakEndMinute] = breakEnd.split(":").map(Number);

        const breakStartMinutes = breakStartHour * 60 + breakStartMinute;
        const breakEndMinutes = breakEndHour * 60 + breakEndMinute;

        if (minutes >= breakStartMinutes && minutes < breakEndMinutes) {
          continue;
        }
      }

      allSlots.push(timeString);
    }

    // Helper function to check if a slot conflicts with a booking
    const isSlotBooked = (slotTime) => {
      return bookings.some((booking) => {
        const bookingTime = booking.booking_time;
        const bookingDurationMinutes = booking.duration_minutes || 60;

        // Convert times to minutes for easier comparison
        const [slotHour, slotMinute] = slotTime.split(":").map(Number);
        const slotStartMinutes = slotHour * 60 + slotMinute;
        const slotEndMinutes = slotStartMinutes + slotDuration;

        const [bookingHour, bookingMinute] = bookingTime.split(":").map(Number);
        const bookingStartMinutes = bookingHour * 60 + bookingMinute;
        const bookingEndMinutes = bookingStartMinutes + bookingDurationMinutes;

        // Check for overlap
        return (
          slotStartMinutes < bookingEndMinutes &&
          slotEndMinutes > bookingStartMinutes
        );
      });
    };

    // Separate slots into available and booked
    const availableSlots = [];
    const bookedSlots = [];

    allSlots.forEach((slot) => {
      if (isSlotBooked(slot)) {
        // Find the booking details for this slot
        const booking = bookings.find((b) => {
          const [slotHour, slotMinute] = slot.split(":").map(Number);
          const slotStartMinutes = slotHour * 60 + slotMinute;

          const [bookingHour, bookingMinute] = b.booking_time
            .split(":")
            .map(Number);
          const bookingStartMinutes = bookingHour * 60 + bookingMinute;
          const bookingEndMinutes =
            bookingStartMinutes + (b.duration_minutes || 60);

          return (
            slotStartMinutes >= bookingStartMinutes &&
            slotStartMinutes < bookingEndMinutes
          );
        });

        bookedSlots.push({
          time: slot,
          booking: booking
            ? {
                time: booking.booking_time,
                duration: booking.duration_minutes,
                customer: booking.customer_name,
                mobile: booking.customer_mobile,
                status: booking.status,
              }
            : null,
        });
      } else {
        availableSlots.push({
          time: slot,
          duration: slotDuration,
        });
      }
    });

    // Check if it's a past date
    const today = new Date().toISOString().split("T")[0];
    const isPastDate = date < today;

    // If it's today, filter out past slots
    if (date === today) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      availableSlots.forEach((slot) => {
        const [hour, minute] = slot.time.split(":").map(Number);
        const slotMinutes = hour * 60 + minute;

        if (slotMinutes <= currentMinutes) {
          slot.isPast = true;
        }
      });
    }

    return res.json({
      success: true,
      date,
      barber: {
        id: barber.id,
        name: barber.name,
      },
      isWorkingDay: true,
      isPastDate,
      schedule: {
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        breakStart: schedule.break_start,
        breakEnd: schedule.break_end,
        slotDuration,
      },
      availableSlots: isPastDate
        ? []
        : availableSlots.filter((slot) => !slot.isPast),
      bookedSlots,
      summary: {
        totalSlots: allSlots.length,
        availableCount: isPastDate
          ? 0
          : availableSlots.filter((slot) => !slot.isPast).length,
        bookedCount: bookedSlots.length,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching barber slots:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch barber slots",
    });
  }
});

// GET - Get slots for multiple days (useful for calendar views)
router.get("/:barberId/slots-range", async (req, res) => {
  try {
    const { barberId } = req.params;
    const { startDate, endDate, duration = 30 } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: "startDate and endDate are required",
      });
    }

    const db = await dbPromise;

    // Check if barber exists
    const barber = await db.get(`SELECT id, name FROM barbers WHERE id = ?`, [
      barberId,
    ]);
    if (!barber) {
      return res.status(404).json({ error: "Barber not found" });
    }

    const result = {};
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Limit range to prevent abuse (max 30 days)
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (daysDiff > 30) {
      return res.status(400).json({
        error: "Date range cannot exceed 30 days",
      });
    }

    // Get data for each date in range
    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      const dateStr = date.toISOString().split("T")[0];

      // Make internal request to single date endpoint
      try {
        const singleDateResponse = await fetch(
          `http://localhost:5000/api/barber-schedule/${barberId}/slots/${dateStr}?duration=${duration}`
        );
        if (singleDateResponse.ok) {
          const singleDateData = await singleDateResponse.json();
          result[dateStr] = {
            isWorkingDay: singleDateData.isWorkingDay,
            availableCount: singleDateData.summary?.availableCount || 0,
            bookedCount: singleDateData.summary?.bookedCount || 0,
            availableSlots: singleDateData.availableSlots || [],
            bookedSlots: singleDateData.bookedSlots || [],
          };
        } else {
          result[dateStr] = {
            isWorkingDay: false,
            availableCount: 0,
            bookedCount: 0,
            availableSlots: [],
            bookedSlots: [],
          };
        }
      } catch (err) {
        console.error(`Error fetching slots for ${dateStr}:`, err);
        result[dateStr] = {
          isWorkingDay: false,
          availableCount: 0,
          bookedCount: 0,
          availableSlots: [],
          bookedSlots: [],
          error: "Failed to fetch data",
        };
      }
    }

    res.json({
      success: true,
      barber: {
        id: barber.id,
        name: barber.name,
      },
      dateRange: {
        startDate,
        endDate,
      },
      slotDuration: parseInt(duration),
      dates: result,
    });
  } catch (err) {
    console.error("❌ Error fetching barber slots range:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch barber slots range",
    });
  }
});

// GET - Get next available slots for a barber (useful for quick booking)
router.get("/:barberId/next-available", async (req, res) => {
  try {
    const { barberId } = req.params;
    const { limit = 10, duration = 30 } = req.query;

    const db = await dbPromise;

    // Check if barber exists
    const barber = await db.get(`SELECT id, name FROM barbers WHERE id = ?`, [
      barberId,
    ]);
    if (!barber) {
      return res.status(404).json({ error: "Barber not found" });
    }

    const nextSlots = [];
    const today = new Date();
    const maxDays = 30; // Look ahead up to 30 days

    for (let i = 0; i < maxDays && nextSlots.length < limit; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      try {
        const response = await fetch(
          `http://localhost:5000/api/barber-schedule/${barberId}/slots/${dateStr}?duration=${duration}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.availableSlots.length > 0) {
            data.availableSlots.forEach((slot) => {
              if (nextSlots.length < limit) {
                nextSlots.push({
                  date: dateStr,
                  time: slot.time,
                  duration: slot.duration,
                  dayName: date.toLocaleDateString("en-US", {
                    weekday: "long",
                  }),
                });
              }
            });
          }
        }
      } catch (err) {
        console.error(`Error fetching slots for ${dateStr}:`, err);
      }
    }

    res.json({
      success: true,
      barber: {
        id: barber.id,
        name: barber.name,
      },
      nextAvailableSlots: nextSlots.slice(0, limit),
      searchedDays: Math.min(maxDays, nextSlots.length > 0 ? maxDays : 30),
    });
  } catch (err) {
    console.error("❌ Error fetching next available slots:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch next available slots",
    });
  }
});

// GET barber schedule by barber ID
router.get("/:barberId", async (req, res) => {
  try {
    const { barberId } = req.params;
    const db = await dbPromise;

    // Get weekly schedule
    const schedule = await db.all(
      `
      SELECT * FROM barber_schedules 
      WHERE barber_id = ? 
      ORDER BY day_of_week ASC
    `,
      [barberId]
    );

    // Get time off periods
    const timeOff = await db.all(
      `
      SELECT * FROM barber_time_off 
      WHERE barber_id = ? 
      AND end_date >= date('now')
      ORDER BY start_date ASC
    `,
      [barberId]
    );

    res.json({
      schedule,
      timeOff,
    });
  } catch (err) {
    console.error("❌ Error fetching barber schedule:", err);
    res.status(500).json({ error: "Failed to fetch barber schedule" });
  }
});

// POST/PUT - Create or update barber weekly schedule
router.put("/:barberId/schedule", async (req, res) => {
  try {
    const { barberId } = req.params;
    const { weeklySchedule } = req.body; // Array of 7 days (0-6)

    const db = await dbPromise;

    // Start transaction
    await db.run("BEGIN TRANSACTION");

    try {
      // Delete existing schedule for this barber
      await db.run("DELETE FROM barber_schedules WHERE barber_id = ?", [
        barberId,
      ]);

      // Insert new schedule
      for (const daySchedule of weeklySchedule) {
        const {
          dayOfWeek,
          isWorking,
          startTime,
          endTime,
          breakStart,
          breakEnd,
        } = daySchedule;

        await db.run(
          `
          INSERT INTO barber_schedules (
            id, barber_id, day_of_week, start_time, end_time, 
            is_working, break_start, break_end, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            crypto.randomUUID(),
            barberId,
            dayOfWeek,
            startTime || "09:00",
            endTime || "18:00",
            isWorking ? 1 : 0,
            breakStart || null,
            breakEnd || null,
            new Date().toISOString(),
          ]
        );
      }

      await db.run("COMMIT");
      res.json({ message: "Schedule updated successfully" });
    } catch (err) {
      await db.run("ROLLBACK");
      throw err;
    }
  } catch (err) {
    console.error("❌ Error updating barber schedule:", err);
    res.status(500).json({ error: "Failed to update barber schedule" });
  }
});

// POST - Add time off period
router.post("/:barberId/time-off", async (req, res) => {
  try {
    const { barberId } = req.params;
    const { startDate, endDate, reason, notes } = req.body;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Start date and end date are required" });
    }

    const db = await dbPromise;
    await db.run(
      `
      INSERT INTO barber_time_off (
        id, barber_id, start_date, end_date, reason, notes
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        crypto.randomUUID(),
        barberId,
        startDate,
        endDate,
        reason || "Personal",
        notes || "",
      ]
    );

    res.status(201).json({ message: "Time off added successfully" });
  } catch (err) {
    console.error("❌ Error adding time off:", err);
    res.status(500).json({ error: "Failed to add time off" });
  }
});

// DELETE - Remove time off period
router.delete("/:barberId/time-off/:timeOffId", async (req, res) => {
  try {
    const { barberId, timeOffId } = req.params;
    const db = await dbPromise;

    const result = await db.run(
      `
      DELETE FROM barber_time_off 
      WHERE id = ? AND barber_id = ?
    `,
      [timeOffId, barberId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Time off period not found" });
    }

    res.json({ message: "Time off removed successfully" });
  } catch (err) {
    console.error("❌ Error removing time off:", err);
    res.status(500).json({ error: "Failed to remove time off" });
  }
});

// GET - Check barber availability for a specific date/time
router.get("/:barberId/availability/:date", async (req, res) => {
  try {
    const { barberId, date } = req.params;
    const db = await dbPromise;

    // Get day of week (0=Sunday)
    const dayOfWeek = new Date(date).getDay();

    // Check regular schedule
    const schedule = await db.get(
      `
      SELECT * FROM barber_schedules 
      WHERE barber_id = ? AND day_of_week = ?
    `,
      [barberId, dayOfWeek]
    );

    // Check for time off
    const timeOff = await db.get(
      `
      SELECT * FROM barber_time_off 
      WHERE barber_id = ? 
      AND ? >= start_date 
      AND ? <= end_date
    `,
      [barberId, date, date]
    );

    // Check existing bookings for this date
    const bookings = await db.all(
      `
      SELECT booking_time, duration_minutes FROM bookings 
      WHERE barber_id = ? 
      AND booking_date = ? 
      AND status != 'cancelled'
      ORDER BY booking_time ASC
    `,
      [barberId, date]
    );

    const isAvailable = schedule && schedule.is_working && !timeOff;

    res.json({
      isAvailable,
      schedule,
      timeOff,
      bookings,
      dayOfWeek,
    });
  } catch (err) {
    console.error("❌ Error checking availability:", err);
    res.status(500).json({ error: "Failed to check availability" });
  }
});

export default router;
