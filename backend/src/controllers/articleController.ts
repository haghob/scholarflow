import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { ArticleFilters } from '../types/article.types';

// @desc    Get all articles with filters
// @route   GET /api/v1/articles
// @access  Public
export const getArticles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      search,
      source,
      startDate,
      endDate,
      minCitations,
      researchFields,
      openAccessOnly,
      page = '1',
      limit = '20',
    } = req.query as Record<string, string>;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(
        `(title ILIKE $${paramIndex} OR abstract ILIKE $${paramIndex})`
      );
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (source) {
      whereConditions.push(`source_id = $${paramIndex}`);
      queryParams.push(source);
      paramIndex++;
    }

    if (startDate) {
      whereConditions.push(`publication_date >= $${paramIndex}`);
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereConditions.push(`publication_date <= $${paramIndex}`);
      queryParams.push(endDate);
      paramIndex++;
    }

    if (minCitations) {
      whereConditions.push(`citations_count >= $${paramIndex}`);
      queryParams.push(parseInt(minCitations));
      paramIndex++;
    }

    if (openAccessOnly === 'true') {
      whereConditions.push(`is_open_access = true`);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM articles ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].count);

    // Get articles
    queryParams.push(parseInt(limit), offset);
    const articlesResult = await query(
      `SELECT 
        id, source_id, external_id, title, abstract, authors, 
        publication_date, journal, doi, pdf_url, external_url, 
        citations_count, keywords, research_fields, is_open_access,
        created_at, updated_at
       FROM articles 
       ${whereClause}
       ORDER BY publication_date DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      queryParams
    );

    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        articles: articlesResult.rows,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
      },
    });
  } catch (error) {
    logger.error('Error getting articles:', error);
    next(error);
  }
};

// @desc    Get article by ID
// @route   GET /api/v1/articles/:id
// @access  Public
export const getArticleById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        a.*, s.name as source_name
       FROM articles a
       LEFT JOIN sources s ON a.source_id = s.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Article not found', 404));
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Error getting article:', error);
    next(error);
  }
};

// @desc    Get sources
// @route   GET /api/v1/articles/sources
// @access  Public
export const getSources = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await query(
      'SELECT id, name, base_url FROM sources WHERE is_active = true ORDER BY name'
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    logger.error('Error getting sources:', error);
    next(error);
  }
};