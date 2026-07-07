import mongoose, { Document, Query } from 'mongoose';

export interface PaginationResult<T> {
  results: T[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
}

export class QueryBuilder<T extends Document> {
  private query: Query<T[], T>;
  private countQuery: Query<number, T>;
  private queryParams: Record<string, string>;
  private filterObj: Record<string, unknown> = {};

  constructor(query: Query<T[], T>, queryParams: Record<string, string>) {
    this.query = query;
    this.countQuery = query.model.countDocuments();
    this.queryParams = queryParams;
  }

  search(fields: string[]): this {
    const searchTerm = this.queryParams.search;
    if (searchTerm && searchTerm.trim()) {
      const regex = new RegExp(searchTerm.trim(), 'i');
      this.filterObj.$or = fields.map((field) => ({ [field]: regex }));
    }
    return this;
  }

  filter(allowed: string[]): this {
    allowed.forEach((field) => {
      if (this.queryParams[field]) {
        this.filterObj[field] = this.queryParams[field];
      }
    });
    return this;
  }

  dateRange(field = 'createdAt'): this {
    const { from, to } = this.queryParams;
    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.$gte = new Date(from);
      if (to) dateFilter.$lte = new Date(to);
      this.filterObj[field] = dateFilter;
    }
    return this;
  }

  sort(defaultSort = '-createdAt'): this {
    let sort = defaultSort;
    if (this.queryParams.sortBy) {
      const sortingCriteria: string[] = [];
      this.queryParams.sortBy.split(',').forEach((sortOption) => {
        const [key, order] = sortOption.split(':');
        if (key) {
          sortingCriteria.push((order === 'desc' ? '-' : '') + key);
        }
      });
      if (sortingCriteria.length > 0) {
        sort = sortingCriteria.join(' ');
      }
    }
    this.query = this.query.sort(sort);
    return this;
  }

  paginate(): this {
    const limit =
      this.queryParams.limit && parseInt(this.queryParams.limit, 10) > 0
        ? parseInt(this.queryParams.limit, 10)
        : 10;
    const page =
      this.queryParams.page && parseInt(this.queryParams.page, 10) > 0
        ? parseInt(this.queryParams.page, 10)
        : 1;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  applyFilter(): this {
    this.query = this.query.find(this.filterObj);
    this.countQuery = this.query.model.countDocuments(this.filterObj);
    return this;
  }

  async execute(): Promise<PaginationResult<T>> {
    const limit =
      this.queryParams.limit && parseInt(this.queryParams.limit, 10) > 0
        ? parseInt(this.queryParams.limit, 10)
        : 10;
    const page =
      this.queryParams.page && parseInt(this.queryParams.page, 10) > 0
        ? parseInt(this.queryParams.page, 10)
        : 1;

    const [totalResults, results] = await Promise.all([
      this.countQuery.exec(),
      this.query.exec(),
    ]);

    const totalPages = Math.ceil(totalResults / limit);

    return {
      results,
      pagination: {
        page,
        limit,
        totalPages,
        totalResults,
      },
    };
  }
}

export default QueryBuilder;
