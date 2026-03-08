const { pool } = require('../config/db');
const cron = require('node-cron');
const upload = require('../config/multer');
const { uploadToCloudinary } = require('../utils/uploader');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');

const requestEvent = async (req, res) => {
  const {
    event_title,
    event_nature,
    organised_by,
    organiser_name,
    expected_participants,
    category,
    start_date,
    end_date,
    sponsors,
    halls_required,
    banners,
    stalls,
    event_description,
  } = req.body;
  const faculty_incharge_email = req.user.email;

  try {
    const result = await pool.query(
      'INSERT INTO Event (event_title, event_nature, organised_by, organiser_name, expected_participants, category, faculty_incharge_email, start_date, end_date, approval_status, halls_booked, sponsors, stalls, banners, event_description, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW() + INTERVAL \'7 days\') RETURNING event_id',
      [
        event_title,
        event_nature,
        organised_by,
        organiser_name,
        expected_participants,
        category,
        faculty_incharge_email,
        start_date,
        end_date,
        'pending',
        halls_required,
        sponsors,
        stalls,
        banners,
        event_description,
      ]
    );
    res.json({ event_id: result.rows[0].event_id });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      res.status(400).json({ error: 'Dates are already booked for another event.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

// Get my events for faculty
const getMyEvents = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT event_id, event_title, organiser_name, start_date, end_date, approval_status FROM Event WHERE faculty_incharge_email = $1 ORDER BY start_date DESC',
      [req.user.email]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// Helper function to format date as YYYY-MM-DD
function formatDateForSubmission(dateInput) {
  const date = new Date(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

// Get booked dates
const getBookedDates = async (req, res) =>  {
  try {
    const result = await pool.query(
      `SELECT event_id, start_date, end_date 
       FROM Event 
       WHERE approval_status != $1 
       AND start_date >= CURRENT_DATE`,
      ['cancelled']
    );

    const bookedDates = {};
    result.rows.forEach(row => {
      // shift start and end forward by 1
      const startDate = new Date(row.start_date);
      startDate.setDate(startDate.getDate());

      const endDate = new Date(row.end_date);
      endDate.setDate(endDate.getDate());

      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const formattedDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
        bookedDates[formattedDate] = row.event_id;
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    res.status(200).json({ bookedDates });
  } catch (err) {
    console.error('Fetch booked dates error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Upload approval document
const uploadApproval = async (req, res) => {
  try {
    const { event_id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'File must be a PDF' });
    }

    const event = await pool.query(
      'SELECT * FROM Event WHERE event_id = $1 AND approval_status = $2',
      [event_id, 'pending']
    );
    if (event.rows.length === 0) {
      return res.status(400).json({ error: 'Event not found or not in pending status' });
    }

    if (new Date(event.rows[0].expires_at) < new Date()) {
      await pool.query('UPDATE Event SET approval_status = $1 WHERE event_id = $2', ['expired', event_id]);
      return res.status(400).json({ error: 'Event has expired' });
    }

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(file, event_id, 'approval_document');

    // Update event with Cloudinary URL and set status to 'approved'
    await pool.query(
      'UPDATE Event SET approval_status = $1, approval_document_url = $2, expires_at = NULL WHERE event_id = $3',
      ['approved', cloudinaryUrl, event_id]
    );

    res.json({ message: 'Approval document uploaded successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload approval document' });
  }
};

// Get event details
const getEventDetails = async (req, res) => {
  try {
    const { event_id } = req.params;
    const result = await pool.query(
      `SELECT e.event_id, e.event_title, e.approval_document_url, e.organised_by, e.organiser_name, e.category, 
              e.start_date, e.end_date, e.approval_status, e.halls_booked AS halls_required, 
              e.sponsors, e.stalls, e.banners, e.created_at, e.expires_at, e.event_description,
              e.event_nature, e.expected_participants,
              u.email AS faculty_email, u.name AS faculty_name, u.designation, u.dept AS department, u.phone_number
       FROM Event e
       LEFT JOIN users u ON e.faculty_incharge_email = u.email
       WHERE e.event_id = $1`,
      [event_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = result.rows[0];

    let parsedBanners = [];
    try {
      parsedBanners = event.banners ? (event.banners) : [];
      if (!Array.isArray(parsedBanners)) {
        parsedBanners = [];
      }
    } catch (parseError) {
      parsedBanners = [];
    }

    res.json({
      event_id: event.event_id,
      event_title: event.event_title,
      organised_by: event.organised_by,
      organiser_name: event.organiser_name,
      category: event.category,
      start_date: event.start_date,
      end_date: event.end_date,
      sponsors: Array.isArray(event.sponsors) ? event.sponsors : [],
      halls_required: Array.isArray(event.halls_required) ? event.halls_required : [],
      banners: parsedBanners,
      stalls: event.stalls,
      approval_status: event.approval_status,
      created_at: event.created_at,
      expires_at: event.expires_at,
      event_description: event.event_description || '',
      event_nature: event.event_nature,
      expected_participants: event.expected_participants,
      approval_document_url: event.approval_document_url,
      faculty_incharge: {
        email: event.faculty_email,
        name: event.faculty_name,
        designation: event.designation,
        department: event.department,
        phone_number: event.phone_number,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
};

// Cron job for cleanup
cron.schedule('0 0 * * *', async () => {
  try {
    const result = await pool.query(
      'DELETE FROM Event WHERE approval_status = $1 AND expires_at <= NOW() RETURNING event_id',
      ['pending']
    );
    console.log(`Deleted ${result.rowCount} expired events at ${new Date().toISOString()}`);
  } catch (err) {
    console.error('Error in cron job:', err);
  }
});

const generateEventPdf = async (req, res) => {
  const { event_id } = req.params;

  try {
    // Fetch event details
    const result = await pool.query(
      `SELECT e.event_id, e.event_title, e.organised_by, e.organiser_name, e.category, 
              e.start_date, e.end_date, e.approval_status, e.halls_booked AS halls_required, 
              e.sponsors, e.stalls, e.banners, e.created_at, e.expires_at, e.event_description,
              u.email AS faculty_email, u.name AS faculty_name, u.designation, u.dept AS department, u.phone_number
        FROM Event e
        LEFT JOIN users u ON e.faculty_incharge_email = u.email
        WHERE e.event_id = $1`,
      [event_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = result.rows[0];

    // Format date for display
    const formatDateForDisplay = (dateStr) => {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '-';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    // Start and End Date
    const startDateDisplay = formatDateForDisplay(event.start_date);
    const endDateDisplay = formatDateForDisplay(event.end_date);
    const sameDate = startDateDisplay === endDateDisplay;

    // Organiser Role
    let organiserRole = '';
    switch (event.organised_by) {
      case 'Department':
      case 'Association':
        organiserRole = 'HoD';
        break;
      case 'Student Chapter':
        organiserRole = 'Faculty Advisor';
        break;
      case 'PSG Polytechnic':
        organiserRole = 'Principal';
        break;
      default:
        organiserRole = '';
    }

    // Determine if organiser signature should be shown
    const showOrganiser = ['Association', 'Department', 'Student Chapter', 'PSG Polytechnic'].includes(event.organised_by);

    // Determine if stalls row should be shown
    const stallsObj = event.stalls || {};
    const showStalls = stallsObj.food || stallsObj.sales || stallsObj.marketing;
    const showExpiresAt = event.expires_at && formatDateForDisplay(event.expires_at) !== '-';

    // Prepare template data
    const templateData = {
      event_id: event.event_id || '-',
      event_title: event.event_title || '-',
      start_date_display: startDateDisplay,
      end_date_display: endDateDisplay,
      sameDate,
      organiser_role: organiserRole,
      organiser_name: event.organiser_name || '-',
      organiser_by: event.organised_by || '-',
      faculty_incharge_name: event.faculty_name || '-',
      sponsors: Array.isArray(event.sponsors) ? event.sponsors : [],
      halls: Array.isArray(event.halls_required) ? event.halls_required : [],
      banners: Array.isArray(event.banners) ? event.banners : [],
      stalls: stallsObj,
      showStalls,
      showOrganiser,
      showExpiresAt, 
      created_at: formatDateForDisplay(event.created_at) || '-',
      expires_at: formatDateForDisplay(event.expires_at) || '-',
      description: event.event_description,
      department: event.department,
    };

    // Render Handlebars template
    const templatePath = path.join(__dirname, '../templates/formTemplate.hbs');
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateContent);
    const html = template(templateData);

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    });
    await browser.close();

    // Send PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Event-Approval-Form-${event_id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);

  } catch (err) {
    res.status(500).json({ error: 'Unable to generate PDF. Please try again later.', details: err.message });
  }
};


const getPendingEvents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT event_id, event_title, organised_by, organiser_name, category, 
              start_date, end_date, approval_status, approval_document_url
       FROM Event 
       WHERE approval_status = $1 
       ORDER BY start_date DESC`,
      ['pending']
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending events' });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT event_id, event_title, organised_by, organiser_name, category, 
             start_date, end_date, approval_status, approval_document_url, event_nature
      FROM Event 
      ORDER BY start_date DESC
    `;
    let params = [];

    if (status && ['pending', 'confirmed', 'rejected', 'cancelled'].includes(status)) {
      query = `
        SELECT event_id, event_title, organised_by, organiser_name, category, 
               start_date, end_date, approval_status, approval_document_url, event_nature
        FROM Event 
        WHERE approval_status = $1 
        ORDER BY start_date DESC
      `;
      params = [status];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// Cancel Event Controller
const cancelEvent = async (req, res) => {
  const { event_id } = req.params;
  const { role } = req.user;

  try {
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can cancel events' });
    }

    const eventResult = await pool.query(
      'SELECT start_date, approval_status FROM Event WHERE event_id = $1',
      [event_id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventResult.rows[0];
    if (event.approval_status === 'cancelled') {
      return res.status(400).json({ error: 'Event is already cancelled' });
    }

    const startDate = new Date(event.start_date);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (startDate <= currentDate) {
      return res.status(400).json({ error: 'Cannot cancel past or ongoing events' });
    }

    await pool.query(
      'UPDATE Event SET approval_status = $1 WHERE event_id = $2',
      ['cancelled', event_id]
    );

    res.status(200).json({ message: 'Event cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateEventDates = async (req, res) => {
  const { event_id } = req.params;
  const { role } = req.user;
  const { start_date, end_date } = req.body;

  try {
    // Check if user is admin
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update event dates' });
    }

    // Fetch event details
    const eventResult = await pool.query(
      'SELECT start_date, end_date, approval_status FROM Event WHERE event_id = $1',
      [event_id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventResult.rows[0];

    // Check if event status is pending or approved
    if (!['pending', 'approved'].includes(event.approval_status)) {
      return res.status(400).json({ error: 'Can only update dates for pending or approved events' });
    }

    // Validate new dates
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const newStartDate = start_date ? new Date(start_date) : new Date(event.start_date);
    const newEndDate = end_date ? new Date(end_date) : new Date(event.end_date);

    if (start_date && newStartDate < currentDate) {
      return res.status(400).json({ error: 'Start date must be in the future' });
    }
    if (end_date && newEndDate < currentDate) {
      return res.status(400).json({ error: 'End date must be in the future' });
    }
    if (start_date && end_date && newEndDate < newStartDate) {
      return res.status(400).json({ error: 'End date must be on or after start date' });
    }

    // Update dates
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (start_date) {
      updateFields.push(`start_date = $${paramIndex++}`);
      updateValues.push(start_date);
    }
    if (end_date) {
      updateFields.push(`end_date = $${paramIndex++}`);
      updateValues.push(end_date);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No dates provided to update' });
    }

    updateValues.push(event_id);
    const query = `UPDATE Event SET ${updateFields.join(', ')} WHERE event_id = $${paramIndex}`;
    await pool.query(query, updateValues);

    res.status(200).json({ message: 'Event dates updated successfully' });
  } catch (err) {
    console.error('Update dates error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { updateEventDates, getMyEvents, requestEvent, getBookedDates, uploadApproval, getEventDetails, generateEventPdf, getPendingEvents, getAllEvents, cancelEvent };