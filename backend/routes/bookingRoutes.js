import express from "express";
import dbPromise from "../utils/db.js";

const router = express.Router();

// GET all bookings with filtering
router.get("/", async (req, res) => {
  try {
    const {
      date,
      barber_id,
      customer_id,
      status = "all",
      limit = 50,
      offset = 0,
    } = req.query;

    const db = await dbPromise;

    let query = `
      SELECT 
        b.*,
        c.name as customer_name,
        c.mobile as customer_mobile,
        br.name as barber_name,
        br.specialty as barber_specialty
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN barbers br ON b.barber_id = br.id
      WHERE 1=1
    `;

    const params = [];

    if (date) {
      query += ` AND DATE(b.booking_date) = ?`;
      params.push(date);
    }

    if (barber_id) {
      query += ` AND b.barber_id = ?`;
      params.push(barber_id);
    }

    if (customer_id) {
      query += ` AND b.customer_id = ?`;
      params.push(customer_id);
    }

    if (status !== "all") {
      query += ` AND b.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY b.booking_date DESC, b.booking_time ASC`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const bookings = await db.all(query, params);

    // Parse service_ids and get service details
    const bookingsWithServices = await Promise.all(
      bookings.map(async (booking) => {
        let services = [];
        if (booking.service_ids) {
          try {
            const serviceIds = JSON.parse(booking.service_ids);
            if (serviceIds.length > 0) {
              const placeholders = serviceIds.map(() => "?").join(",");
              services = await db.all(
                `
                SELECT id, name, price 
                FROM services 
                WHERE id IN (${placeholders})
              `,
                serviceIds
              );
            }
          } catch (err) {
            console.error("Failed to parse service_ids:", err);
          }
        }
        return { ...booking, services };
      })
    );

    res.json(bookingsWithServices);
  } catch (err) {
    console.error("Failed to fetch bookings:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// GET single booking
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    const booking = await db.get(
      `
      SELECT 
        b.*,
        c.name as customer_name,
        c.mobile as customer_mobile,
        c.email as customer_email,
        br.name as barber_name,
        br.specialty as barber_specialty
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN barbers br ON b.barber_id = br.id
      WHERE b.id = ?
    `,
      [id]
    );

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Get service details
    let services = [];
    if (booking.service_ids) {
      try {
        const serviceIds = JSON.parse(booking.service_ids);
        if (serviceIds.length > 0) {
          const placeholders = serviceIds.map(() => "?").join(",");
          services = await db.all(
            `
            SELECT id, name, price 
            FROM services 
            WHERE id IN (${placeholders})
          `,
            serviceIds
          );
        }
      } catch (err) {
        console.error("Failed to parse service_ids:", err);
      }
    }

    res.json({ ...booking, services });
  } catch (err) {
    console.error("Failed to fetch booking:", err);
    res.status(500).json({ error: "Failed to fetch booking" });
  }
});

// POST create new booking
router.post("/", async (req, res) => {
  try {
    const {
      customer_id,
      barber_id,
      service_ids = [],
      booking_date,
      booking_time,
      duration_minutes = 60,
      notes,
      estimated_cost,
    } = req.body;

    // Validation
    if (!customer_id || !barber_id || !booking_date || !booking_time) {
      return res.status(400).json({
        error: "Customer, barber, date, and time are required",
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(booking_date)) {
      return res
        .status(400)
        .json({ error: "Invalid date format (YYYY-MM-DD)" });
    }

    // Validate time format
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(booking_time)) {
      return res.status(400).json({ error: "Invalid time format (HH:MM)" });
    }

    const db = await dbPromise;

    // Check if customer exists
    const customer = await db.get(`SELECT id FROM customers WHERE id = ?`, [
      customer_id,
    ]);
    if (!customer) {
      return res.status(400).json({ error: "Customer not found" });
    }

    // Check if barber exists
    const barber = await db.get(`SELECT id FROM barbers WHERE id = ?`, [
      barber_id,
    ]);
    if (!barber) {
      return res.status(400).json({ error: "Barber not found" });
    }

    // Check for booking conflicts
    const conflictingBooking = await db.get(
      `
      SELECT id FROM bookings 
      WHERE barber_id = ? 
      AND booking_date = ? 
      AND booking_time = ?
      AND status IN ('scheduled', 'confirmed')
    `,
      [barber_id, booking_date, booking_time]
    );

    if (conflictingBooking) {
      return res.status(400).json({
        error: "Barber is already booked at this time",
      });
    }

    const bookingId = `booking_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    await db.run(
      `
      INSERT INTO bookings (
        id, customer_id, barber_id, service_ids, booking_date, booking_time,
        duration_minutes, notes, estimated_cost, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
      [
        bookingId,
        customer_id,
        barber_id,
        JSON.stringify(service_ids),
        booking_date,
        booking_time,
        duration_minutes,
        notes?.trim() || null,
        estimated_cost,
      ]
    );

    // Get the created booking with details
    const newBooking = await db.get(
      `
      SELECT 
        b.*,
        c.name as customer_name,
        c.mobile as customer_mobile,
        br.name as barber_name,
        br.specialty as barber_specialty
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN barbers br ON b.barber_id = br.id
      WHERE b.id = ?
    `,
      [bookingId]
    );

    // Get service details
    let services = [];
    if (service_ids.length > 0) {
      const placeholders = service_ids.map(() => "?").join(",");
      services = await db.all(
        `
        SELECT id, name, price 
        FROM services 
        WHERE id IN (${placeholders})
      `,
        service_ids
      );
    }

    res.status(201).json({ ...newBooking, services });
  } catch (err) {
    console.error("Failed to create booking:", err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// PUT update booking
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customer_id,
      barber_id,
      service_ids = [],
      booking_date,
      booking_time,
      duration_minutes,
      status,
      notes,
      estimated_cost,
    } = req.body;

    const db = await dbPromise;

    // Check if booking exists
    const existingBooking = await db.get(
      `SELECT id FROM bookings WHERE id = ?`,
      [id]
    );
    if (!existingBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check for conflicts if time/date/barber changed
    if (barber_id && booking_date && booking_time) {
      const conflictingBooking = await db.get(
        `
        SELECT id FROM bookings 
        WHERE barber_id = ? 
        AND booking_date = ? 
        AND booking_time = ?
        AND status IN ('scheduled', 'confirmed')
        AND id != ?
      `,
        [barber_id, booking_date, booking_time, id]
      );

      if (conflictingBooking) {
        return res.status(400).json({
          error: "Barber is already booked at this time",
        });
      }
    }

    await db.run(
      `
      UPDATE bookings 
      SET 
        customer_id = COALESCE(?, customer_id),
        barber_id = COALESCE(?, barber_id),
        service_ids = COALESCE(?, service_ids),
        booking_date = COALESCE(?, booking_date),
        booking_time = COALESCE(?, booking_time),
        duration_minutes = COALESCE(?, duration_minutes),
        status = COALESCE(?, status),
        notes = COALESCE(?, notes),
        estimated_cost = COALESCE(?, estimated_cost),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [
        customer_id,
        barber_id,
        service_ids ? JSON.stringify(service_ids) : null,
        booking_date,
        booking_time,
        duration_minutes,
        status,
        notes?.trim(),
        estimated_cost,
        id,
      ]
    );

    // Get the updated booking with details
    const updatedBooking = await db.get(
      `
      SELECT 
        b.*,
        c.name as customer_name,
        c.mobile as customer_mobile,
        br.name as barber_name,
        br.specialty as barber_specialty
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN barbers br ON b.barber_id = br.id
      WHERE b.id = ?
    `,
      [id]
    );

    res.json(updatedBooking);
  } catch (err) {
    console.error("Failed to update booking:", err);
    res.status(500).json({ error: "Failed to update booking" });
  }
});

// DELETE booking
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    // Check if booking exists
    const existingBooking = await db.get(
      `SELECT id FROM bookings WHERE id = ?`,
      [id]
    );
    if (!existingBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    await db.run(`DELETE FROM bookings WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete booking:", err);
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

// GET available time slots for a barber on a specific date
router.get("/availability/:barber_id/:date", async (req, res) => {
  try {
    const { barber_id, date } = req.params;
    const db = await dbPromise;

    // Check if barber exists
    const barber = await db.get(`SELECT id FROM barbers WHERE id = ?`, [
      barber_id,
    ]);
    if (!barber) {
      return res.status(404).json({ error: "Barber not found" });
    }

    // Get existing bookings for the date
    const existingBookings = await db.all(
      `
      SELECT booking_time, duration_minutes
      FROM bookings
      WHERE barber_id = ? AND booking_date = ? AND status IN ('scheduled', 'confirmed')
      ORDER BY booking_time ASC
    `,
      [barber_id, date]
    );

    // Generate available slots (9 AM to 6 PM, 30-minute intervals)
    const workingHours = {
      start: 9, // 9 AM
      end: 18, // 6 PM
      interval: 30, // 30 minutes
    };

    const availableSlots = [];
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += workingHours.interval) {
        const timeSlot = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

        // Check if this slot conflicts with existing bookings
        const isConflict = existingBookings.some((booking) => {
          const bookingTime = booking.booking_time;
          const bookingDuration = booking.duration_minutes || 60;

          // Convert times to minutes for easier comparison
          const [bookingHour, bookingMinute] = bookingTime
            .split(":")
            .map(Number);
          const bookingStartMinutes = bookingHour * 60 + bookingMinute;
          const bookingEndMinutes = bookingStartMinutes + bookingDuration;

          const slotStartMinutes = hour * 60 + minute;
          const slotEndMinutes = slotStartMinutes + workingHours.interval;

          // Check for overlap
          return (
            slotStartMinutes < bookingEndMinutes &&
            slotEndMinutes > bookingStartMinutes
          );
        });

        if (!isConflict) {
          availableSlots.push(timeSlot);
        }
      }
    }

    res.json({
      date,
      barber_id,
      availableSlots,
      existingBookings: existingBookings.map((b) => b.booking_time),
    });
  } catch (err) {
    console.error("Failed to fetch availability:", err);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

// POST complete booking (convert to transaction)
router.post("/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      payment_method = "cash",
      actual_total,
      discount_amount = 0,
    } = req.body;

    const db = await dbPromise;

    // Start transaction
    await db.run("BEGIN TRANSACTION");

    try {
      // Get booking details
      const booking = await db.get(
        `
        SELECT 
          b.*,
          c.name as customer_name,
          c.mobile as customer_mobile,
          br.name as barber_name
        FROM bookings b
        LEFT JOIN customers c ON b.customer_id = c.id
        LEFT JOIN barbers br ON b.barber_id = br.id
        WHERE b.id = ?
      `,
        [id]
      );

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status === "completed") {
        throw new Error("Booking already completed");
      }

      // Create transaction
      const transactionId = `tx_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const total = actual_total || booking.estimated_cost || 0;
      const subtotal = total + discount_amount;
      const tax = subtotal * 0.08; // 8% tax

      await db.run(
        `
        INSERT INTO transactions (
          id, customer_name, customer_id, barber_name, barber_id,
          service_date, subtotal, discount_amount, tax, total,
          payment_method, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
        [
          transactionId,
          booking.customer_name,
          booking.customer_id,
          booking.barber_name,
          booking.barber_id,
          booking.booking_date,
          subtotal,
          discount_amount,
          tax,
          total,
          payment_method,
        ]
      );

      // Add transaction items if services were booked
      if (booking.service_ids) {
        try {
          const serviceIds = JSON.parse(booking.service_ids);
          const services = await db.all(
            `
            SELECT id, name, price 
            FROM services 
            WHERE id IN (${serviceIds.map(() => "?").join(",")})
          `,
            serviceIds
          );

          for (const service of services) {
            const itemId = `ti_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`;
            await db.run(
              `
              INSERT INTO transaction_items (
                id, transaction_id, item_type, service_id, item_name, price, quantity
              ) VALUES (?, ?, 'service', ?, ?, ?, 1)
            `,
              [itemId, transactionId, service.id, service.name, service.price]
            );
          }
        } catch (err) {
          console.error("Failed to process services:", err);
        }
      }

      // Update booking status
      await db.run(
        `
        UPDATE bookings 
        SET status = 'completed', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
        [id]
      );

      // Update customer statistics
      await db.run(
        `
        UPDATE customers 
        SET 
          total_visits = total_visits + 1,
          total_spent = total_spent + ?,
          last_visit = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
        [total, booking.customer_id]
      );

      // Create customer visit record
      const visitId = `visit_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      await db.run(
        `
        INSERT INTO customer_visits (
          id, customer_id, transaction_id, visit_date, barber_id, amount_spent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
        [
          visitId,
          booking.customer_id,
          transactionId,
          booking.booking_date,
          booking.barber_id,
          total,
        ]
      );

      await db.run("COMMIT");
      res.json({ success: true, transaction_id: transactionId });
    } catch (err) {
      await db.run("ROLLBACK");
      throw err;
    }
  } catch (err) {
    console.error("Failed to complete booking:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to complete booking" });
  }
});

// GET booking statistics
router.get("/stats/summary", async (req, res) => {
  try {
    const { date } = req.query;
    const db = await dbPromise;

    let dateCondition = "";
    const params = [];

    if (date) {
      dateCondition = "WHERE DATE(booking_date) = ?";
      params.push(date);
    } else {
      dateCondition = 'WHERE DATE(booking_date) = DATE("now")';
    }

    const stats = await db.get(
      `
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        SUM(estimated_cost) as total_estimated_revenue
      FROM bookings
      ${dateCondition}
    `,
      params
    );

    res.json(stats);
  } catch (err) {
    console.error("Failed to fetch booking statistics:", err);
    res.status(500).json({ error: "Failed to fetch booking statistics" });
  }
});

export default router;
