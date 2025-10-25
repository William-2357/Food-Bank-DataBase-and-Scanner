const { sql } = require('@vercel/postgres');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { barcode, search, limit = 100, offset = 0 } = req.query;

      let query = 'SELECT * FROM foods';
      let conditions = [];
      let params = [];

      if (barcode) {
        conditions.push('barcode = $' + (params.length + 1));
        params.push(barcode);
      }

      if (search) {
        conditions.push('(name ILIKE $' + (params.length + 1) + ' OR brand ILIKE $' + (params.length + 1) + ' OR category::text ILIKE $' + (params.length + 1) + ')');
        params.push(`%${search}%`);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY created_at DESC';
      query += ' LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
      params.push(parseInt(limit), parseInt(offset));

      const result = await sql.query(query, params);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM foods';
      if (conditions.length > 0) {
        countQuery += ' WHERE ' + conditions.join(' AND ');
      }
      const countResult = await sql.query(countQuery, params.slice(0, -2));
      const totalCount = parseInt(countResult.rows[0].count);

      res.status(200).json({
        success: true,
        data: result.rows,
        count: result.rows.length,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + result.rows.length) < totalCount
        }
      });

    } else if (req.method === 'DELETE') {
      const { id, barcode } = req.query;

      if (!id && !barcode) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Either id or barcode parameter is required'
        });
      }

      let query, params;
      if (id) {
        query = 'DELETE FROM foods WHERE id = $1 RETURNING *';
        params = [id];
      } else {
        query = 'DELETE FROM foods WHERE barcode = $1 RETURNING *';
        params = [barcode];
      }

      const result = await sql.query(query, params);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'No food items found with the specified criteria'
        });
      }

      res.status(200).json({
        success: true,
        message: `Deleted ${result.rows.length} food item(s)`,
        deletedItems: result.rows.length
      });

    } else {
      res.status(405).json({
        success: false,
        error: 'Method Not Allowed',
        message: 'Only GET and DELETE methods are allowed'
      });
    }

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing the request'
    });
  }
}