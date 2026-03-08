export type SupabaseResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

type RequestOptions = {
  orderBy?: string;
  ascending?: boolean;
};

class QueryBuilder<T extends Record<string, unknown>> {
  private readonly table: string;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly columns: string;
  private readonly options: RequestOptions;

  constructor(table: string, baseUrl: string, apiKey: string, columns = '*', options: RequestOptions = {}) {
    this.table = table;
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.columns = columns;
    this.options = options;
  }

  order(column: string, config: { ascending?: boolean } = {}) {
    return new QueryBuilder<T>(
      this.table,
      this.baseUrl,
      this.apiKey,
      this.columns,
      {
        ...this.options,
        orderBy: column,
        ascending: config.ascending ?? true,
      },
    );
  }

  async execute(): Promise<SupabaseResult<T>> {
    try {
      const url = new URL(`${this.baseUrl}/rest/v1/${this.table}`);
      url.searchParams.set('select', this.columns);

      if (this.options.orderBy) {
        const dir = this.options.ascending ? 'asc' : 'desc';
        url.searchParams.set('order', `${this.options.orderBy}.${dir}`);
      }

      const response = await fetch(url.toString(), {
        headers: {
          apikey: this.apiKey,
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        return {
          data: null,
          error: { message: `Supabase request failed with status ${response.status}` },
        };
      }

      const data = (await response.json()) as T[];
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: error instanceof Error ? error.message : 'Unknown request error' },
      };
    }
  }

  then<TResult1 = SupabaseResult<T>, TResult2 = never>(
    onfulfilled?: ((value: SupabaseResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

class TableBuilder {
  private readonly table: string;
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(table: string, baseUrl: string, apiKey: string) {
    this.table = table;
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  select(columns = '*') {
    return new QueryBuilder<Record<string, unknown>>(this.table, this.baseUrl, this.apiKey, columns);
  }
}

export function createClient(url: string, key: string) {
  return {
    from(table: string) {
      return new TableBuilder(table, url, key);
    },
  };
}
